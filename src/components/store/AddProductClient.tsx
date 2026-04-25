"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardShell, { PURPLE } from "../dashboard/DashboardShell";
import {
  IconCart,
  IconChevronLeft,
  IconFolder,
  IconPencil,
  IconPlusSm,
  IconSliders,
  IconStoreTab,
} from "../dashboard/dashboardIcons";
import { API_PRODUCTS_BASE } from "../../lib/api";
import { DISPLAY_STORE_DOMAIN, publicStoreUrl } from "../../lib/publicStorePath";

const TITLE_MAX = 50;
const SUB_MAX = 100;
const BTN_MAX = 30;
const DESC_MAX = 8000;
const BOTTOM_TITLE_MAX = 80;
const PURCHASE_CTA_MAX = 30;
const CONFIRMATION_SUBJECT_MAX = 200;
const CONFIRMATION_BODY_MAX = 8000;

const DEFAULT_CONFIRMATION_SUBJECT =
  "Your order from @`My Username` is here!";
const DEFAULT_CONFIRMATION_BODY = `Hi \`Customer Name\`!

Thank you for ordering \`Product Name\`! Here is your order:
\`Product File(s)\`

- @\`My Username\``;

const LS_KEY = "yash-product-draft-v2";

/** Time to show toast before navigating to My Store */
const TOAST_THEN_NAV_MS = 2000;

function buildDefaultDescriptionBody(subtitleLine: string) {
  const sub = subtitleLine.trim();
  return `${sub ? `${sub}\n\n` : ""}This [Template/eBook/Course] will teach you everything you need to achieve your goals.

This guide is for you if you're looking to:
- Achieve your Dream
- Find Meaning in Your Work
- Be Happy`;
}

type ProductFormErrors = {
  listingImage?: string;
  title?: string;
  subtitle?: string;
  button?: string;
  descriptionBody?: string;
  bottomTitle?: string;
  purchaseCta?: string;
  price?: string;
  discountPrice?: string;
  digitalFile?: string;
  digitalRedirect?: string;
  customFields?: string;
  confirmationSubject?: string;
  confirmationBody?: string;
  availability?: string;
  availabilityMeetingLocation?: string;
  availabilityTimeZone?: string;
  availabilityDuration?: string;
  availabilityPreventHours?: string;
  availabilityMaxAttendees?: string;
  availabilityBookWithinDays?: string;
  availabilityDays?: string;
};

type ReviewItem = {
  id: string;
  name: string;
  text: string;
  imageDataUrl: string | null;
};

function validateUrlHttp(u: string): boolean {
  const t = u.trim();
  if (!t) return false;
  try {
    const p = new URL(t);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch {
    return false;
  }
}

function validateThumbnailTab(
  thumbnailDataUrl: string | null,
  title: string,
  subtitle: string,
  buttonText: string,
): ProductFormErrors {
  const e: ProductFormErrors = {};
  if (!thumbnailDataUrl) e.listingImage = "Please upload a listing thumbnail image.";
  if (!title.trim()) e.title = "Title is required.";
  if (!subtitle.trim()) e.subtitle = "Subtitle is required.";
  if (!buttonText.trim()) e.button = "Button text is required.";
  return e;
}

function thumbnailTabHasErrors(e: ProductFormErrors): boolean {
  return Boolean(e.listingImage || e.title || e.subtitle || e.button);
}

/** Thumbnail + checkout + digital delivery (used before Options / full publish). */
function validateListingAndCheckout(
  thumbnailDataUrl: string | null,
  title: string,
  subtitle: string,
  buttonText: string,
  descriptionBody: string,
  bottomTitle: string,
  purchaseCta: string,
  price: number,
  discountEnabled: boolean,
  discountPrice: number,
  digitalDelivery: "upload" | "redirect",
  digitalFileName: string | null,
  digitalRedirectUrl: string,
  customCheckoutFields: string[],
  skipDigitalDeliveryValidation = false,
): ProductFormErrors {
  const e: ProductFormErrors = {};
  const thumb = validateThumbnailTab(thumbnailDataUrl, title, subtitle, buttonText);
  Object.assign(e, thumb);
  if (!descriptionBody.trim()) e.descriptionBody = "Description is required.";
  if (!bottomTitle.trim()) e.bottomTitle = "Bottom title is required.";
  if (!purchaseCta.trim()) e.purchaseCta = "Purchase button text is required.";
  if (!Number.isFinite(price) || price < 0) e.price = "Enter a valid price (0 or greater).";
  if (discountEnabled) {
    if (!Number.isFinite(discountPrice) || discountPrice <= 0) {
      e.discountPrice = "Enter a discount price greater than 0.";
    } else if (discountPrice >= price) {
      e.discountPrice = "Discount must be less than the list price.";
    }
  }
  if (!skipDigitalDeliveryValidation) {
    if (digitalDelivery === "upload") {
      if (!digitalFileName?.trim()) e.digitalFile = "Upload a digital product file or use Redirect to URL.";
    } else if (!validateUrlHttp(digitalRedirectUrl)) {
      e.digitalRedirect = "Enter a valid URL starting with https:// or http://.";
    }
  }
  const badCustom = customCheckoutFields.some((f) => !String(f).trim());
  if (badCustom) e.customFields = "Each custom checkout field must have a label.";
  return e;
}

function validatePublishTab(
  thumbnailDataUrl: string | null,
  title: string,
  subtitle: string,
  buttonText: string,
  descriptionBody: string,
  bottomTitle: string,
  purchaseCta: string,
  price: number,
  discountEnabled: boolean,
  discountPrice: number,
  digitalDelivery: "upload" | "redirect",
  digitalFileName: string | null,
  digitalRedirectUrl: string,
  customCheckoutFields: string[],
  confirmationSubject: string,
  confirmationBody: string,
  skipDigitalDeliveryValidation = false,
): ProductFormErrors {
  const e = validateListingAndCheckout(
    thumbnailDataUrl,
    title,
    subtitle,
    buttonText,
    descriptionBody,
    bottomTitle,
    purchaseCta,
    price,
    discountEnabled,
    discountPrice,
    digitalDelivery,
    digitalFileName,
    digitalRedirectUrl,
    customCheckoutFields,
    skipDigitalDeliveryValidation,
  );
  if (!confirmationSubject.trim()) e.confirmationSubject = "Confirmation email subject is required.";
  const bodyTrim = confirmationBody.trim();
  if (!bodyTrim) e.confirmationBody = "Confirmation email body is required.";
  else if (!confirmationBody.includes("Product File(s)")) {
    e.confirmationBody =
      "Include the Product File(s) placeholder so buyers know how to access their download.";
  }
  return e;
}

function publishHasErrors(e: ProductFormErrors): boolean {
  return Object.values(e).some(Boolean);
}

function optionsTabHasErrors(e: ProductFormErrors): boolean {
  return Boolean(e.confirmationSubject || e.confirmationBody);
}

function validateAvailabilityTab(
  meetingLocation: string,
  timeZone: string,
  durationMins: string,
  preventBookingHours: string,
  maxAttendees: string,
  bookWithinDays: string,
  activeAvailabilityDays: string[],
): ProductFormErrors {
  const e: ProductFormErrors = {};
  const preventN = Number(preventBookingHours);
  const attendeesN = Number(maxAttendees);
  const withinN = Number(bookWithinDays);
  const validLocations = ["Google Meet", "Zoom Meeting", "Custom Location", "Default"];
  if (!meetingLocation.trim() || !validLocations.includes(meetingLocation)) {
    e.availabilityMeetingLocation = "Select a valid meeting location.";
  }
  if (!timeZone.trim()) e.availabilityTimeZone = "Time zone is required.";
  if (!durationMins.trim()) e.availabilityDuration = "Duration is required.";
  if (!Number.isFinite(preventN) || preventN < 0) e.availabilityPreventHours = "Use 0 or greater.";
  if (!Number.isFinite(attendeesN) || attendeesN < 1) e.availabilityMaxAttendees = "Must be at least 1.";
  if (!Number.isFinite(withinN) || withinN < 1) e.availabilityBookWithinDays = "Must be at least 1.";
  if (!activeAvailabilityDays.length) e.availabilityDays = "Select at least one available day.";
  if (
    e.availabilityTimeZone ||
    e.availabilityMeetingLocation ||
    e.availabilityDuration ||
    e.availabilityPreventHours ||
    e.availabilityMaxAttendees ||
    e.availabilityBookWithinDays ||
    e.availabilityDays
  ) {
    e.availability = "Please complete required availability settings.";
  }
  return e;
}

function insertIntoTextarea(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  insert: string,
): { next: string; caret: number } {
  const next = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
  return { next, caret: selectionStart + insert.length };
}

function wrapTextareaSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string,
): { next: string; caret: number } {
  const selected = value.slice(selectionStart, selectionEnd);
  const wrapped = before + selected + after;
  const next = value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd);
  const caret = selectionStart + wrapped.length;
  return { next, caret };
}

const PERSONALIZE_CHIPS: { label: string; value: string }[] = [
  { label: "Product Name", value: "`Product Name`" },
  { label: "Customer Name", value: "`Customer Name`" },
  { label: "Product File(s)", value: "`Product File(s)`" },
  { label: "My Username", value: "`My Username`" },
];

function IconEnvelopeOutline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m22 7.5-9.2 6.1a2 2 0 0 1-2.2 0L2 7.5" />
    </svg>
  );
}

function IconEnvelopeSend({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "text-slate-400"}
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4L22 2z" />
    </svg>
  );
}

type UserRow = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
};

type TabKey = "thumbnail" | "checkout" | "course" | "availability" | "options";
type StyleKey = "button" | "callout" | "preview";

type CheckoutJsonShape = {
  note?: string;
  price?: number;
  description_body?: string;
  bottom_title?: string;
  purchase_cta?: string;
  discount_enabled?: boolean;
  discount_price?: number;
  digital_delivery?: "upload" | "redirect";
  digital_redirect_url?: string;
  digital_file_name?: string | null;
  digital_file_data_url?: string | null;
  custom_fields?: string[];
  /** Hero image for checkout preview (data URL or remote). Listing uses `thumbnail_url`. */
  checkout_image_url?: string | null;
};

type ProductApi = {
  id: string;
  status?: string;
  active_tab: TabKey;
  style: StyleKey;
  title: string;
  subtitle: string;
  button_text: string;
  price_numeric: number;
  thumbnail_url: string | null;
  checkout_json: CheckoutJsonShape & Record<string, unknown>;
  options_json: Record<string, unknown>;
};


function ProductLivePreview({
  style,
  imageUrl,
  title,
  subtitle,
  buttonText,
  price,
  fileLabel,
}: {
  style: StyleKey;
  imageUrl: string | null;
  title: string;
  subtitle: string;
  buttonText: string;
  price: number;
  fileLabel: string | null;
}) {
  const wrap = style === "button" ? "max-w-[260px]" : style === "preview" ? "max-w-[280px]" : "max-w-[280px]";
  return (
    <div className={`mx-auto w-full ${wrap}`}>
      <div
        className={`rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.08)] ${
          style === "callout" ? "border border-slate-200" : ""
        }`}
      >
        <div className="flex justify-center">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
              <IconFolder className="h-12 w-12" />
              {fileLabel ? (
                <span className="absolute bottom-0 left-0 right-0 truncate rounded-b-xl bg-black/50 px-1 text-[9px] text-white">
                  {fileLabel}
                </span>
              ) : null}
            </div>
          )}
        </div>
        <h3 className="mt-4 text-center text-base font-bold leading-snug text-slate-900">
          {title || "Title"}
        </h3>
        <p className="mt-2 text-center text-sm text-slate-500">{subtitle || "Subtitle"}</p>
        <p className="mt-3 text-center text-lg font-bold" style={{ color: PURPLE }}>
          ${price.toFixed(2)}
        </p>
        {style === "preview" ? (
          <p className="mt-2 text-center text-xs font-medium text-violet-600">Ready To Download</p>
        ) : null}
        <button
          type="button"
          className="mt-4 w-full rounded-full py-3.5 text-[15px] font-bold text-white"
          style={{ backgroundColor: PURPLE }}
        >
          {buttonText || "Button"}
        </button>
        <p className="mt-3 text-center">
          <button type="button" className="text-sm font-semibold" style={{ color: PURPLE }}>
            Learn More
          </button>
        </p>
      </div>
    </div>
  );
}

function DescriptionPreview({ text }: { text: string }) {
  const trimmed = text.trim();
  if (!trimmed) {
    return <p className="mt-2 text-sm text-slate-400">Description appears here.</p>;
  }
  const blocks = trimmed.split(/\n\s*\n/);
  return (
    <div className="mt-3 space-y-2 text-left">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const bulletLines = lines.filter(
          (l) => l.startsWith("- ") || l.startsWith("• ") || l.startsWith("* ")
        );
        const isBullet =
          lines.length > 0 && bulletLines.length === lines.length && lines.length > 0;
        if (isBullet) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-4 text-[13px] leading-snug text-slate-700">
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^[-•*]\s*/, "")}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-[13px] leading-relaxed text-slate-700">
            {block}
          </p>
        );
      })}
    </div>
  );
}

function CheckoutMobilePreview({
  heroUrl,
  title,
  descriptionBody,
  listPrice,
  payPrice,
  showDiscount,
  bottomTitle,
  purchaseCta,
  customFieldLabels,
}: {
  heroUrl: string | null;
  title: string;
  descriptionBody: string;
  listPrice: number;
  payPrice: number;
  showDiscount: boolean;
  bottomTitle: string;
  purchaseCta: string;
  customFieldLabels: string[];
}) {
  return (
    <div className="mx-auto w-full max-w-[min(20rem,100%)]">
      <div
        className="overflow-hidden rounded-[2rem] border-[10px] border-[#1e1648] bg-white shadow-[0_20px_50px_rgba(15,23,42,.12)]"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}
      >
        <div className="border-b border-slate-100 bg-white px-3 py-2.5">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600"
            aria-label="Back"
          >
            <IconChevronLeft className="h-4 w-4 opacity-80" />
          </button>
        </div>
        <div className="max-h-[min(520px,70vh)] overflow-y-auto px-4 pb-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="overflow-hidden rounded-[2rem] bg-slate-100">
            {heroUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroUrl} alt="" className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-36 w-full items-center justify-center bg-slate-200">
                <IconFolder className="h-16 w-16 text-slate-400" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-center text-[17px] font-bold leading-snug text-slate-900">
            {title || "Product title"}
          </h2>
          <div className="mt-2 text-center">
            {showDiscount && payPrice < listPrice ? (
              <p className="text-sm text-slate-400 line-through">${listPrice.toFixed(2)}</p>
            ) : null}
            <p className="text-xl font-bold" style={{ color: PURPLE }}>
              ${payPrice.toFixed(2)}
            </p>
          </div>
          <DescriptionPreview text={descriptionBody} />
          {bottomTitle ? (
            <p className="mt-5 text-center text-[15px] font-bold text-slate-900">{bottomTitle}</p>
          ) : null}
          <div className="mt-4 space-y-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
              Enter your name
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
              Enter your email
            </div>
            {customFieldLabels.map((label, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400"
              >
                {label || `Field ${idx + 1}`}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
            <span>Total</span>
            <span className="font-semibold text-slate-800">US${payPrice.toFixed(2)}</span>
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-full py-3.5 text-[15px] font-bold text-white"
            style={{ backgroundColor: PURPLE }}
          >
            {purchaseCta || "PURCHASE"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddProductClient({
  user,
  onSignOut,
}: {
  user: UserRow;
  onSignOut: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handle = (user.username || "creator").trim();
  const displayName = user.full_name?.trim() || handle.charAt(0).toUpperCase() + handle.slice(1);
  const showName = handle.charAt(0).toUpperCase() + handle.slice(1);

  const [activeTab, setActiveTab] = useState<TabKey>("thumbnail");
  const [style, setStyle] = useState<StyleKey>("callout");
  const [title, setTitle] = useState("Get started with this amazing course");
  const [subtitle, setSubtitle] = useState("A 2-line course summary to close the sale. What will they learn?");
  const [buttonText, setButtonText] = useState("GET MY COURSE");
  const [price, setPrice] = useState(9.99);
  const [checkoutNote, setCheckoutNote] = useState("");
  const [optionsNote, setOptionsNote] = useState("");
  const [timeZone, setTimeZone] = useState("IST - Kolkata, Calcutta | UTC +5.5");
  const [meetingLocation, setMeetingLocation] = useState("Default");
  const [durationMins, setDurationMins] = useState("30 min");
  const [preventBookingHours, setPreventBookingHours] = useState("12");
  const [maxAttendees, setMaxAttendees] = useState("1");
  const [beforeMeetingEnabled, setBeforeMeetingEnabled] = useState(false);
  const [afterMeetingEnabled, setAfterMeetingEnabled] = useState(false);
  const [beforeMeetingMins, setBeforeMeetingMins] = useState("15 min");
  const [afterMeetingMins, setAfterMeetingMins] = useState("15 min");
  const [bookWithinDays, setBookWithinDays] = useState("60");
  const [activeAvailabilityDays, setActiveAvailabilityDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const [blockDatesOpen, setBlockDatesOpen] = useState(false);
  const [blockMonth, setBlockMonth] = useState<Date>(new Date(2026, 3, 1));
  const [selectedBlockDate, setSelectedBlockDate] = useState<string>("2026-04-24");
  const [blockTimeOpen, setBlockTimeOpen] = useState(false);
  const [blockFromDate, setBlockFromDate] = useState("Apr 24, 2026");
  const [blockToDate, setBlockToDate] = useState("Apr 24, 2026");
  const [blockFromTime, setBlockFromTime] = useState("9:00 PM");
  const [blockToTime, setBlockToTime] = useState("10:00 PM");
  const [blockedSlots, setBlockedSlots] = useState<
    { dateIso: string; from: string; to: string }[]
  >([]);
  const [blockToast, setBlockToast] = useState<string | null>(null);
  const [addReviewsOpen, setAddReviewsOpen] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [emailFlowsOpen, setEmailFlowsOpen] = useState(false);
  const [orderBumpOpen, setOrderBumpOpen] = useState(false);
  const [affiliateShareOpen, setAffiliateShareOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [emailFlowIds, setEmailFlowIds] = useState<string[]>([]);
  const [confirmationSubject, setConfirmationSubject] = useState(DEFAULT_CONFIRMATION_SUBJECT);
  const [confirmationBody, setConfirmationBody] = useState(DEFAULT_CONFIRMATION_BODY);
  const confirmationBodyRef = useRef<HTMLTextAreaElement>(null);
  const confirmationSubjectRef = useRef<HTMLInputElement>(null);

  const [descriptionBody, setDescriptionBody] = useState("");
  const [bottomTitle, setBottomTitle] = useState("Get My Course");
  const [purchaseCta, setPurchaseCta] = useState("PURCHASE");
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [digitalDelivery, setDigitalDelivery] = useState<"upload" | "redirect">("upload");
  const [digitalRedirectUrl, setDigitalRedirectUrl] = useState("");
  const [digitalFileName, setDigitalFileName] = useState<string | null>(null);
  const [digitalFileDataUrl, setDigitalFileDataUrl] = useState<string | null>(null);
  const [customCheckoutFields, setCustomCheckoutFields] = useState<string[]>([]);

  /** Saved as `thumbnail_url` — My Store listing & thumbnail-tab card. */
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  /** Saved in `checkout_json.checkout_image_url` — checkout preview (falls back to listing thumb if unset). */
  const [checkoutImageDataUrl, setCheckoutImageDataUrl] = useState<string | null>(null);
  const [thumbnailImageFileName, setThumbnailImageFileName] = useState<string | null>(null);
  const [checkoutImageFileName, setCheckoutImageFileName] = useState<string | null>(null);
  /** Digital attachment name for options / preview badge (not the listing image). */
  const [fileLabel, setFileLabel] = useState<string | null>(null);

  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const checkoutHeroFileRef = useRef<HTMLInputElement>(null);
  const digitalFileRef = useRef<HTMLInputElement>(null);

  const [productId, setProductId] = useState<string | null>(null);
  const [listingStatus, setListingStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [productFormErrors, setProductFormErrors] = useState<ProductFormErrors>({});

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const ensureCheckoutDefaults = useCallback(() => {
    setDescriptionBody((prev) =>
      prev.trim() ? prev : buildDefaultDescriptionBody(subtitle)
    );
    setBottomTitle((prev) => (prev.trim() ? prev : buttonText));
    setPurchaseCta((prev) => (prev.trim() ? prev : "PURCHASE"));
  }, [subtitle, buttonText]);

  const persistLocal = useCallback(() => {
    const payload = {
      productId,
      listingStatus,
      activeTab,
      style,
      title,
      subtitle,
      buttonText,
      price,
      checkoutNote,
      optionsNote,
      emailFlowIds,
      confirmationSubject,
      confirmationBody,
      descriptionBody,
      bottomTitle,
      purchaseCta,
      discountEnabled,
      discountPrice,
      digitalDelivery,
      digitalRedirectUrl,
      digitalFileName,
      digitalFileDataUrl,
      customCheckoutFields,
      thumbnailDataUrl,
      checkoutImageDataUrl,
      fileLabel,
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch {
      /* quota */
    }
  }, [
    productId,
    listingStatus,
    activeTab,
    style,
    title,
    subtitle,
    buttonText,
    price,
    checkoutNote,
    optionsNote,
    emailFlowIds,
    confirmationSubject,
    confirmationBody,
    descriptionBody,
    bottomTitle,
    purchaseCta,
    discountEnabled,
    discountPrice,
    digitalDelivery,
    digitalRedirectUrl,
    digitalFileName,
    digitalFileDataUrl,
    customCheckoutFields,
    thumbnailDataUrl,
    checkoutImageDataUrl,
    fileLabel,
  ]);

  useEffect(() => {
    persistLocal();
  }, [persistLocal]);

  const applyProduct = useCallback((p: ProductApi) => {
    setProductId(p.id);
    setListingStatus(p.status === "published" ? "published" : "draft");
    const tab = p.active_tab;
    setActiveTab(
      tab === "thumbnail" || tab === "checkout" || tab === "course" || tab === "options" ? tab : "thumbnail"
    );
    setStyle(p.style === "button" || p.style === "callout" || p.style === "preview" ? p.style : "callout");
    setTitle(p.title || "");
    setSubtitle(p.subtitle || "");
    setButtonText(p.button_text || "");
    setPrice(Number(p.price_numeric) || 9.99);
    if (p.thumbnail_url) {
      setThumbnailDataUrl(p.thumbnail_url);
    } else {
      setThumbnailDataUrl(null);
    }
    const cj = p.checkout_json as CheckoutJsonShape;
    if (typeof cj?.checkout_image_url === "string" && cj.checkout_image_url.length > 0) {
      setCheckoutImageDataUrl(cj.checkout_image_url);
    } else {
      setCheckoutImageDataUrl(null);
    }
    if (typeof cj?.note === "string") setCheckoutNote(cj.note);
    if (cj?.price != null) setPrice(Number(cj.price));
    if (typeof cj.description_body === "string") setDescriptionBody(cj.description_body);
    if (typeof cj.bottom_title === "string") setBottomTitle(cj.bottom_title);
    if (typeof cj.purchase_cta === "string") setPurchaseCta(cj.purchase_cta);
    if (typeof cj.discount_enabled === "boolean") setDiscountEnabled(cj.discount_enabled);
    if (cj.discount_price != null) setDiscountPrice(Number(cj.discount_price));
    if (cj.digital_delivery === "upload" || cj.digital_delivery === "redirect") {
      setDigitalDelivery(cj.digital_delivery);
    }
    if (typeof cj.digital_redirect_url === "string") setDigitalRedirectUrl(cj.digital_redirect_url);
    if (typeof cj.digital_file_name === "string") setDigitalFileName(cj.digital_file_name);
    if (typeof cj.digital_file_data_url === "string") {
      setDigitalFileDataUrl(cj.digital_file_data_url);
    }
    if (Array.isArray(cj.custom_fields) && cj.custom_fields.every((x) => typeof x === "string")) {
      setCustomCheckoutFields(cj.custom_fields);
    }
    const oj = p.options_json as {
      note?: string;
      attached_file_name?: string;
      confirmation_email?: { subject?: string; body?: string };
      email_flows?: { id?: string }[];
    };
    if (typeof oj?.note === "string") setOptionsNote(oj.note);
    if (typeof oj?.attached_file_name === "string") setFileLabel(oj.attached_file_name);
    const ce = oj?.confirmation_email;
    if (ce && typeof ce.subject === "string") setConfirmationSubject(ce.subject);
    else setConfirmationSubject(DEFAULT_CONFIRMATION_SUBJECT);
    if (ce && typeof ce.body === "string") setConfirmationBody(ce.body);
    else setConfirmationBody(DEFAULT_CONFIRMATION_BODY);
    if (Array.isArray(oj?.email_flows) && oj.email_flows.every((x) => x && typeof x.id === "string")) {
      setEmailFlowIds(oj.email_flows.map((x) => x.id as string));
    } else {
      setEmailFlowIds([]);
    }
    setProductFormErrors({});
  }, []);

  /* Load from URL ?id= */
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id || !token) return;
    let cancelled = false;
    setLoadError("");
    (async () => {
      try {
        const res = await fetch(`${API_PRODUCTS_BASE}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Could not load product.");
        if (cancelled || !data.product) return;
        applyProduct(data.product as ProductApi);
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Load failed.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, token, applyProduct]);

  /* New product (no ?id=): reset form so “Add Product” doesn’t reuse old local state */
  useEffect(() => {
    if (searchParams.get("id")) return;
    const kind = (searchParams.get("kind") || "").toLowerCase();
    const isCoaching = kind === "coaching";
    const isCustom = kind === "custom";
    setProductId(null);
    setListingStatus("draft");
    setActiveTab("thumbnail");
    setStyle("callout");
    setTitle(
      isCoaching
        ? "Book a 1:1 Call with Me"
        : isCustom
          ? "Personalized Video Response"
          : "Get started with this amazing course"
    );
    setSubtitle(
      isCoaching
        ? "Book a private coaching session with me!"
        : isCustom
          ? "I'll send you a custom video/product addressing your unique request!"
          : "A 2-line course summary to close the sale. What will they learn?"
    );
    setButtonText(
      isCoaching ? "Book a 1:1 Call with Me" : isCustom ? "Submit Your Request" : "GET MY COURSE"
    );
    setPrice(9.99);
    setCheckoutNote("");
    setOptionsNote("");
    setTimeZone("IST - Kolkata, Calcutta | UTC +5.5");
    setMeetingLocation("Default");
    setDurationMins("30 min");
    setPreventBookingHours("12");
    setMaxAttendees("1");
    setBeforeMeetingEnabled(false);
    setAfterMeetingEnabled(false);
    setBeforeMeetingMins("15 min");
    setAfterMeetingMins("15 min");
    setBookWithinDays("60");
    setActiveAvailabilityDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    setAddReviewsOpen(false);
    setReviews([]);
    setEmailFlowsOpen(false);
    setOrderBumpOpen(false);
    setAffiliateShareOpen(false);
    setConfirmationOpen(false);
    setEmailFlowIds([]);
    setConfirmationSubject(DEFAULT_CONFIRMATION_SUBJECT);
    setConfirmationBody(DEFAULT_CONFIRMATION_BODY);
    setDescriptionBody("");
    setBottomTitle(isCustom ? "Get Your Video!" : "Get My Course");
    setPurchaseCta("PURCHASE");
    setDiscountEnabled(false);
    setDiscountPrice(0);
    setDigitalDelivery("upload");
    setDigitalRedirectUrl("");
    setDigitalFileName(null);
    setDigitalFileDataUrl(null);
    setCustomCheckoutFields([]);
    setThumbnailDataUrl(null);
    setCheckoutImageDataUrl(null);
    setThumbnailImageFileName(null);
    setCheckoutImageFileName(null);
    setFileLabel(null);
    setLoadError("");
    setSaveMsg("");
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  const buildBody = useCallback((saveStatus: "draft" | "published") => {
    return {
      id: productId || undefined,
      status: saveStatus,
      active_tab: activeTab === "availability" || activeTab === "course" ? "checkout" : activeTab,
      style,
      title: title.slice(0, TITLE_MAX),
      subtitle: subtitle.slice(0, SUB_MAX),
      button_text: buttonText.slice(0, BTN_MAX),
      price_numeric: price,
      thumbnail_url: thumbnailDataUrl,
      checkout_json: {
        note: checkoutNote,
        price,
        description_body: descriptionBody.slice(0, DESC_MAX),
        bottom_title: bottomTitle.slice(0, BOTTOM_TITLE_MAX),
        purchase_cta: purchaseCta.slice(0, PURCHASE_CTA_MAX),
        discount_enabled: discountEnabled,
        discount_price: discountEnabled ? Number(discountPrice) || 0 : 0,
        digital_delivery: digitalDelivery,
        digital_redirect_url: digitalRedirectUrl,
        digital_file_name: digitalFileName,
        digital_file_data_url: digitalFileDataUrl,
        custom_fields: customCheckoutFields,
        checkout_image_url: checkoutImageDataUrl,
      },
      options_json: {
        note: optionsNote,
        availability: {
          meeting_location: meetingLocation,
          time_zone: timeZone,
          duration_mins: durationMins,
          prevent_booking_hours: preventBookingHours,
          max_attendees: maxAttendees,
          before_meeting_enabled: beforeMeetingEnabled,
          after_meeting_enabled: afterMeetingEnabled,
          before_meeting_mins: beforeMeetingMins,
          after_meeting_mins: afterMeetingMins,
          book_within_days: bookWithinDays,
          days: activeAvailabilityDays,
        },
        ...(fileLabel ? { attached_file_name: fileLabel } : {}),
        confirmation_email: {
          subject: confirmationSubject.slice(0, CONFIRMATION_SUBJECT_MAX),
          body: confirmationBody.slice(0, CONFIRMATION_BODY_MAX),
        },
        email_flows: emailFlowIds.map((id) => ({ id })),
      },
    };
  }, [
    productId,
    activeTab,
    style,
    title,
    subtitle,
    buttonText,
    price,
    thumbnailDataUrl,
    checkoutImageDataUrl,
    checkoutNote,
    optionsNote,
    timeZone,
    meetingLocation,
    durationMins,
    preventBookingHours,
    maxAttendees,
    beforeMeetingEnabled,
    afterMeetingEnabled,
    beforeMeetingMins,
    afterMeetingMins,
    bookWithinDays,
    activeAvailabilityDays,
    fileLabel,
    confirmationSubject,
    confirmationBody,
    emailFlowIds,
    descriptionBody,
    bottomTitle,
    purchaseCta,
    discountEnabled,
    discountPrice,
    digitalDelivery,
    digitalRedirectUrl,
    digitalFileName,
    digitalFileDataUrl,
    customCheckoutFields,
  ]);

  const saveToApi = useCallback(
    async (saveStatus: "draft" | "published" = "draft"): Promise<boolean> => {
      if (!token) return false;
      setSaving(true);
      setSaveMsg("");
      try {
        const res = await fetch(`${API_PRODUCTS_BASE}/draft`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildBody(saveStatus)),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Save failed.");
        const p = data.product as ProductApi;
        if (p?.id) {
          setProductId(p.id);
          setListingStatus(p.status === "published" ? "published" : "draft");
          const url = new URL(window.location.href);
          url.searchParams.set("id", p.id);
          router.replace(url.pathname + url.search, { scroll: false });
        }
        return true;
      } catch (e) {
        setSaveMsg(e instanceof Error ? e.message : "Save failed.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [token, buildBody, router]
  );

  const readImageFileAsDataUrl = (file: File): Promise<string | null> =>
    new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(null);
        return;
      }
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(file);
    });

  const onPickThumbnailFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setThumbnailImageFileName(file.name);
    void readImageFileAsDataUrl(file).then((u) => {
      setThumbnailDataUrl(u);
      if (u) setProductFormErrors((p) => ({ ...p, listingImage: undefined }));
    });
  };

  const onPickCheckoutHeroFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCheckoutImageFileName(file.name);
    void readImageFileAsDataUrl(file).then((u) => {
      setCheckoutImageDataUrl(u);
    });
  };

  const handleSaveDraft = async () => {
    const ok = await saveToApi("draft");
    if (!ok) return;
    setSaveMsg("");
    setToast("Draft saved. Taking you to My Store…");
    window.setTimeout(() => {
      setToast(null);
      router.push("/dashboard");
    }, TOAST_THEN_NAV_MS);
  };

  const goToCheckoutTab = () => {
    const e = validateThumbnailTab(thumbnailDataUrl, title, subtitle, buttonText);
    if (thumbnailTabHasErrors(e)) {
      setProductFormErrors((prev) => ({
        ...prev,
        listingImage: e.listingImage,
        title: e.title,
        subtitle: e.subtitle,
        button: e.button,
      }));
      setSaveMsg("");
      return;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      listingImage: undefined,
      title: undefined,
      subtitle: undefined,
      button: undefined,
    }));
    setSaveMsg("");
    ensureCheckoutDefaults();
    setActiveTab("checkout");
  };

  const goToOptionsTab = () => {
    const e = validateListingAndCheckout(
      thumbnailDataUrl,
      title,
      subtitle,
      buttonText,
      descriptionBody,
      bottomTitle,
      purchaseCta,
      price,
      discountEnabled,
      discountPrice,
      digitalDelivery,
      digitalFileName,
      digitalRedirectUrl,
      customCheckoutFields,
      true,
    );
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else setActiveTab("checkout");
      return;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      listingImage: undefined,
      title: undefined,
      subtitle: undefined,
      button: undefined,
      descriptionBody: undefined,
      bottomTitle: undefined,
      purchaseCta: undefined,
      price: undefined,
      discountPrice: undefined,
      digitalFile: undefined,
      digitalRedirect: undefined,
      customFields: undefined,
    }));
    setSaveMsg("");
    setActiveTab("options");
  };

  const goToAvailabilityTab = () => {
    const e = validateListingAndCheckout(
      thumbnailDataUrl,
      title,
      subtitle,
      buttonText,
      descriptionBody,
      bottomTitle,
      purchaseCta,
      price,
      discountEnabled,
      discountPrice,
      digitalDelivery,
      digitalFileName,
      digitalRedirectUrl,
      customCheckoutFields,
      true,
    );
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else setActiveTab("checkout");
      return;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      listingImage: undefined,
      title: undefined,
      subtitle: undefined,
      button: undefined,
      descriptionBody: undefined,
      bottomTitle: undefined,
      purchaseCta: undefined,
      price: undefined,
      discountPrice: undefined,
      digitalFile: undefined,
      digitalRedirect: undefined,
      customFields: undefined,
    }));
    setSaveMsg("");
    setActiveTab("availability");
  };

  const goToCourseTab = () => {
    const e = validateListingAndCheckout(
      thumbnailDataUrl,
      title,
      subtitle,
      buttonText,
      descriptionBody,
      bottomTitle,
      purchaseCta,
      price,
      discountEnabled,
      discountPrice,
      digitalDelivery,
      digitalFileName,
      digitalRedirectUrl,
      customCheckoutFields,
      true,
    );
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else setActiveTab("checkout");
      return;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      listingImage: undefined,
      title: undefined,
      subtitle: undefined,
      button: undefined,
      descriptionBody: undefined,
      bottomTitle: undefined,
      purchaseCta: undefined,
      price: undefined,
      discountPrice: undefined,
      digitalFile: undefined,
      digitalRedirect: undefined,
      customFields: undefined,
    }));
    setSaveMsg("");
    setActiveTab("course");
  };

  const goToOptionsFromAvailability = () => {
    const e = validateAvailabilityTab(
      meetingLocation,
      timeZone,
      durationMins,
      preventBookingHours,
      maxAttendees,
      bookWithinDays,
      activeAvailabilityDays,
    );
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      setActiveTab("availability");
      return;
    }
    setProductFormErrors((prev) => ({ ...prev, availability: undefined }));
    setSaveMsg("");
    setActiveTab("options");
  };

  const insertSubjectToken = (token: string) => {
    const el = confirmationSubjectRef.current;
    const v = confirmationSubject;
    const start = el?.selectionStart ?? v.length;
    const end = el?.selectionEnd ?? start;
    const { next, caret } = insertIntoTextarea(v, start, end, token);
    setConfirmationSubject(next.slice(0, CONFIRMATION_SUBJECT_MAX));
    setProductFormErrors((p) => ({ ...p, confirmationSubject: undefined }));
    queueMicrotask(() => {
      const a = confirmationSubjectRef.current;
      if (a) {
        a.focus();
        a.setSelectionRange(caret, caret);
      }
    });
  };

  const insertBodyToken = (token: string) => {
    const el = confirmationBodyRef.current;
    const v = confirmationBody;
    const start = el?.selectionStart ?? v.length;
    const end = el?.selectionEnd ?? start;
    const { next, caret } = insertIntoTextarea(v, start, end, token);
    setConfirmationBody(next.slice(0, CONFIRMATION_BODY_MAX));
    setProductFormErrors((p) => ({ ...p, confirmationBody: undefined }));
    queueMicrotask(() => {
      const a = confirmationBodyRef.current;
      if (a) {
        a.focus();
        a.setSelectionRange(caret, caret);
      }
    });
  };

  const wrapBodySelection = (before: string, after: string) => {
    const el = confirmationBodyRef.current;
    const v = confirmationBody;
    const start = el?.selectionStart ?? 0;
    const end = el?.selectionEnd ?? start;
    const { next, caret } = wrapTextareaSelection(v, start, end, before, after);
    setConfirmationBody(next.slice(0, CONFIRMATION_BODY_MAX));
    setProductFormErrors((p) => ({ ...p, confirmationBody: undefined }));
    queueMicrotask(() => {
      const a = confirmationBodyRef.current;
      if (a) {
        a.focus();
        a.setSelectionRange(caret, caret);
      }
    });
  };

  const handlePublish = async () => {
    const e = validatePublishTab(
      thumbnailDataUrl,
      title,
      subtitle,
      buttonText,
      descriptionBody,
      bottomTitle,
      purchaseCta,
      price,
      discountEnabled,
      discountPrice,
      digitalDelivery,
      digitalFileName,
      digitalRedirectUrl,
      customCheckoutFields,
      confirmationSubject,
      confirmationBody,
      true,
    );
    if (isCoachingCheckout) {
      const ae = validateAvailabilityTab(
        meetingLocation,
        timeZone,
        durationMins,
        preventBookingHours,
        maxAttendees,
        bookWithinDays,
        activeAvailabilityDays,
      );
      Object.assign(e, ae);
    }
    if (publishHasErrors(e)) {
      setProductFormErrors(e);
      setSaveMsg("Please fix the highlighted fields before publishing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else if (e.availability) setActiveTab("availability");
      else if (optionsTabHasErrors(e)) setActiveTab("options");
      else setActiveTab("checkout");
      return;
    }
    setProductFormErrors({});
    setSaveMsg("");
    const ok = await saveToApi("published");
    if (!ok) return;
    setSaveMsg("");
    setToast("Published! Your product is live. Taking you to My Store…");
    window.setTimeout(() => {
      setToast(null);
      router.push("/dashboard");
    }, TOAST_THEN_NAV_MS);
  };

  const tabClass = (t: TabKey) =>
    `flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
      activeTab === t
        ? "border-transparent text-white shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
    }`;

  /** Listing / Thumbnail & Options live preview */
  const listingImageUrl = thumbnailDataUrl;
  /** Checkout mobile preview: checkout hero, or listing thumb if none */
  const checkoutHeroPreviewUrl = checkoutImageDataUrl ?? thumbnailDataUrl;
  const isCoachingCheckout =
    (searchParams.get("kind") || "").toLowerCase() === "coaching" ||
    /1:1\s*call/i.test(buttonText) ||
    /coaching/i.test(subtitle);
  const isCustomCheckout =
    (searchParams.get("kind") || "").toLowerCase() === "custom" ||
    /submit your request/i.test(buttonText) ||
    /personalized video response/i.test(title);
  const isCourseCheckout =
    (searchParams.get("kind") || "").toLowerCase() === "course" ||
    /course/i.test(title) ||
    /course/i.test(subtitle) ||
    /get my course/i.test(buttonText);
  const isCustomThumbnail =
    (searchParams.get("kind") || "").toLowerCase() === "custom" ||
    /submit your request/i.test(buttonText) ||
    /personalized video response/i.test(title);
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthTitle = blockMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
  const monthStart = new Date(blockMonth.getFullYear(), blockMonth.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(1 - monthStart.getDay());
  const monthCells = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { iso, day: d.getDate(), inMonth: d.getMonth() === blockMonth.getMonth() };
  });
  const parseUiDateToIso = (txt: string): string | null => {
    const d = new Date(txt);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const handleSaveBlockedTime = () => {
    const iso = parseUiDateToIso(blockFromDate) || selectedBlockDate;
    const slot = { dateIso: iso, from: blockFromTime, to: blockToTime };
    setBlockedSlots((prev) => {
      const dedup = prev.filter((x) => !(x.dateIso === slot.dateIso && x.from === slot.from && x.to === slot.to));
      return [...dedup, slot];
    });
    setSelectedBlockDate(iso);
    setBlockTimeOpen(false);
    setBlockToast("Success Time has been blocked off successfully.");
    window.setTimeout(() => setBlockToast(null), 2800);
  };
  const listPrice = price;
  const payPrice =
    discountEnabled && discountPrice > 0 ? discountPrice : price;
  const showDiscountUi =
    discountEnabled && discountPrice > 0 && discountPrice < listPrice;

  return (
    <>
    <DashboardShell
      displayName={displayName}
      handle={handle}
      showName={showName}
      onSignOut={onSignOut}
      navContext="add-product"
      topLeft={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
            aria-label="Back to My Store"
          >
            <IconChevronLeft />
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-[15px]">
            <Link href="/dashboard" className="font-medium text-slate-500 hover:text-slate-800">
              My Store
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-slate-900">Add New Product</span>
          </nav>
        </div>
      }
      preview={
        activeTab === "checkout" ? (
          <CheckoutMobilePreview
            heroUrl={checkoutHeroPreviewUrl}
            title={title}
            descriptionBody={descriptionBody}
            listPrice={listPrice}
            payPrice={payPrice}
            showDiscount={showDiscountUi}
            bottomTitle={bottomTitle}
            purchaseCta={purchaseCta}
            customFieldLabels={customCheckoutFields}
          />
        ) : (
          <ProductLivePreview
            style={style}
            imageUrl={listingImageUrl}
            title={title}
            subtitle={subtitle}
            buttonText={buttonText}
            price={price}
            fileLabel={fileLabel}
          />
        )
      }
    >
      <input
        ref={thumbnailFileRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={onPickThumbnailFile}
        aria-hidden
      />
      <input
        ref={checkoutHeroFileRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={onPickCheckoutHeroFile}
        aria-hidden
      />
      <input
        ref={digitalFileRef}
        type="file"
        className="hidden"
        accept="*/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setDigitalFileName(file.name);
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              setDigitalFileDataUrl(reader.result);
            }
          };
          reader.onerror = () => {
            setDigitalFileDataUrl(null);
          };
          reader.readAsDataURL(file);
        }}
        aria-hidden
      />
      {loadError ? (
        <p className="mt-4 text-sm text-rose-600" role="alert">
          {loadError}
        </p>
      ) : null}
      {saveMsg ? (
        <p
          className={`mt-4 text-sm font-medium ${saveMsg.startsWith("Please fix") ? "text-rose-600" : "text-emerald-600"}`}
          role="status"
        >
          {saveMsg}
        </p>
      ) : null}
      {listingStatus === "published" ? (
        <p className="mt-3 text-sm text-slate-600">
          Your public store:{" "}
          <Link
            href={publicStoreUrl(handle)}
            className="font-semibold text-[#6b46ff] underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {DISPLAY_STORE_DOMAIN}/{handle}
          </Link>
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap" style={{ gap: "7px" }}>
        <button
          type="button"
          className={tabClass("thumbnail")}
          style={
            activeTab === "thumbnail"
              ? { backgroundColor: PURPLE, color: "#fff" }
              : undefined
          }
          onClick={() => setActiveTab("thumbnail")}
        >
          <IconStoreTab className={activeTab === "thumbnail" ? "text-white" : "text-[#6b46ff]"} />
          Thumbnail
        </button>
        <button
          type="button"
          className={tabClass("checkout")}
          style={
            activeTab === "checkout"
              ? { backgroundColor: PURPLE, color: "#fff" }
              : undefined
          }
          onClick={() => {
            ensureCheckoutDefaults();
            setActiveTab("checkout");
          }}
        >
          <IconCart className={activeTab === "checkout" ? "text-white" : "text-slate-500"} />
          Checkout Page
        </button>
        {isCourseCheckout && !isCoachingCheckout && !isCustomCheckout ? (
          <button
            type="button"
            className={tabClass("course")}
            style={
              activeTab === "course"
                ? { backgroundColor: PURPLE, color: "#fff" }
                : undefined
            }
            onClick={() => setActiveTab("course")}
          >
            <IconCart className={activeTab === "course" ? "text-white" : "text-slate-500"} />
            Course
          </button>
        ) : null}
        {isCoachingCheckout ? (
          <button
            type="button"
            className={tabClass("availability")}
            style={
              activeTab === "availability"
                ? { backgroundColor: PURPLE, color: "#fff" }
                : undefined
            }
            onClick={() => setActiveTab("availability")}
          >
            <IconCart className={activeTab === "availability" ? "text-white" : "text-slate-500"} />
            Availability
          </button>
        ) : null}
        <button
          type="button"
          className={tabClass("options")}
          style={
            activeTab === "options"
              ? { backgroundColor: PURPLE, color: "#fff" }
              : undefined
          }
          onClick={() => setActiveTab("options")}
        >
          <IconSliders className={activeTab === "options" ? "text-white" : "text-slate-500"} />
          Options
        </button>
      </div>

      {activeTab === "thumbnail" ? (
        <>
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="text-base font-bold text-slate-900">
              1<span className="ml-2 font-semibold">Pick a style</span>
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {(
                [
                  {
                    key: "button" as const,
                    label: "Button",
                    hint: "Minimal CTA",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <rect x="2" y="8" width="20" height="8" rx="4" />
                        <path d="M8 12h8" />
                      </svg>
                    ),
                  },
                  {
                    key: "callout" as const,
                    label: "Callout",
                    hint: "Card layout",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <path d="M8 10h8M8 14h5" />
                      </svg>
                    ),
                  },
                  {
                    key: "preview" as const,
                    label: "Preview",
                    hint: "Rich preview",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ),
                  },
                ].filter((opt) => !(isCustomThumbnail && opt.key === "preview")) as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setStyle(opt.key)}
                  className={`flex w-fit flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 transition ${
                    style === opt.key
                      ? "border-violet-500 bg-violet-50/80"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      style === opt.key ? "text-violet-600" : "text-slate-400"
                    }`}
                    style={{ backgroundColor: style === opt.key ? "#ede9fe" : "#f1f5f9" }}
                    aria-hidden
                  >
                    {opt.icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              2<span className="ml-2 font-semibold">Select image</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              This image is saved as your product thumbnail and appears on My Store and in your public listing.
            </p>
            <div
              className={`mt-4 flex flex-col gap-4 rounded-2xl border-2 border-dashed bg-slate-50/80 p-4 sm:flex-row sm:items-center ${
                productFormErrors.listingImage ? "border-rose-400 ring-1 ring-rose-100" : "border-slate-200"
              }`}
            >
              <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-xl bg-[#dbeafe]">
                {listingImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listingImageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <IconFolder className="h-14 w-14" />
                )}
                <button
                  type="button"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-violet-600 shadow"
                  aria-label="Change listing image"
                  onClick={() => thumbnailFileRef.current?.click()}
                >
                  <IconPencil />
                </button>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                <p className="text-xs font-semibold text-slate-700">Thumbnail</p>
                <p className="text-xs text-slate-400">400 x 400</p>
                {thumbnailImageFileName ? (
                  <p className="truncate text-xs text-slate-500">{thumbnailImageFileName}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => thumbnailFileRef.current?.click()}
                  className="mt-1 rounded-lg border-2 px-3 py-1.5 text-xs font-bold"
                  style={{ borderColor: PURPLE, color: PURPLE }}
                >
                  Choose Image
                </button>
              </div>
            </div>
            {productFormErrors.listingImage ? (
              <p className="text-xs font-medium text-rose-600">{productFormErrors.listingImage}</p>
            ) : null}
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              3<span className="ml-2 font-semibold">Add text</span>
            </h2>
            <div className="mt-4 space-y-5">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="title" className="text-sm font-semibold text-slate-800">
                    Title
                  </label>
                  <span className="text-xs text-slate-400">
                    {title.length}/{TITLE_MAX}
                  </span>
                </div>
                <input
                  id="title"
                  value={title}
                  maxLength={TITLE_MAX}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setProductFormErrors((p) => ({ ...p, title: undefined }));
                  }}
                  aria-invalid={Boolean(productFormErrors.title)}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                    productFormErrors.title
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />
                {productFormErrors.title ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.title}</p>
                ) : null}
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="subtitle" className="text-sm font-semibold text-slate-800">
                    Subtitle
                  </label>
                  <span className="text-xs text-slate-400">
                    {subtitle.length}/{SUB_MAX}
                  </span>
                </div>
                <input
                  id="subtitle"
                  value={subtitle}
                  maxLength={SUB_MAX}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    setProductFormErrors((p) => ({ ...p, subtitle: undefined }));
                  }}
                  aria-invalid={Boolean(productFormErrors.subtitle)}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                    productFormErrors.subtitle
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />
                {productFormErrors.subtitle ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.subtitle}</p>
                ) : null}
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="btn" className="text-sm font-semibold text-slate-800">
                    Button<span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {buttonText.length}/{BTN_MAX}
                  </span>
                </div>
                <input
                  id="btn"
                  value={buttonText}
                  maxLength={BTN_MAX}
                  onChange={(e) => {
                    setButtonText(e.target.value);
                    setProductFormErrors((p) => ({ ...p, button: undefined }));
                  }}
                  aria-invalid={Boolean(productFormErrors.button)}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                    productFormErrors.button
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />
                {productFormErrors.button ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.button}</p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
        </>
      ) : activeTab === "checkout" ? (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="text-base font-bold text-slate-900">
              1<span className="ml-2 font-semibold">Select image</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Image for the checkout preview (right). Uses your listing thumbnail until you choose a different one
              here.
            </p>
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center">
              <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#dbeafe]">
                {checkoutHeroPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={checkoutHeroPreviewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <IconFolder className="h-14 w-14" />
                )}
                <button
                  type="button"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-violet-600 shadow"
                  aria-label="Change checkout image"
                  onClick={() => checkoutHeroFileRef.current?.click()}
                >
                  <IconPencil />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">Checkout image</p>
                <p className="text-sm text-slate-500">400×400 recommended</p>
                {checkoutImageFileName ? (
                  <p className="mt-1 truncate text-xs text-slate-600">{checkoutImageFileName}</p>
                ) : checkoutImageDataUrl ? null : listingImageUrl ? (
                  <p className="mt-1 text-xs text-slate-500">Showing listing thumbnail — upload to replace.</p>
                ) : null}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => checkoutHeroFileRef.current?.click()}
                  className="rounded-xl border-2 px-5 py-2.5 text-sm font-bold"
                  style={{ borderColor: PURPLE, color: PURPLE }}
                >
                  Choose Image
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              2<span className="ml-2 font-semibold">Write Description</span>
            </h2>
            <div className="mt-4">
              <label htmlFor="desc-title" className="text-sm font-semibold text-slate-800">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="desc-title"
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setProductFormErrors((p) => ({ ...p, title: undefined }));
                }}
                aria-invalid={Boolean(productFormErrors.title)}
                className={`mt-1 w-full rounded-xl border px-4 py-3 text-[15px] outline-none ${
                  productFormErrors.title ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                }`}
              />
              {productFormErrors.title ? (
                <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.title}</p>
              ) : null}
            </div>
            <div className="mt-4 mb-1 flex items-center justify-between gap-2">
              <label htmlFor="desc-body" className="text-sm font-semibold text-slate-800">
                Description Body <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className={`overflow-hidden rounded-xl border ${
              productFormErrors.descriptionBody ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
            }`}>
              <div className="flex flex-wrap items-center gap-2 border-b border-violet-100 bg-violet-50/70 px-3 py-2 text-slate-700">
                {["H", "B", "S", "I"].map((x) => (
                  <button key={x} type="button" className="text-sm font-semibold hover:text-violet-700">{x}</button>
                ))}
                <span aria-hidden>⋮</span>
                <button type="button" className="text-sm hover:text-violet-700" aria-label="List">≣</button>
                <button type="button" className="text-sm hover:text-violet-700" aria-label="Image">🖼</button>
                <button type="button" className="text-sm hover:text-violet-700" aria-label="Video">▣</button>
                <button type="button" className="text-sm hover:text-violet-700" aria-label="Link">🔗</button>
                <button type="button" className="ml-2 text-sm font-semibold text-violet-600 hover:underline">Generate with AI</button>
              </div>
              <textarea
                id="desc-body"
                value={descriptionBody}
                maxLength={DESC_MAX}
                onChange={(e) => {
                  setDescriptionBody(e.target.value);
                  setProductFormErrors((p) => ({ ...p, descriptionBody: undefined }));
                }}
                rows={8}
                aria-invalid={Boolean(productFormErrors.descriptionBody)}
                className="w-full border-0 px-4 py-3 text-[15px] leading-relaxed outline-none focus:ring-0"
                placeholder="Describe your product…"
              />
            </div>
            {productFormErrors.descriptionBody ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.descriptionBody}</p>
            ) : null}
            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="bottom-title" className="text-sm font-semibold text-slate-800">
                    Bottom Title<span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {bottomTitle.length}/{BOTTOM_TITLE_MAX}
                  </span>
                </div>
                <input
                  id="bottom-title"
                  value={bottomTitle}
                  maxLength={BOTTOM_TITLE_MAX}
                  onChange={(e) => {
                    setBottomTitle(e.target.value);
                    setProductFormErrors((p) => ({ ...p, bottomTitle: undefined }));
                  }}
                  aria-invalid={Boolean(productFormErrors.bottomTitle)}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                    productFormErrors.bottomTitle
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />
                {productFormErrors.bottomTitle ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.bottomTitle}</p>
                ) : null}
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="purchase-cta" className="text-sm font-semibold text-slate-800">
                    Call-to-Action Button<span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {purchaseCta.length}/{PURCHASE_CTA_MAX}
                  </span>
                </div>
                <input
                  id="purchase-cta"
                  value={purchaseCta}
                  maxLength={PURCHASE_CTA_MAX}
                  onChange={(e) => {
                    setPurchaseCta(e.target.value);
                    setProductFormErrors((p) => ({ ...p, purchaseCta: undefined }));
                  }}
                  aria-invalid={Boolean(productFormErrors.purchaseCta)}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                    productFormErrors.purchaseCta
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />
                {productFormErrors.purchaseCta ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.purchaseCta}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              3<span className="ml-2 font-semibold">Set price</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
              <div>
                <label className="text-sm font-semibold text-slate-800" htmlFor="price-main">
                  Price($) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="price-main"
                  type="number"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) => {
                    setPrice(Number(e.target.value));
                    setProductFormErrors((p) => ({ ...p, price: undefined, discountPrice: undefined }));
                  }}
                  aria-invalid={Boolean(productFormErrors.price)}
                  className={`mt-1 w-full rounded-lg border px-4 py-3 text-[15px] outline-none ${
                    productFormErrors.price ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                  }`}
                />
                {productFormErrors.price ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.price}</p>
                ) : null}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-slate-800" htmlFor="discount-amt">
                    Discount Price($)
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={discountEnabled}
                    onClick={() => {
                      setDiscountEnabled((v) => {
                        const next = !v;
                        if (next && discountPrice <= 0) {
                          setDiscountPrice(Math.max(0, Number((price * 0.9).toFixed(2))));
                        }
                        if (!next) setProductFormErrors((p) => ({ ...p, discountPrice: undefined }));
                        return next;
                      });
                    }}
                    className={`relative h-5 w-10 rounded-full transition-colors ${
                      discountEnabled ? "bg-violet-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        discountEnabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <input
                  id="discount-amt"
                  type="number"
                  min={0}
                  step={0.01}
                  disabled={!discountEnabled}
                  value={discountEnabled ? discountPrice : 0}
                  onChange={(e) => {
                    setDiscountPrice(Number(e.target.value));
                    setProductFormErrors((p) => ({ ...p, discountPrice: undefined }));
                  }}
                  aria-invalid={Boolean(productFormErrors.discountPrice)}
                  className={`mt-1 w-full rounded-lg border px-4 py-3 text-[15px] outline-none disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
                    productFormErrors.discountPrice ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                  }`}
                />
                {productFormErrors.discountPrice ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.discountPrice}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold"
                style={{ borderColor: "#b9abf8", color: "#7c65f6" }}
              >
                <span aria-hidden>🔒</span>
                Upgrade to Unlock
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              4<span className="ml-2 font-semibold">Collect info</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">Basic info fields can&apos;t be edited.</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
                <span className="text-lg" aria-hidden>
                  👤
                </span>
                <input
                  disabled
                  value="Name"
                  readOnly
                  className="flex-1 cursor-not-allowed bg-transparent text-[15px] outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
                <span className="text-lg" aria-hidden>
                  ✉️
                </span>
                <input
                  disabled
                  value="Email"
                  readOnly
                  className="flex-1 cursor-not-allowed bg-transparent text-[15px] outline-none"
                />
              </div>
              {customCheckoutFields.map((field, idx) => (
                <input
                  key={idx}
                  value={field}
                  onChange={(e) => {
                    const next = [...customCheckoutFields];
                    next[idx] = e.target.value;
                    setCustomCheckoutFields(next);
                    setProductFormErrors((p) => ({ ...p, customFields: undefined }));
                  }}
                  placeholder={`Custom field ${idx + 1}`}
                  aria-invalid={Boolean(productFormErrors.customFields && !field.trim())}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:border-violet-400 ${
                    productFormErrors.customFields && !field.trim()
                      ? "border-rose-400 ring-1 ring-rose-100"
                      : "border-slate-200"
                  }`}
                />
              ))}
              {productFormErrors.customFields ? (
                <p className="text-xs font-medium text-rose-600">{productFormErrors.customFields}</p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setCustomCheckoutFields((f) => [...f, ""]);
                  setProductFormErrors((p) => ({ ...p, customFields: undefined }));
                }}
                className="rounded-xl border-2 px-5 py-2.5 text-sm font-bold"
                style={{ borderColor: PURPLE, color: PURPLE }}
              >
                + Add Field
              </button>
            </div>
          </section>

          
        </div>
      ) : activeTab === "course" ? (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-base font-bold text-slate-900">
              1<span className="ml-2 font-semibold">Course Homepage</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Start by giving your course a name and setting up your home page.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {checkoutHeroPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={checkoutHeroPreviewUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <IconFolder className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500">Homepage</p>
                  <p className="truncate text-lg font-semibold text-slate-900">{title || "My 12-week Program"}</p>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700"
                >
                  Edit Page
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              2<span className="ml-2 font-semibold">Add modules</span>
            </h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-semibold text-slate-900">Module 1: Introduction</p>
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                      Published
                    </span>
                    <button type="button" className="text-slate-400">⋮</button>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50">
                    <span className="text-sm text-slate-700">Lesson 1: Welcome</span>
                    <span className="text-slate-400">›</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50">
                    <span className="text-sm text-slate-700">Lesson 2: Course Overview</span>
                    <span className="text-slate-400">›</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl border-2 border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700"
                >
                  + Add Lesson
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-lg font-semibold text-slate-900">Module 2: Topic 1</p>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    Published
                  </span>
                  <button type="button" className="text-slate-400">⋮</button>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-lg font-semibold text-slate-900">Module 3: Topic 2</p>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    Published
                  </span>
                  <button type="button" className="text-slate-400">⋮</button>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-xl border-2 border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700"
              >
                + Add Module
              </button>
            </div>
          </section>
        </div>
      ) : activeTab === "availability" ? (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="text-base font-bold text-slate-900">
              1<span className="ml-2 font-semibold">Configure settings</span>
            </h2>
            {productFormErrors.availability ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{productFormErrors.availability}</p>
            ) : null}
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-800">Meeting Location</label>
                <select
                  value={meetingLocation}
                  onChange={(e) => {
                    setMeetingLocation(e.target.value);
                    setProductFormErrors((p) => ({ ...p, availabilityMeetingLocation: undefined }));
                  }}
                  aria-invalid={Boolean(productFormErrors.availabilityMeetingLocation)}
                  className={`mt-1 w-full rounded-xl border px-3 py-3 text-sm font-medium text-slate-700 outline-none ${
                    productFormErrors.availabilityMeetingLocation
                      ? "border-rose-500 ring-1 ring-rose-100"
                      : "border-slate-200"
                  }`}
                >
                  <option>Google Meet</option>
                  <option>Zoom Meeting</option>
                  <option>Custom Location</option>
                  <option>Default</option>
                </select>
                {productFormErrors.availabilityMeetingLocation ? (
                  <p className="mt-1 text-xs text-rose-600">{productFormErrors.availabilityMeetingLocation}</p>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">Time Zone</label>
                  <input
                    value={timeZone}
                    onChange={(e) => {
                      setTimeZone(e.target.value);
                      setProductFormErrors((p) => ({ ...p, availabilityTimeZone: undefined }));
                    }}
                    aria-invalid={Boolean(productFormErrors.availabilityTimeZone)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                      productFormErrors.availabilityTimeZone ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                    }`}
                  />
                  {productFormErrors.availabilityTimeZone ? <p className="mt-1 text-xs text-rose-600">{productFormErrors.availabilityTimeZone}</p> : null}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">Duration (min)</label>
                  <select
                    value={durationMins}
                    onChange={(e) => {
                      setDurationMins(e.target.value);
                      setProductFormErrors((p) => ({ ...p, availabilityDuration: undefined }));
                    }}
                    aria-invalid={Boolean(productFormErrors.availabilityDuration)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                      productFormErrors.availabilityDuration ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                    }`}
                  >
                    <option>15 min</option>
                    <option>30 min</option>
                    <option>45 min</option>
                    <option>60 min</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Prevent Booking within X hours of Current Time</label>
                <div className={`mt-1 flex items-center rounded-xl border px-3 py-3 ${
                  productFormErrors.availabilityPreventHours ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                }`}>
                  <input value={preventBookingHours} onChange={(e) => {
                    setPreventBookingHours(e.target.value);
                    setProductFormErrors((p) => ({ ...p, availabilityPreventHours: undefined }));
                  }} className="w-full bg-transparent text-sm outline-none" />
                  <span className="text-sm text-slate-400">Hours</span>
                </div>
                {productFormErrors.availabilityPreventHours ? <p className="mt-1 text-xs text-rose-600">{productFormErrors.availabilityPreventHours}</p> : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Max Attendees</label>
                <p className="text-sm text-slate-500">Host a group call by letting 1+ attendees join the meeting.</p>
                <div className={`mt-1 flex items-center rounded-xl border px-3 py-3 ${
                  productFormErrors.availabilityMaxAttendees ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                }`}>
                  <input value={maxAttendees} onChange={(e) => {
                    setMaxAttendees(e.target.value);
                    setProductFormErrors((p) => ({ ...p, availabilityMaxAttendees: undefined }));
                  }} className="w-full bg-transparent text-sm outline-none" />
                  <span className="text-sm text-slate-400">Attendees</span>
                </div>
                {productFormErrors.availabilityMaxAttendees ? <p className="mt-1 text-xs text-rose-600">{productFormErrors.availabilityMaxAttendees}</p> : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Break Between Meetings</label>
                <p className="text-sm text-slate-500">Take some buffer time for you to prepare or wrap up for the next meeting</p>
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">Before Meeting</span>
                      <button type="button" role="switch" aria-checked={beforeMeetingEnabled} onClick={() => setBeforeMeetingEnabled((v) => !v)} className={`relative h-5 w-10 rounded-full ${beforeMeetingEnabled ? "bg-violet-500" : "bg-slate-300"}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${beforeMeetingEnabled ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                    <select value={beforeMeetingMins} onChange={(e) => setBeforeMeetingMins(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none">
                      <option>15 min</option><option>30 min</option><option>45 min</option>
                    </select>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">After Meeting</span>
                      <button type="button" role="switch" aria-checked={afterMeetingEnabled} onClick={() => setAfterMeetingEnabled((v) => !v)} className={`relative h-5 w-10 rounded-full ${afterMeetingEnabled ? "bg-violet-500" : "bg-slate-300"}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${afterMeetingEnabled ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                    <select value={afterMeetingMins} onChange={(e) => setAfterMeetingMins(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none">
                      <option>15 min</option><option>30 min</option><option>45 min</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Book within the Next</label>
                <div className={`mt-1 flex items-center rounded-xl border px-3 py-3 ${
                  productFormErrors.availabilityBookWithinDays ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                }`}>
                  <input value={bookWithinDays} onChange={(e) => {
                    setBookWithinDays(e.target.value);
                    setProductFormErrors((p) => ({ ...p, availabilityBookWithinDays: undefined }));
                  }} className="w-full bg-transparent text-sm outline-none" />
                  <span className="text-sm text-slate-400">Days</span>
                </div>
                {productFormErrors.availabilityBookWithinDays ? <p className="mt-1 text-xs text-rose-600">{productFormErrors.availabilityBookWithinDays}</p> : null}
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-base font-bold text-slate-900">
              2<span className="ml-2 font-semibold">Select available times</span>
            </h2>
            <p className="mt-4 text-sm font-semibold text-slate-800">Your Availability <span className="text-rose-500">*</span></p>
            {productFormErrors.availabilityDays ? <p className="mt-1 text-xs text-rose-600">{productFormErrors.availabilityDays}</p> : null}
            <div className="mt-2 space-y-3">
              {dayNames.map((day) => {
                const active = activeAvailabilityDays.includes(day);
                return (
                  <div key={day} className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveAvailabilityDays((prev) =>
                          prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                        )
                      }
                      className={`min-w-[104px] rounded-lg border px-4 py-2 text-sm font-semibold ${
                        active ? "border-transparent text-white" : "border-[#b9abf8] text-[#7c65f6]"
                      }`}
                      style={active ? { backgroundColor: PURPLE } : undefined}
                    >
                      {day}
                    </button>
                    {active ? (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span>From</span>
                        <select className="rounded-lg border border-slate-200 px-2 py-1.5"><option>9:00 AM</option></select>
                        <span>to</span>
                        <select className="rounded-lg border border-slate-200 px-2 py-1.5"><option>5:00 PM</option></select>
                        <button type="button" className="px-1 text-slate-400">+</button>
                        <button type="button" className="px-1 text-slate-400">🗑</button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={() => setBlockDatesOpen(true)} className="mt-5 text-sm font-semibold text-[#7c65f6]">
              🗓 Block off specific dates →
            </button>
          </section>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,.06)]">
            <button
              type="button"
              onClick={() => setAddReviewsOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50/80"
            >
              <span className="flex items-center gap-3">
                <span className="text-slate-500">☺</span>
                <span className="text-base font-bold text-slate-900">Add Reviews</span>
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 text-slate-400 transition ${addReviewsOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {addReviewsOpen ? (
              <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">⋮</span>
                          <div className="text-lg leading-none text-amber-400">★★★★★</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReviews((prev) => prev.filter((r) => r.id !== review.id))}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                        >
                          🗑 Delete
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-[84px_1fr]">
                        <div>
                          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-[#b9baf7]">
                            {review.imageDataUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={review.imageDataUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor" className="text-white/90" aria-hidden>
                                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z" />
                              </svg>
                            )}
                          </div>
                          <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-[#b9abf8] px-2.5 py-1.5 text-xs font-semibold text-[#7c65f6]">
                            Choose Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file || !file.type.startsWith("image/")) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const data = reader.result as string;
                                  setReviews((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, imageDataUrl: data } : r))
                                  );
                                };
                                reader.readAsDataURL(file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                        <div className="space-y-3">
                          <input
                            value={review.name}
                            onChange={(e) =>
                              setReviews((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r))
                              )
                            }
                            placeholder="Name"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none"
                          />
                          <textarea
                            value={review.text}
                            onChange={(e) =>
                              setReviews((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, text: e.target.value } : r))
                              )
                            }
                            placeholder="Text"
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 bg-[#f6f6ff] px-3 py-2.5 text-sm outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setReviews((prev) => [
                      ...prev,
                      {
                        id:
                          typeof crypto !== "undefined" && "randomUUID" in crypto
                            ? crypto.randomUUID()
                            : `review-${Date.now()}`,
                        name: "",
                        text: "",
                        imageDataUrl: null,
                      },
                    ])
                  }
                  className="mt-4 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold"
                  style={{ borderColor: "#b9abf8", color: "#7c65f6" }}
                >
                  + Add customer review
                </button>
              </div>
            ) : null}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,.06)]">
            <button
              type="button"
              onClick={() => setEmailFlowsOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50/80"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <IconEnvelopeOutline />
                </span>
                <span className="text-base font-bold text-slate-900">Email Flows</span>
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 text-slate-400 transition ${emailFlowsOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {emailFlowsOpen ? (
              <div className="border-t border-slate-100 px-5 pb-5 pt-2">
                <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/90 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                    <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <IconEnvelopeSend className="text-slate-400" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">Add an Email Flow</p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        Send an automatic email drip to your customers when this product is purchased.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const id =
                        typeof crypto !== "undefined" && "randomUUID" in crypto
                          ? crypto.randomUUID()
                          : `flow-${Date.now()}`;
                      setEmailFlowIds((ids) => [...ids, id]);
                    }}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
                    style={{ backgroundColor: PURPLE }}
                  >
                    <IconPlusSm className="text-white" />
                    Add Flow
                  </button>
                </div>
                {emailFlowIds.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {emailFlowIds.map((fid, i) => (
                      <li
                        key={fid}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      >
                        <span className="font-medium text-slate-800">
                          Email flow {i + 1}
                          <span className="ml-2 font-normal text-slate-400">(configure in a future update)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setEmailFlowIds((ids) => ids.filter((x) => x !== fid))}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,.06)]">
            <button
              type="button"
              onClick={() => setOrderBumpOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50/80"
            >
              <span className="flex items-center gap-3">
                <span className="text-slate-500">↗</span>
                <span className="text-base font-bold text-slate-900">Order Bump</span>
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 text-slate-400 transition ${orderBumpOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {orderBumpOpen ? (
              <div className="border-t border-slate-100 px-5 pb-6 pt-4">
                <p className="text-xs text-slate-300 blur-[1px]">
                  This is where customers can upgrade before payment with one-click offers and upsells.
                </p>
                <p className="mt-6 text-center text-[30px] font-bold leading-8 text-slate-900">
                  Want to include a one-time offer to your checkout flow?
                </p>
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base font-semibold"
                    style={{ borderColor: "#b9abf8", color: "#7c65f6" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                    </svg>
                    Upgrade Now
                  </button>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-slate-300 blur-[1px]">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300">i</span>
                  <p>
                    Unlock one-click order bumps to increase your average order value.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,.06)]">
            <button
              type="button"
              onClick={() => setAffiliateShareOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50/80"
            >
              <span className="flex items-center gap-3">
                <span className="text-slate-500">◌</span>
                <span className="text-base font-bold text-slate-900">Affiliate Share</span>
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 text-slate-400 transition ${affiliateShareOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {affiliateShareOpen ? (
              <div className="border-t border-slate-100 px-5 pb-6 pt-4">
                <p className="text-xs text-slate-300 blur-[1px]">
                  Enable your customers to market this product and earn commissions from every successful sale.
                </p>
                <p className="mt-6 text-center text-[34px] font-bold leading-9 text-slate-900">
                  Want to distribute Resell Rights for your product?
                </p>
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base font-semibold"
                    style={{ borderColor: "#b9abf8", color: "#7c65f6" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                    </svg>
                    Upgrade Now
                  </button>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-slate-300 blur-[1px]">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300">i</span>
                  <p>
                    Resell rights share: <span className="rounded bg-slate-100 px-1 text-slate-400">50%</span>
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,.06)]">
            <button
              type="button"
              onClick={() => setConfirmationOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50/80"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <IconEnvelopeOutline />
                </span>
                <span className="text-base font-bold text-slate-900">Confirmation Email</span>
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 text-slate-400 transition ${confirmationOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {confirmationOpen ? (
              <div className="space-y-5 border-t border-slate-100 px-5 pb-5 pt-4">
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="conf-subject">
                      Subject
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmationSubject(DEFAULT_CONFIRMATION_SUBJECT);
                        setProductFormErrors((p) => ({ ...p, confirmationSubject: undefined }));
                      }}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Restore Default
                    </button>
                  </div>
                  <input
                    ref={confirmationSubjectRef}
                    id="conf-subject"
                    value={confirmationSubject}
                    maxLength={CONFIRMATION_SUBJECT_MAX}
                    onChange={(e) => {
                      setConfirmationSubject(e.target.value);
                      setProductFormErrors((p) => ({ ...p, confirmationSubject: undefined }));
                    }}
                    aria-invalid={Boolean(productFormErrors.confirmationSubject)}
                    className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:border-violet-400 ${
                      productFormErrors.confirmationSubject ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                    }`}
                  />
                  {productFormErrors.confirmationSubject ? (
                    <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.confirmationSubject}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">Insert placeholders:</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PERSONALIZE_CHIPS.map((chip) => (
                      <button
                        key={`sub-${chip.label}`}
                        type="button"
                        onClick={() => insertSubjectToken(chip.value)}
                        className="rounded-lg border border-violet-200 bg-violet-50/80 px-2 py-1 text-xs font-medium text-violet-800 hover:bg-violet-100"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="conf-body">
                      Body
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmationBody(DEFAULT_CONFIRMATION_BODY);
                        setProductFormErrors((p) => ({ ...p, confirmationBody: undefined }));
                      }}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Restore Default
                    </button>
                  </div>
                  <div
                    className={`overflow-hidden rounded-xl border ${
                      productFormErrors.confirmationBody ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1 border-b border-violet-100 bg-violet-50/60 px-2 py-2">
                      {(
                        [
                          { label: "H", title: "Heading", wrap: ["### ", ""] },
                          { label: "B", title: "Bold", wrap: ["**", "**"] },
                          { label: "S", title: "Strikethrough", wrap: ["~~", "~~"] },
                          { label: "I", title: "Italic", wrap: ["*", "*"] },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          title={t.title}
                          onClick={() => wrapBodySelection(t.wrap[0], t.wrap[1])}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-slate-700 hover:bg-white"
                        >
                          {t.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        title="Bullet list"
                        onClick={() => insertBodyToken("\n- ")}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-white"
                        aria-label="Bullet list"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <circle cx="4" cy="6" r="1.5" />
                          <circle cx="4" cy="12" r="1.5" />
                          <circle cx="4" cy="18" r="1.5" />
                          <rect x="8" y="5" width="12" height="2" rx="0.5" />
                          <rect x="8" y="11" width="12" height="2" rx="0.5" />
                          <rect x="8" y="17" width="12" height="2" rx="0.5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Image"
                        onClick={() => insertBodyToken("![description](https://)")}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                      >
                        Img
                      </button>
                      <button
                        type="button"
                        title="Link"
                        onClick={() => insertBodyToken("[link text](https://)")}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                      >
                        Link
                      </button>
                      <details className="relative ml-auto">
                        <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-50 [&::-webkit-details-marker]:hidden">
                          <IconPlusSm className="h-3.5 w-3.5 text-violet-600" />
                          Personalize
                        </summary>
                        <div className="absolute right-0 z-10 mt-1 min-w-[11rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          {PERSONALIZE_CHIPS.map((chip) => (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => {
                                insertBodyToken(chip.value);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                    <textarea
                      ref={confirmationBodyRef}
                      id="conf-body"
                      value={confirmationBody}
                      maxLength={CONFIRMATION_BODY_MAX}
                      onChange={(e) => {
                        setConfirmationBody(e.target.value);
                        setProductFormErrors((p) => ({ ...p, confirmationBody: undefined }));
                      }}
                      rows={12}
                      aria-invalid={Boolean(productFormErrors.confirmationBody)}
                      className="w-full resize-y border-0 bg-white px-4 py-3 text-[15px] outline-none focus:ring-0"
                      placeholder="Write the email your buyers receive after purchase…"
                    />
                  </div>
                  {productFormErrors.confirmationBody ? (
                    <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.confirmationBody}</p>
                  ) : null}
                  <p className="mt-1.5 text-xs text-slate-500">
                    Publishing requires the literal text <code className="rounded bg-slate-100 px-1">Product File(s)</code> in
                    the body (included in the default template).
                  </p>
                </div>
              </div>
            ) : null}
          </div>

        </div>
      )}

      <div className="mt-10 border-t border-slate-100 pt-8">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className="text-sm italic text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
          >
            Improve this page
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={saving || Boolean(toast)}
            onClick={() => void handleSaveDraft()}
            className="inline-flex items-center justify-center gap-2 border-2 bg-white px-6 py-3 text-sm font-bold transition disabled:opacity-50"
            style={{ borderRadius: "8px", borderColor: PURPLE, color: PURPLE }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
            Save As Draft
          </button>
          {activeTab === "checkout" && !isCustomCheckout ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={isCoachingCheckout ? goToAvailabilityTab : isCourseCheckout ? goToCourseTab : goToOptionsTab}
              className="rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          ) : null}
          {activeTab === "course" ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={goToOptionsTab}
              className="rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          ) : null}
          {activeTab === "availability" ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={goToOptionsFromAvailability}
              className="rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          ) : null}
          {activeTab === "thumbnail" ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={goToCheckoutTab}
              className="bg-blue-600 px-12 py-3 text-sm font-bold text-white transition hover:bg-blue-400 disabled:opacity-50"
              style={{ borderRadius: "8px" }}
            >
              Next
            </button>
          ) : null}
        </div>
      </div>
    </DashboardShell>
    {blockDatesOpen ? (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-4">
        {blockToast ? (
          <div className="fixed top-6 left-1/2 z-[140] -translate-x-1/2 rounded-lg bg-[#0b3db8] px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
            {blockToast} <button type="button" className="ml-3 font-bold" onClick={() => setBlockToast(null)}>OK</button>
          </div>
        ) : null}
        <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-2xl font-bold text-slate-900">
              <button
                type="button"
                onClick={() =>
                  setBlockMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                }
                className="text-slate-500 hover:text-slate-700"
                aria-label="Previous month"
              >
                ‹
              </button>
              <span>{monthTitle}</span>
              <button
                type="button"
                onClick={() =>
                  setBlockMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                }
                className="text-slate-500 hover:text-slate-700"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBlockTimeOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: PURPLE }}
              >
                + Block Time
              </button>
              <button
                type="button"
                onClick={() => setBlockDatesOpen(false)}
                className="text-xl text-slate-400 hover:text-slate-600"
                aria-label="Close block dates modal"
              >
                ×
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 border border-slate-100 bg-[#f8f7ff] text-center text-xs font-semibold text-slate-400">
            {weekNames.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-x border-b border-slate-100">
            {monthCells.map((c) => {
              const selected = c.iso === selectedBlockDate;
              const hasBlocked = blockedSlots.some((s) => s.dateIso === c.iso);
              return (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => setSelectedBlockDate(c.iso)}
                  className={`h-24 border-r border-t border-slate-100 p-2 text-left text-sm last:border-r-0 ${
                    c.inMonth ? "text-slate-500" : "text-slate-300"
                  }`}
                >
                  <span
                    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 ${
                      selected ? "bg-violet-500 text-white" : ""
                    }`}
                  >
                    {c.day}
                  </span>
                  {hasBlocked ? (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                      1 Blocked Time
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
        {blockTimeOpen ? (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[430px] rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setBlockTimeOpen(false)}
                  className="text-2xl leading-none text-slate-400 hover:text-slate-600"
                  aria-label="Close block time modal"
                >
                  ×
                </button>
              </div>
              <h3 className="text-center text-[34px] font-bold text-[#1f2a44]">Block Time</h3>
              <p className="mt-2 text-center text-[18px] leading-6 text-[#6d7ea6]">
                Blocking time will result in your calendar being unavailable to book at that specific time.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-[#1f2a44]">From</label>
                  <select
                    value={blockFromDate}
                    onChange={(e) => setBlockFromDate(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-[#f6f6ff] px-3 py-3 text-base text-[#1f2a44] outline-none"
                  >
                    <option>Apr 24, 2026</option>
                    <option>Apr 25, 2026</option>
                    <option>Apr 26, 2026</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1f2a44]">To</label>
                  <select
                    value={blockToDate}
                    onChange={(e) => setBlockToDate(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-[#f6f6ff] px-3 py-3 text-base text-[#1f2a44] outline-none"
                  >
                    <option>Apr 24, 2026</option>
                    <option>Apr 25, 2026</option>
                    <option>Apr 26, 2026</option>
                  </select>
                </div>
                <div>
                  <select
                    value={blockFromTime}
                    onChange={(e) => setBlockFromTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-[#f6f6ff] px-3 py-3 text-base text-[#1f2a44] outline-none"
                  >
                    <option>9:00 PM</option>
                    <option>9:30 PM</option>
                    <option>10:00 PM</option>
                  </select>
                </div>
                <div>
                  <select
                    value={blockToTime}
                    onChange={(e) => setBlockToTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-[#f6f6ff] px-3 py-3 text-base text-[#1f2a44] outline-none"
                  >
                    <option>10:00 PM</option>
                    <option>10:30 PM</option>
                    <option>11:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleSaveBlockedTime}
                  className="w-full max-w-[260px] rounded-xl py-3 text-lg font-semibold text-white"
                  style={{ backgroundColor: PURPLE }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setBlockTimeOpen(false)}
                  className="mt-4 text-lg font-medium text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    ) : null}
    {toast ? (
      <div
        className="fixed bottom-8 left-1/2 z-[100] max-w-[min(100vw-2rem,24rem)] -translate-x-1/2 rounded-2xl bg-slate-900 px-5 py-3.5 text-center text-sm font-medium text-white shadow-lg"
        style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    ) : null}
    </>
  );
}
