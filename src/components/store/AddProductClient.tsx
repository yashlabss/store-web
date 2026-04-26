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
const DESC_MAX = 2000000;
const BOTTOM_TITLE_MAX = 80;
const PURCHASE_CTA_MAX = 30;
const CONFIRMATION_SUBJECT_MAX = 200;
const CONFIRMATION_BODY_MAX = 8000;
const CHECKOUT_FIELD_CHOICES = [
  { label: "Phone", value: "Phone Number", icon: "📞" },
  { label: "Text", value: "Text", icon: "≡" },
  { label: "Multiple choice", value: "Multiple choice", icon: "◉" },
  { label: "Dropdown", value: "Dropdown", icon: "◌" },
  { label: "Checkboxes", value: "Checkboxes", icon: "☑" },
] as const;

type CheckoutFieldType = "phone" | "text" | "multiple_choice" | "dropdown" | "checkboxes";
type CheckoutCustomFieldCard = {
  id: string;
  type: CheckoutFieldType;
  label: string;
  required: boolean;
  options?: string[];
};
type ReminderTiming = {
  id: string;
  amount: string;
  unit: "minute(s) before" | "hour(s) before" | "day(s) before";
};

const DEFAULT_CONFIRMATION_SUBJECT =
  "Your order from @`My Username` is here!";
const DEFAULT_CONFIRMATION_BODY = `Hi \`Customer Name\`!

Thank you for ordering \`Product Name\`! Here is your order:
\`Product File(s)\`

- @\`My Username\``;
const DEFAULT_REMINDER_SUBJECT = "Reminder: `Product Name` with @`My Username` on `Event Date`";
const DEFAULT_REMINDER_BODY = `Hi \`Invitee Name\`!

This is a friendly reminder that your \`Product Name\` with @\`My Username\` is coming up at \`Event Time\` on \`Event Date\`.

Meeting Location: \`Meeting Link\`

- @\`My Username\``;
const DEFAULT_REMINDER_TIMINGS: ReminderTiming[] = [
  { id: "r-1h", amount: "1", unit: "hour(s) before" },
  { id: "r-24h", amount: "24", unit: "hour(s) before" },
];

const LS_KEY = "yash-product-draft-v2";

/** Time to show toast before navigating to My Store */
const TOAST_THEN_NAV_MS = 2000;

function buildDefaultDescriptionBody(subtitleLine: string) {
  const sub = subtitleLine.trim();
  return `${sub ? `${sub}\n\n` : ""}Inside this [Template/eBook/Course], you'll get practical steps you can apply immediately.

What you'll learn:
- A clear step-by-step framework to get results faster
- The exact process I use (without confusion or guesswork)
- Practical examples you can copy and customize

This is perfect for you if you want to:
- Save time and avoid common mistakes
- Build consistency and confidence
- Reach your next goal with a proven system

Get started now and take the next step today.`;
}

function getPlainTextFromHtml(value: string): string {
  if (!value) return "";
  if (typeof window === "undefined") {
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const el = document.createElement("div");
  el.innerHTML = value;
  return (el.textContent || "").replace(/\s+/g, " ").trim();
}

function getFirstImageFromHtml(value: string): string | null {
  if (!value || !/<[a-z][\s\S]*>/i.test(value)) return null;
  if (typeof window === "undefined") return null;
  const el = document.createElement("div");
  el.innerHTML = value;
  const firstImg = el.querySelector("img");
  const rawSrc = firstImg?.getAttribute("src")?.trim();
  if (!rawSrc) return null;
  const normalizedSrc = /^data:image\//i.test(rawSrc) ? rawSrc.replace(/\s+/g, "") : rawSrc;
  return normalizedSrc || null;
}

function normalizeDescriptionMarkup(value: string): string {
  if (!value) return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (typeof window === "undefined") return value;
  if (/<(img|iframe|video|a)\b[^>]*>/i.test(trimmed)) return value;
  let decoded = trimmed;
  if (trimmed.includes("&lt;") && trimmed.includes("&gt;")) {
    const tx = document.createElement("textarea");
    tx.innerHTML = trimmed;
    decoded = tx.value;
  }
  if (/<(img|iframe|video|a)\b[^>]*>/i.test(decoded)) {
    const container = document.createElement("div");
    container.innerHTML = decoded;
    const imgs = container.querySelectorAll("img");
    imgs.forEach((img) => {
      const src = img.getAttribute("src");
      if (!src) return;
      if (/^data:image\//i.test(src)) {
        img.setAttribute("src", src.replace(/\s+/g, ""));
      }
      if (!img.getAttribute("alt")) {
        img.setAttribute("alt", "Description media");
      }
    });
    return container.innerHTML;
  }

  // Repair legacy broken plain-text image snippets like:
  // "<img\nsrc='data:image/png;base64,...'" (possibly with long wrapped base64 text)
  const rawImgLike = decoded.includes("<img") ? decoded : trimmed;
  const srcMatch = rawImgLike.match(/src\s*=\s*['"]([^'"]+)['"]/i);
  if (srcMatch?.[1] && /^data:image\//i.test(srcMatch[1])) {
    const safeSrc = srcMatch[1].replace(/\s+/g, "").replace(/"/g, "&quot;");
    return `<p><img src="${safeSrc}" alt="Description media" /></p>`;
  }
  const dataUriMatch = rawImgLike.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\r\n]+/i);
  if (dataUriMatch?.[0]) {
    const safeSrc = dataUriMatch[0].replace(/\s+/g, "").replace(/"/g, "&quot;");
    return `<p><img src="${safeSrc}" alt="Description media" /></p>`;
  }
  return value;
}

function sanitizeDescriptionForEditor(value: string): string {
  const normalized = normalizeDescriptionMarkup(value);
  if (typeof window === "undefined") return normalized;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = normalized;
  wrapper.querySelectorAll("img").forEach((img) => {
    const src = (img.getAttribute("src") || "").trim();
    const cleanSrc = /^data:image\//i.test(src) ? src.replace(/\s+/g, "") : src;
    const isValid =
      (cleanSrc.startsWith("http://") || cleanSrc.startsWith("https://") || cleanSrc.startsWith("data:image/")) &&
      cleanSrc.length > 80;
    if (!isValid) {
      img.remove();
      return;
    }
    img.setAttribute("src", cleanSrc);
    if (!img.getAttribute("alt")) img.setAttribute("alt", "Description media");
  });
  if (!wrapper.innerHTML.trim()) return "<p><br></p>";
  const hasEditableTail = /<(p|div|br|li|h[1-6])\b/i.test(wrapper.innerHTML);
  if (!hasEditableTail) wrapper.innerHTML = `${wrapper.innerHTML}<p><br></p>`;
  return wrapper.innerHTML;
}

function getNewReview(): ReviewItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `review-${Date.now()}`,
    rating: 5,
    name: "",
    text: "",
    imageDataUrl: null,
  };
}

function validateReviewsInput(reviews: ReviewItem[]): {
  hasErrors: boolean;
  byId: Record<string, ReviewItemErrors>;
} {
  const byId: Record<string, ReviewItemErrors> = {};
  for (const review of reviews) {
    const name = review.name.trim();
    const text = review.text.trim();
    const isEmpty = !name && !text && !review.imageDataUrl;
    if (isEmpty) continue;
    const e: ReviewItemErrors = {};
    if (!name) e.name = "Reviewer name is required.";
    if (!text) e.text = "Review text is required.";
    if (Object.keys(e).length > 0) byId[review.id] = e;
  }
  return { hasErrors: Object.keys(byId).length > 0, byId };
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
  course?: string;
  membershipRecurring?: string;
  membershipCancelAfter?: string;
  webinarSlots?: string;
  webinarSettings?: string;
  urlMediaLink?: string;
  affiliateUrl?: string;
  reviews?: string;
};

type ReviewItem = {
  id: string;
  rating: number;
  name: string;
  text: string;
  imageDataUrl: string | null;
};

type ReviewItemErrors = {
  name?: string;
  text?: string;
};

type EmailFlowItem = {
  id: string;
  name: string;
  trigger_type?: string;
  is_active?: boolean;
  config_json?: Record<string, unknown>;
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
  if (!getPlainTextFromHtml(descriptionBody)) e.descriptionBody = "Description is required.";
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
  return Boolean(e.confirmationSubject || e.confirmationBody || e.reviews);
}

function validateCommunityCopy(
  isCommunityFlow: boolean,
  title: string,
  subtitle: string,
  buttonText: string,
): ProductFormErrors {
  const e: ProductFormErrors = {};
  if (!isCommunityFlow) return e;
  if (title.trim().toLowerCase() === "get started with this amazing course") {
    e.title = "Use a community-focused title.";
  }
  if (
    subtitle.trim().toLowerCase() ===
    "a 2-line course summary to close the sale. what will they learn?"
  ) {
    e.subtitle = "Use a community-focused subtitle.";
  }
  if (buttonText.trim().toUpperCase() === "GET MY COURSE") {
    e.button = "Use a community-focused button label.";
  }
  return e;
}

function validateUrlMediaTab(
  isUrlMediaFlow: boolean,
  urlMediaLink: string,
): ProductFormErrors {
  const e: ProductFormErrors = {};
  if (!isUrlMediaFlow) return e;
  const link = urlMediaLink.trim();
  if (!link) {
    e.urlMediaLink = "Paste a URL to continue.";
    return e;
  }
  if (!validateUrlHttp(link)) {
    e.urlMediaLink = "Enter a valid URL starting with http:// or https://.";
  }
  return e;
}

function validateAffiliateTab(
  isAffiliateFlow: boolean,
  affiliateUrl: string,
): ProductFormErrors {
  const e: ProductFormErrors = {};
  if (!isAffiliateFlow) return e;
  const link = affiliateUrl.trim();
  if (!link) {
    e.affiliateUrl = "Button URL is required.";
    return e;
  }
  if (!validateUrlHttp(link)) {
    e.affiliateUrl = "Enter a valid URL starting with http:// or https://.";
  }
  return e;
}

function validateAffiliatePage(
  thumbnailDataUrl: string | null,
  title: string,
  affiliateUrl: string,
): ProductFormErrors {
  const e: ProductFormErrors = {};
  if (!thumbnailDataUrl) e.listingImage = "Please upload a listing thumbnail image.";
  if (!title.trim()) e.title = "Title is required.";
  const link = affiliateUrl.trim();
  if (!link) e.affiliateUrl = "Button URL is required.";
  else if (!validateUrlHttp(link)) {
    e.affiliateUrl = "Enter a valid URL starting with http:// or https://.";
  }
  return e;
}

function validateMembershipCheckout(
  isMembershipFlow: boolean,
  recurringCycle: string,
  cancelSubscriptionAfterEnabled: boolean,
  cancelSubscriptionAfter: string,
): ProductFormErrors {
  const e: ProductFormErrors = {};
  if (!isMembershipFlow) return e;
  const validRecurring = ["Yearly", "Monthly", "Weekly", "Daily"];
  if (!validRecurring.includes(recurringCycle)) {
    e.membershipRecurring = "Select a valid recurring cycle.";
  }
  if (cancelSubscriptionAfterEnabled) {
    const validCancelAfter = [
      "3 months",
      "4 months",
      "5 months",
      "6 months",
      "7 months",
      "8 months",
      "9 months",
      "10 months",
      "11 months",
      "12 months",
    ];
    if (!validCancelAfter.includes(cancelSubscriptionAfter)) {
      e.membershipCancelAfter =
        "Select when subscription should cancel, or turn off the toggle.";
    }
  }
  return e;
}

function validateCourseTab(
  courseModules: string[],
  lessonTitle: string,
  lessonDescription: string,
): ProductFormErrors {
  const e: ProductFormErrors = {};
  if (!courseModules.length) {
    e.course = "Add at least one module in Course.";
    return e;
  }
  if (courseModules.some((m) => !m.trim())) {
    e.course = "Each module must have a name.";
    return e;
  }
  if (!lessonTitle.trim()) {
    e.course = "Lesson title is required in Course Builder.";
    return e;
  }
  if (!lessonDescription.trim()) {
    e.course = "Lesson description is required in Course Builder.";
  }
  return e;
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

type TabKey = "thumbnail" | "checkout" | "webinar" | "course" | "availability" | "options";
type StyleKey = "button" | "callout" | "preview";
type PaymentType = "one-time" | "subscription";
type WebinarSlot = {
  dateIso: string;
  time: string;
};

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
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(trimmed);
  if (looksLikeHtml) {
    return (
      <div
        className="mt-3 space-y-2 text-left text-[13px] leading-relaxed text-slate-700 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-[15px] [&_h3]:font-bold [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2 [&_img]:my-4 [&_img]:block [&_img]:w-full [&_img]:max-h-[340px] [&_img]:rounded-xl [&_img]:object-contain [&_img]:bg-slate-50 [&_video]:my-4 [&_video]:mx-auto [&_video]:block [&_video]:w-full [&_video]:rounded-xl [&_iframe]:my-4 [&_iframe]:mx-auto [&_iframe]:block [&_iframe]:w-full [&_iframe]:min-h-[220px] [&_iframe]:rounded-xl"
        // Note: content is authored by the user in this local editor.
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
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
  reviews,
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
  reviews: ReviewItem[];
}) {
  const descriptionImageUrl = getFirstImageFromHtml(descriptionBody);
  const previewHeroUrl = heroUrl || descriptionImageUrl;

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
            {previewHeroUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewHeroUrl} alt="" className="h-36 w-full object-cover" />
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
          {reviews.length > 0 ? (
            <div className="mt-4 space-y-2.5">
              {reviews
                .filter((r) => r.name.trim() && r.text.trim())
                .slice(0, 3)
                .map((review) => (
                  <div key={review.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#f1f1ff]">
                        {review.imageDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={review.imageDataUrl} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-slate-900">{review.name}</p>
                        <p className="text-[11px] text-amber-500">{"★".repeat(Math.max(1, Math.min(5, review.rating || 5)))}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : null}
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
  const [reviewErrorsById, setReviewErrorsById] = useState<Record<string, ReviewItemErrors>>({});
  const [emailFlowsOpen, setEmailFlowsOpen] = useState(false);
  const [orderBumpOpen, setOrderBumpOpen] = useState(false);
  const [affiliateShareOpen, setAffiliateShareOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [emailFlowIds, setEmailFlowIds] = useState<string[]>([]);
  const [availableFlows, setAvailableFlows] = useState<EmailFlowItem[]>([]);
  const [flowsLoading, setFlowsLoading] = useState(false);
  const [confirmationSubject, setConfirmationSubject] = useState(DEFAULT_CONFIRMATION_SUBJECT);
  const [confirmationBody, setConfirmationBody] = useState(DEFAULT_CONFIRMATION_BODY);
  const [reminderSubject, setReminderSubject] = useState(DEFAULT_REMINDER_SUBJECT);
  const [reminderBody, setReminderBody] = useState(DEFAULT_REMINDER_BODY);
  const [reminderTimings, setReminderTimings] = useState<ReminderTiming[]>(DEFAULT_REMINDER_TIMINGS);
  const confirmationBodyRef = useRef<HTMLTextAreaElement>(null);
  const confirmationSubjectRef = useRef<HTMLInputElement>(null);
  const descriptionBodyRef = useRef<HTMLDivElement>(null);
  const descriptionImageFileRef = useRef<HTMLInputElement>(null);
  const descriptionVideoFileRef = useRef<HTMLInputElement>(null);
  const descriptionSelectionRef = useRef<Range | null>(null);

  const [descriptionBody, setDescriptionBody] = useState(() =>
    buildDefaultDescriptionBody("A 2-line course summary to close the sale. What will they learn?")
  );
  const [previewDescriptionBody, setPreviewDescriptionBody] = useState(() =>
    buildDefaultDescriptionBody("A 2-line course summary to close the sale. What will they learn?")
  );
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionVideoModalOpen, setDescriptionVideoModalOpen] = useState(false);
  const [descriptionVideoUrl, setDescriptionVideoUrl] = useState("");
  const [descriptionLinkModalOpen, setDescriptionLinkModalOpen] = useState(false);
  const [descriptionLinkName, setDescriptionLinkName] = useState("");
  const [descriptionLinkUrl, setDescriptionLinkUrl] = useState("");
  const [bottomTitle, setBottomTitle] = useState("Get My Course");
  const [purchaseCta, setPurchaseCta] = useState("PURCHASE");
  const [paymentType, setPaymentType] = useState<PaymentType>("one-time");
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [recurringCycle, setRecurringCycle] = useState("Monthly");
  const [cancelSubscriptionAfterEnabled, setCancelSubscriptionAfterEnabled] = useState(false);
  const [cancelSubscriptionAfter, setCancelSubscriptionAfter] = useState("N/A (ongoing payments)");
  const [webinarSlots, setWebinarSlots] = useState<WebinarSlot[]>([]);
  const [webinarDatePickerIndex, setWebinarDatePickerIndex] = useState<number | null>(null);
  const [webinarTimeOptionsOpenIndex, setWebinarTimeOptionsOpenIndex] = useState<number | null>(null);
  const [urlMediaLink, setUrlMediaLink] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [courseBuilderOpen, setCourseBuilderOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("Lesson 3");
  const [lessonDescription, setLessonDescription] = useState(
    "Share what your students will learn in this lesson, then list out the key takeaways they can expect:\n\n- Key takeaway 1\n- Key takeaway 2\n- Key takeaway 3\n\nWrap things up by including an overview of any supporting materials you've uploaded, or share any closing thoughts/exercises you'd like your students to leave with before moving on to the next lesson."
  );
  const [courseBuilderVideoName, setCourseBuilderVideoName] = useState<string | null>(null);
  const [courseBuilderVideoUrl, setCourseBuilderVideoUrl] = useState<string | null>(null);
  const [courseModules, setCourseModules] = useState<string[]>([
    "Module 2: Topic 1",
    "Module 3: Topic 2",
  ]);
  const [digitalDelivery, setDigitalDelivery] = useState<"upload" | "redirect">("upload");
  const [digitalRedirectUrl, setDigitalRedirectUrl] = useState("");
  const [digitalFileName, setDigitalFileName] = useState<string | null>(null);
  const [digitalFileDataUrl, setDigitalFileDataUrl] = useState<string | null>(null);
  const [customCheckoutFields, setCustomCheckoutFields] = useState<string[]>([]);
  const [customCheckoutFieldCards, setCustomCheckoutFieldCards] = useState<CheckoutCustomFieldCard[]>([]);
  const [checkoutFieldDropdownOpen, setCheckoutFieldDropdownOpen] = useState(false);
  const checkoutFieldDropdownRef = useRef<HTMLDivElement>(null);

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
  const courseBuilderVideoFileRef = useRef<HTMLInputElement>(null);

  const [productId, setProductId] = useState<string | null>(null);
  const [listingStatus, setListingStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [productFormErrors, setProductFormErrors] = useState<ProductFormErrors>({});

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      setFlowsLoading(true);
      try {
        const res = await fetch(`${API_PRODUCTS_BASE}/email-flows`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as {
          flows?: EmailFlowItem[];
        };
        if (!res.ok) return;
        if (!cancelled) {
          setAvailableFlows(Array.isArray(data.flows) ? data.flows : []);
        }
      } finally {
        if (!cancelled) setFlowsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const addEmailFlow = useCallback(async () => {
    if (!token) {
      setSaveMsg("Please log in again.");
      return;
    }
    const index = emailFlowIds.length + 1;
    try {
      const res = await fetch(`${API_PRODUCTS_BASE}/email-flows`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Email flow ${index}`,
          trigger_type: "purchase_success",
          is_active: true,
          config_json: {
            subject: "Quick update on your {{product_title}} purchase",
            body:
              "Hi {{name}},\n\nThanks again for purchasing {{product_title}}. We will send your next update shortly.",
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        flow?: EmailFlowItem;
        message?: string;
      };
      if (!res.ok || !data.flow?.id) {
        throw new Error(data.message || "Could not create email flow.");
      }
      setAvailableFlows((prev) => [data.flow as EmailFlowItem, ...prev]);
      setEmailFlowIds((ids) => [...ids, data.flow!.id]);
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "Could not create email flow.");
    }
  }, [token, emailFlowIds.length]);

  const ensureCheckoutDefaults = useCallback(() => {
    const k = (searchParams.get("kind") || "").toLowerCase();
    setDescriptionBody((prev) =>
      getPlainTextFromHtml(prev).trim()
        ? prev
        : k === "community"
          ? "Join a members-only community built for creators who want to grow together.\n\nInside the community, you'll get\n- Weekly live Q&A and accountability sessions\n- Private discussion channels and support\n- Exclusive resources, templates, and updates\n\nBecome a member today and connect with like-minded people."
          : buildDefaultDescriptionBody(subtitle)
    );
    setBottomTitle((prev) => {
      if (prev.trim()) return prev;
      if (k === "membership") return "Join My Membership!";
      if (k === "community") return "Join Our Community Today";
      if (k === "webinar") return "Join Me & Friends";
      return buttonText;
    });
    setPurchaseCta((prev) => {
      if (prev.trim()) return prev;
      if (k === "membership") return "JOIN NOW";
      if (k === "community") return "JOIN NOW";
      if (k === "webinar") return "Secure Your Spot";
      return "PURCHASE";
    });
  }, [subtitle, buttonText, searchParams]);

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

  useEffect(() => {
    const t = window.setTimeout(() => {
      setPreviewDescriptionBody(descriptionBody);
    }, 0);
    return () => window.clearTimeout(t);
  }, [descriptionBody, isEditingDescription]);

  useEffect(() => {
    if (!checkoutFieldDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!checkoutFieldDropdownRef.current?.contains(e.target as Node)) {
        setCheckoutFieldDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [checkoutFieldDropdownOpen]);

  useEffect(() => {
    setCustomCheckoutFields(
      customCheckoutFieldCards.map((f) => f.label)
    );
  }, [customCheckoutFieldCards]);

  useEffect(() => {
    if (activeTab !== "checkout") return;
    if (getPlainTextFromHtml(descriptionBody).trim()) return;
    ensureCheckoutDefaults();
  }, [activeTab, descriptionBody, ensureCheckoutDefaults]);

  useEffect(() => {
    const el = descriptionBodyRef.current;
    if (!el) return;
    // Do not rewrite DOM while user is typing; it can reset caret/cursor.
    // But if editor is visually empty while state has content, hydrate it.
    const editorLooksEmpty = !getPlainTextFromHtml(el.innerHTML).trim();
    const stateHasContent = getPlainTextFromHtml(descriptionBody).trim().length > 0;
    if (document.activeElement === el && !(editorLooksEmpty && stateHasContent)) return;
    const current = el.innerHTML;
    if (current === descriptionBody) return;
    if (/<[a-z][\s\S]*>/i.test(descriptionBody)) {
      el.innerHTML = descriptionBody;
    } else {
      el.innerText = descriptionBody;
    }
  }, [descriptionBody]);

  const applyProduct = useCallback((p: ProductApi) => {
    setProductId(p.id);
    setListingStatus(p.status === "published" ? "published" : "draft");
    const tab = p.active_tab;
    setActiveTab(
      tab === "thumbnail" ||
        tab === "checkout" ||
        tab === "webinar" ||
        tab === "course" ||
        tab === "options"
        ? tab
        : "thumbnail"
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
    const loadedDescriptionBody = typeof cj.description_body === "string" ? cj.description_body : "";
    const normalizedLoadedDescriptionBody = sanitizeDescriptionForEditor(loadedDescriptionBody);
    const isCommunityLike =
      /community/i.test(p.title || "") ||
      /community/i.test(p.subtitle || "") ||
      /join now/i.test(p.button_text || "");
    setDescriptionBody(
      getPlainTextFromHtml(normalizedLoadedDescriptionBody).trim()
        ? normalizedLoadedDescriptionBody
        : isCommunityLike
          ? "Join a members-only community built for creators who want to grow together.\n\nInside the community, you'll get\n- Weekly live Q&A and accountability sessions\n- Private discussion channels and support\n- Exclusive resources, templates, and updates\n\nBecome a member today and connect with like-minded people."
          : buildDefaultDescriptionBody(p.subtitle || "")
    );
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
      setCustomCheckoutFieldCards(
        cj.custom_fields.map((label, idx) => ({
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `checkout-field-${idx}-${Date.now()}`,
          type: "text",
          label,
          required: false,
        }))
      );
    } else {
      setCustomCheckoutFieldCards([]);
    }
    const oj = p.options_json as {
      note?: string;
      attached_file_name?: string;
      confirmation_email?: { subject?: string; body?: string };
      reminder_email?: {
        enabled?: boolean;
        subject?: string;
        body?: string;
        timings?: { id?: string; amount?: string | number; unit?: string }[];
      };
      email_flows?: { id?: string }[];
      reviews?: {
        id?: string;
        rating?: number;
        name?: string;
        text?: string;
        image_data_url?: string | null;
      }[];
    };
    if (typeof oj?.note === "string") setOptionsNote(oj.note);
    if (typeof oj?.attached_file_name === "string") setFileLabel(oj.attached_file_name);
    const ce = oj?.confirmation_email;
    if (ce && typeof ce.subject === "string") setConfirmationSubject(ce.subject);
    else setConfirmationSubject(DEFAULT_CONFIRMATION_SUBJECT);
    if (ce && typeof ce.body === "string") setConfirmationBody(ce.body);
    else setConfirmationBody(DEFAULT_CONFIRMATION_BODY);
    const re = oj?.reminder_email;
    if (typeof re?.enabled === "boolean") setReminderEnabled(re.enabled);
    else setReminderEnabled(true);
    if (typeof re?.subject === "string") setReminderSubject(re.subject);
    else setReminderSubject(DEFAULT_REMINDER_SUBJECT);
    if (typeof re?.body === "string") setReminderBody(re.body);
    else setReminderBody(DEFAULT_REMINDER_BODY);
    if (Array.isArray(re?.timings)) {
      const parsedTimings = re.timings
        .filter((t) => t && typeof t === "object")
        .map((t, idx) => ({
          id:
            typeof t.id === "string" && t.id
              ? t.id
              : typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `rem-${idx}-${Date.now()}`,
          amount: String(t.amount ?? ""),
          unit:
            t.unit === "minute(s) before" || t.unit === "day(s) before"
              ? t.unit
              : "hour(s) before",
        }));
      setReminderTimings(parsedTimings.length ? parsedTimings : DEFAULT_REMINDER_TIMINGS);
    } else {
      setReminderTimings(DEFAULT_REMINDER_TIMINGS);
    }
    if (Array.isArray(oj?.email_flows) && oj.email_flows.every((x) => x && typeof x.id === "string")) {
      setEmailFlowIds(oj.email_flows.map((x) => x.id as string));
    } else {
      setEmailFlowIds([]);
    }
    if (Array.isArray(oj?.reviews)) {
      const parsed = oj.reviews
        .filter((r) => r && typeof r === "object")
        .map((r, idx) => ({
          id:
            typeof r.id === "string" && r.id
              ? r.id
              : typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `review-loaded-${idx}-${Date.now()}`,
          rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
          name: typeof r.name === "string" ? r.name : "",
          text: typeof r.text === "string" ? r.text : "",
          imageDataUrl: typeof r.image_data_url === "string" ? r.image_data_url : null,
        }));
      setReviews(parsed);
    } else {
      setReviews([]);
    }
    setReviewErrorsById({});
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
    const isMembership = kind === "membership";
    const isWebinar = kind === "webinar";
    const isCommunity = kind === "community";
    const isCourse = kind === "course";
    const isUrlMedia = kind === "url-media";
    const isAffiliate = kind === "affiliate";
    setProductId(null);
    setListingStatus("draft");
    setActiveTab("thumbnail");
    setStyle("callout");
    setTitle(
      isCoaching
        ? "Book a 1:1 Call with Me"
        : isWebinar
          ? "Join Me at the Webinar"
        : isCourse
          ? "Get started with this amazing course"
        : isCommunity
          ? "Join Our Private Community"
        : isUrlMedia
          ? "Click Me!"
        : isAffiliate
          ? "Build your Stan Store"
        : isMembership
          ? "Join My Membership"
        : isCustom
          ? "Personalized Video Response"
          : "Get My [Template/eBook/Course] Now!"
    );
    const nextSubtitle = isCoaching
      ? "Book a private coaching session with me!"
      : isWebinar
        ? "Grab a spot in my exclusive webinar!"
      : isCourse
        ? "A 2-line course summary to close the sale. What will they learn?"
      : isCommunity
        ? "Get member-only chats, exclusive resources, and weekly live community calls."
      : isUrlMedia
        ? "Visit my Affiliate Link"
      : isAffiliate
        ? ""
      : isMembership
        ? "Get exclusive how-to tips, weekly check ins and live webinar with me!"
      : isCustom
        ? "I'll send you a custom video/product addressing your unique request!"
        : "We will deliver this file right to your inbox";
    setSubtitle(nextSubtitle);
    setButtonText(
      isCoaching
        ? "Book a 1:1 Call with Me"
        : isWebinar
          ? "Claim Your Spot"
      : isCourse
        ? "GET MY COURSE"
        : isCommunity
          ? "Join Now"
        : isUrlMedia
          ? "Click Me!"
        : isAffiliate
          ? "Build your Stan Store"
        : isMembership
          ? "Join My Membership"
          : isCustom
            ? "Submit Your Request"
            : "Get My Guide"
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
    setReviewErrorsById({});
    setEmailFlowsOpen(false);
    setOrderBumpOpen(false);
    setAffiliateShareOpen(false);
    setConfirmationOpen(false);
    setEmailFlowIds([]);
    setConfirmationSubject(DEFAULT_CONFIRMATION_SUBJECT);
    setConfirmationBody(DEFAULT_CONFIRMATION_BODY);
    setReminderEnabled(true);
    setReminderSubject(DEFAULT_REMINDER_SUBJECT);
    setReminderBody(DEFAULT_REMINDER_BODY);
    setReminderTimings(DEFAULT_REMINDER_TIMINGS);
    setDescriptionBody(
      isCommunity
        ? "Join a members-only community built for creators who want to grow together.\n\nInside the community, you'll get\n- Weekly live Q&A and accountability sessions\n- Private discussion channels and support\n- Exclusive resources, templates, and updates\n\nBecome a member today and connect with like-minded people."
        : buildDefaultDescriptionBody(nextSubtitle)
    );
    setBottomTitle(
      isCustom
        ? "Get Your Video!"
        : isCommunity
          ? "Join Our Community Today"
        : isWebinar
          ? "Join Me & Friends"
          : isMembership
            ? "Join My Membership!"
            : "Get My Course"
    );
    setPurchaseCta(
      isCommunity
        ? "JOIN NOW"
        : isWebinar
          ? "Secure Your Spot"
          : isMembership
            ? "JOIN NOW"
            : "PURCHASE"
    );
    setDiscountEnabled(false);
    setDiscountPrice(0);
    setRecurringCycle("Monthly");
    setCancelSubscriptionAfterEnabled(false);
    setCancelSubscriptionAfter("N/A (ongoing payments)");
    setWebinarSlots([]);
    setWebinarDatePickerIndex(null);
    setWebinarTimeOptionsOpenIndex(null);
    setUrlMediaLink("");
    setAffiliateUrl(isAffiliate ? `http://join.stan.store/${handle}` : "");
    setDigitalDelivery("upload");
    setDigitalRedirectUrl("");
    setDigitalFileName(null);
    setDigitalFileDataUrl(null);
    setCustomCheckoutFields([]);
    setCustomCheckoutFieldCards([]);
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

  const buildBody = useCallback(
    (
      saveStatus: "draft" | "published",
      activeTabOverride?: TabKey,
      emailFlowIdsOverride?: string[]
    ) => {
      const tabForSave = activeTabOverride ?? activeTab;
      const flows = emailFlowIdsOverride ?? emailFlowIds;
      return {
      id: productId || undefined,
      status: saveStatus,
      active_tab:
        tabForSave === "availability" || tabForSave === "webinar"
          ? "checkout"
          : tabForSave,
      style,
      title: title.slice(0, TITLE_MAX),
      subtitle: subtitle.slice(0, SUB_MAX),
      button_text: buttonText.slice(0, BTN_MAX),
      price_numeric: price,
      thumbnail_url: thumbnailDataUrl,
      checkout_json: {
        note: checkoutNote,
        price,
        description_body: normalizeDescriptionMarkup(descriptionBody).slice(0, DESC_MAX),
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
        reminder_email: {
          enabled: reminderEnabled,
          subject: reminderSubject.slice(0, CONFIRMATION_SUBJECT_MAX),
          body: reminderBody.slice(0, CONFIRMATION_BODY_MAX),
          timings: reminderTimings,
        },
        email_flows: flows.map((id) => ({ id })),
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
          name: r.name.trim(),
          text: r.text.trim(),
          image_data_url: r.imageDataUrl,
        })),
      },
    };
  },
  [
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
    lessonTitle,
    lessonDescription,
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
    reminderEnabled,
    reminderSubject,
    reminderBody,
    reminderTimings,
    emailFlowIds,
    reviews,
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
    async (
      saveStatus: "draft" | "published" = "draft",
      second?: TabKey | string[]
    ): Promise<boolean> => {
      const activeTabOverride = Array.isArray(second) ? undefined : second;
      const emailFlowIdsOverride = Array.isArray(second) ? second : undefined;
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
          body: JSON.stringify(buildBody(saveStatus, activeTabOverride, emailFlowIdsOverride)),
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

  const readFileAsDataUrl = (file: File): Promise<string | null> =>
    new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(typeof r.result === "string" ? r.result : null);
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

  const onPickCourseBuilderVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setToast("Please choose a valid video file.");
      return;
    }
    setCourseBuilderVideoName(file.name);
    void readFileAsDataUrl(file).then((u) => {
      setCourseBuilderVideoUrl(u);
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

  useEffect(() => {
    const autoSaveDraftOnExit = () => {
      if (listingStatus === "published") return;
      void saveToApi("draft");
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") autoSaveDraftOnExit();
    };
    window.addEventListener("pagehide", autoSaveDraftOnExit);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", autoSaveDraftOnExit);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [listingStatus, saveToApi]);

  const saveDraftBeforeNext = (targetTab: TabKey) => {
    void saveToApi("draft", targetTab).then((ok) => {
      if (!ok) {
        setSaveMsg((prev) => prev || "Could not auto-save draft. Please try again.");
      }
    });
  };

  const goToCheckoutTab = () => {
    if (!validateDigitalThumbnailForNavigation()) return;
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
    saveDraftBeforeNext("checkout");
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
      !isDigitalProductFlow,
    );
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else setActiveTab("checkout");
      return;
    }
    const cc = validateCommunityCopy(
      isCommunityFlow,
      title,
      subtitle,
      buttonText,
    );
    if (publishHasErrors(cc)) {
      setProductFormErrors((prev) => ({ ...prev, ...cc }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      setActiveTab("thumbnail");
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
    const me = validateMembershipCheckout(
      isMembershipFlow,
      recurringCycle,
      cancelSubscriptionAfterEnabled,
      cancelSubscriptionAfter,
    );
    if (publishHasErrors(me)) {
      setProductFormErrors((prev) => ({ ...prev, ...me }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      setActiveTab("checkout");
      return;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      membershipRecurring: undefined,
      membershipCancelAfter: undefined,
    }));
    setActiveTab("options");
    saveDraftBeforeNext("options");
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
      !isDigitalProductFlow,
    );
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else setActiveTab("checkout");
      return;
    }
    const cc = validateCommunityCopy(
      isCommunityFlow,
      title,
      subtitle,
      buttonText,
    );
    if (publishHasErrors(cc)) {
      setProductFormErrors((prev) => ({ ...prev, ...cc }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      setActiveTab("thumbnail");
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
    const me = validateMembershipCheckout(
      isMembershipFlow,
      recurringCycle,
      cancelSubscriptionAfterEnabled,
      cancelSubscriptionAfter,
    );
    if (publishHasErrors(me)) {
      setProductFormErrors((prev) => ({ ...prev, ...me }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      setActiveTab("checkout");
      return;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      membershipRecurring: undefined,
      membershipCancelAfter: undefined,
    }));
    setActiveTab("availability");
    saveDraftBeforeNext("availability");
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
      !isDigitalProductFlow,
    );
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else setActiveTab("checkout");
      return;
    }
    const cc = validateCommunityCopy(
      isCommunityFlow,
      title,
      subtitle,
      buttonText,
    );
    if (publishHasErrors(cc)) {
      setProductFormErrors((prev) => ({ ...prev, ...cc }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      setActiveTab("thumbnail");
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
    const me = validateMembershipCheckout(
      isMembershipFlow,
      recurringCycle,
      cancelSubscriptionAfterEnabled,
      cancelSubscriptionAfter,
    );
    if (publishHasErrors(me)) {
      setProductFormErrors((prev) => ({ ...prev, ...me }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      setActiveTab("checkout");
      return;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      membershipRecurring: undefined,
      membershipCancelAfter: undefined,
    }));
    setActiveTab("course");
    saveDraftBeforeNext("course");
  };

  const goToWebinarTab = () => {
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
      !isDigitalProductFlow,
    );
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else setActiveTab("checkout");
      return;
    }
    const cc = validateCommunityCopy(
      isCommunityFlow,
      title,
      subtitle,
      buttonText,
    );
    if (publishHasErrors(cc)) {
      setProductFormErrors((prev) => ({ ...prev, ...cc }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      setActiveTab("thumbnail");
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
    const me = validateMembershipCheckout(
      isMembershipFlow,
      recurringCycle,
      cancelSubscriptionAfterEnabled,
      cancelSubscriptionAfter,
    );
    if (publishHasErrors(me)) {
      setProductFormErrors((prev) => ({ ...prev, ...me }));
      setSaveMsg("Please fix the highlighted fields before continuing.");
      setActiveTab("checkout");
      return;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      membershipRecurring: undefined,
      membershipCancelAfter: undefined,
    }));
    setActiveTab("webinar");
    saveDraftBeforeNext("webinar");
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
    saveDraftBeforeNext("options");
  };

  const validateDigitalThumbnailForNavigation = () => {
    if (!isDigitalProductFlow && !isCourseCheckout && !isMembershipFlow && !isWebinarFlow) return true;
    const e = validateThumbnailTab(thumbnailDataUrl, title, subtitle, buttonText);
    if (thumbnailTabHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix thumbnail fields before continuing.");
      setActiveTab("thumbnail");
      return false;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      listingImage: undefined,
      title: undefined,
      subtitle: undefined,
      button: undefined,
    }));
    return true;
  };

  const validateDigitalCheckoutForNavigation = () => {
    if (!isDigitalProductFlow && !isCourseCheckout && !isMembershipFlow && !isWebinarFlow) return true;
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
      !isDigitalProductFlow,
    );
    if (isMembershipFlow) {
      const me = validateMembershipCheckout(
        isMembershipFlow,
        recurringCycle,
        cancelSubscriptionAfterEnabled,
        cancelSubscriptionAfter,
      );
      Object.assign(e, me);
    }
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please fix checkout fields before continuing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else setActiveTab("checkout");
      return false;
    }
    return true;
  };

  const validateCourseForNavigation = () => {
    if (!isCourseCheckout) return true;
    const e = validateCourseTab(courseModules, lessonTitle, lessonDescription);
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please complete course page fields before continuing.");
      setActiveTab("course");
      return false;
    }
    setProductFormErrors((prev) => ({ ...prev, course: undefined }));
    return true;
  };

  const validateWebinarForNavigation = () => {
    if (!isWebinarFlow) return true;
    const e = validateWebinarTab();
    if (publishHasErrors(e)) {
      setProductFormErrors((prev) => ({ ...prev, ...e }));
      setSaveMsg("Please complete webinar fields before continuing.");
      setActiveTab("webinar");
      return false;
    }
    setProductFormErrors((prev) => ({
      ...prev,
      webinarSlots: undefined,
      webinarSettings: undefined,
    }));
    return true;
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

  const syncDescriptionFromEditor = () => {
    const html = descriptionBodyRef.current?.innerHTML ?? "";
    setDescriptionBody(html);
    setProductFormErrors((p) => ({ ...p, descriptionBody: undefined }));
  };

  const runDescriptionCommand = (cmd: string, value?: string) => {
    const el = descriptionBodyRef.current;
    if (!el) return;
    el.focus();
    const restored = restoreDescriptionSelection();
    if (!restored) placeDescriptionCaretAtTypingLine();
    document.execCommand(cmd, false, value);
    syncDescriptionFromEditor();
    saveDescriptionSelection();
  };

  const saveDescriptionSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      descriptionSelectionRef.current = null;
      return;
    }
    descriptionSelectionRef.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreDescriptionSelection = () => {
    const range = descriptionSelectionRef.current;
    if (!range) return false;
    const editor = descriptionBodyRef.current;
    if (!editor) return false;
    const startNode = range.startContainer;
    const endNode = range.endContainer;
    if (!editor.contains(startNode) || !editor.contains(endNode)) {
      return false;
    }
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  };

  const placeDescriptionCaretAtEnd = () => {
    const editor = descriptionBodyRef.current;
    if (!editor) return;
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const ensureDescriptionEditorIsTypeable = () => {
    const editor = descriptionBodyRef.current;
    if (!editor) return;
    const lastEl = editor.lastElementChild as HTMLElement | null;
    const needsTrailingParagraph =
      !lastEl ||
      !/^(P|DIV|LI|H1|H2|H3|H4|H5|H6)$/i.test(lastEl.tagName) ||
      lastEl.querySelector("img,iframe,video") !== null;
    if (needsTrailingParagraph) {
      editor.insertAdjacentHTML("beforeend", "<p><br></p>");
      syncDescriptionFromEditor();
    }
  };

  const placeDescriptionCaretAtTypingLine = () => {
    const editor = descriptionBodyRef.current;
    if (!editor) return;
    ensureDescriptionEditorIsTypeable();
    const target =
      (editor.querySelector("p:last-of-type") as HTMLElement | null) ||
      (editor.lastElementChild as HTMLElement | null) ||
      editor;
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
    descriptionSelectionRef.current = range.cloneRange();
  };

  const insertDescriptionHtmlAtCaret = (html: string) => {
    const editor = descriptionBodyRef.current;
    if (!editor) return;
    editor.focus();
    const restored = restoreDescriptionSelection();
    if (!restored) placeDescriptionCaretAtEnd();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node: ChildNode | null = null;
    let lastNode: ChildNode | null = null;
    while ((node = wrapper.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);
    if (lastNode) {
      const nextRange = document.createRange();
      nextRange.setStartAfter(lastNode);
      nextRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nextRange);
      descriptionSelectionRef.current = nextRange.cloneRange();
    }
    syncDescriptionFromEditor();
  };

  const onPickDescriptionImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    void readImageFileAsDataUrl(file).then((dataUrl) => {
      if (!dataUrl) return;
      insertDescriptionHtmlAtCaret(`<img src="${dataUrl}" alt="Description media" />`);
    });
  };

  const closeDescriptionVideoModal = () => {
    setDescriptionVideoModalOpen(false);
    setDescriptionVideoUrl("");
  };

  const getDescriptionVideoEmbedHtml = (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    try {
      const u = new URL(trimmed);
      const host = u.hostname.toLowerCase();
      if (host.includes("youtube.com") || host.includes("youtu.be")) {
        const videoId =
          u.searchParams.get("v") ||
          (host.includes("youtu.be") ? u.pathname.replace("/", "") : "");
        if (videoId) {
          return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="width:100%;max-width:680px;min-height:360px;border:0;border-radius:12px;"></iframe>`;
        }
      }
      if (host.includes("loom.com")) {
        const parts = u.pathname.split("/").filter(Boolean);
        const id = parts[parts.length - 1];
        if (id) {
          return `<iframe src="https://www.loom.com/embed/${id}" frameborder="0" allowfullscreen style="width:100%;max-width:680px;min-height:360px;border:0;border-radius:12px;"></iframe>`;
        }
      }
      if (host.includes("wistia")) {
        return `<iframe src="${u.toString()}" frameborder="0" allowfullscreen style="width:100%;max-width:680px;min-height:360px;border:0;border-radius:12px;"></iframe>`;
      }
      return `<a href="${u.toString()}" target="_blank" rel="noopener noreferrer">Watch video</a>`;
    } catch {
      return "";
    }
  };

  const handleEmbedDescriptionVideo = () => {
    const embedHtml = getDescriptionVideoEmbedHtml(descriptionVideoUrl);
    if (!embedHtml) {
      setToast("Please enter a valid YouTube, Loom, or Wistia link.");
      return;
    }
    insertDescriptionHtmlAtCaret(embedHtml);
    closeDescriptionVideoModal();
  };

  const onPickDescriptionVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setToast("Please choose a video file.");
      return;
    }
    void readFileAsDataUrl(file).then((dataUrl) => {
      if (!dataUrl) return;
      insertDescriptionHtmlAtCaret(
        `<video controls style="width:100%;max-width:680px;border-radius:12px;"><source src="${dataUrl}" type="${file.type}"></video>`
      );
      closeDescriptionVideoModal();
    });
  };

  const closeDescriptionLinkModal = () => {
    setDescriptionLinkModalOpen(false);
    setDescriptionLinkName("");
    setDescriptionLinkUrl("");
  };

  const openDescriptionLinkModal = () => {
    saveDescriptionSelection();
    const selected = window.getSelection()?.toString().trim() || "";
    setDescriptionLinkName(selected);
    setDescriptionLinkUrl("");
    setDescriptionLinkModalOpen(true);
  };

  const handleSaveDescriptionLink = () => {
    const href = descriptionLinkUrl.trim();
    if (!href) {
      setToast("Please enter a valid URL.");
      return;
    }
    let safeHref = href;
    if (!/^https?:\/\//i.test(safeHref)) safeHref = `https://${safeHref}`;
    const name = descriptionLinkName.trim();
    const text = name || safeHref;
    insertDescriptionHtmlAtCaret(
      `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${text}</a>`
    );
    closeDescriptionLinkModal();
  };

  const handleRemoveDescriptionLink = () => {
    const editor = descriptionBodyRef.current;
    if (!editor) return;
    editor.focus();
    restoreDescriptionSelection();
    runDescriptionCommand("unlink");
    closeDescriptionLinkModal();
  };

  const toggleDescriptionHeading = () => {
    const sel = window.getSelection();
    const parent = sel?.anchorNode?.parentElement;
    const inHeading = Boolean(parent?.closest("h1,h2,h3,h4,h5,h6"));
    runDescriptionCommand("formatBlock", inHeading ? "p" : "h2");
  };

  const handlePublish = async () => {
    const e = isAffiliateFlow
      ? validateAffiliatePage(thumbnailDataUrl, title, affiliateUrl)
      : validatePublishTab(
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
          !isDigitalProductFlow,
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
    if (isCourseCheckout) {
      const ce = validateCourseTab(courseModules, lessonTitle, lessonDescription);
      Object.assign(e, ce);
    }
    const ue = validateUrlMediaTab(isUrlMediaFlow, urlMediaLink);
    Object.assign(e, ue);
    const afe = validateAffiliateTab(isAffiliateFlow, affiliateUrl);
    Object.assign(e, afe);
    const cc = validateCommunityCopy(
      isCommunityFlow,
      title,
      subtitle,
      buttonText,
    );
    Object.assign(e, cc);
    if (isWebinarFlow) {
      const we = validateWebinarTab();
      Object.assign(e, we);
    }
    const me = validateMembershipCheckout(
      isMembershipFlow,
      recurringCycle,
      cancelSubscriptionAfterEnabled,
      cancelSubscriptionAfter,
    );
    Object.assign(e, me);
    if (showReviewsInOptions) {
      const reviewValidation = validateReviewsInput(reviews);
      setReviewErrorsById(reviewValidation.byId);
      if (reviewValidation.hasErrors) {
        e.reviews = "Complete reviewer name and text for each review card.";
      }
    } else {
      setReviewErrorsById({});
    }
    if (publishHasErrors(e)) {
      setProductFormErrors(e);
      setSaveMsg("Please fix the highlighted fields before publishing.");
      if (thumbnailTabHasErrors(e)) setActiveTab("thumbnail");
      else if (e.course) setActiveTab("course");
      else if (e.urlMediaLink) setActiveTab("thumbnail");
      else if (e.affiliateUrl) setActiveTab("thumbnail");
      else if (e.webinarSlots || e.webinarSettings) setActiveTab("webinar");
      else if (e.membershipRecurring || e.membershipCancelAfter) setActiveTab("checkout");
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
    /get started with this amazing course/i.test(title) ||
    /^get my course$/i.test(buttonText.trim()) ||
    activeTab === "course";
  const isMembershipFlow =
    (searchParams.get("kind") || "").toLowerCase() === "membership" ||
    /membership/i.test(title) ||
    /membership/i.test(subtitle) ||
    /join my membership/i.test(buttonText);
  const isWebinarFlow =
    (searchParams.get("kind") || "").toLowerCase() === "webinar" ||
    (!isMembershipFlow &&
      !isCourseCheckout &&
      !isCoachingCheckout &&
      !isCustomCheckout &&
      (/webinar/i.test(title) ||
        /webinar/i.test(subtitle) ||
        /claim your spot/i.test(buttonText)));
  const isUrlMediaFlow =
    (searchParams.get("kind") || "").toLowerCase() === "url-media";
  const isAffiliateFlow =
    (searchParams.get("kind") || "").toLowerCase() === "affiliate";
  const isEmailApplicationsFlow =
    (searchParams.get("kind") || "").toLowerCase() === "custom";
  const showReviewsInOptions =
    !isUrlMediaFlow && !isAffiliateFlow && !isEmailApplicationsFlow;
  const isCommunityFlow =
    (searchParams.get("kind") || "").toLowerCase() === "community" ||
    /community/i.test(title) ||
    /community/i.test(subtitle) ||
    /join now/i.test(buttonText);
  const isCustomThumbnail =
    (searchParams.get("kind") || "").toLowerCase() === "custom" ||
    /submit your request/i.test(buttonText) ||
    /personalized video response/i.test(title);
  const isDigitalProductFlow =
    !isCoachingCheckout &&
    !isCustomCheckout &&
    !isCourseCheckout &&
    !isMembershipFlow &&
    !isWebinarFlow &&
    !isCommunityFlow &&
    !isUrlMediaFlow &&
    !isAffiliateFlow;
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
  const webinarTimeOptions = [
    "1:00 PM",
    "1:15 PM",
    "1:30 PM",
    "1:45 PM",
    "2:00 PM",
    "2:15 PM",
    "2:30 PM",
    "2:45 PM",
    "3:00 PM",
    "3:15 PM",
    "3:30 PM",
    "3:45 PM",
    "4:00 PM",
  ];
  const formatSlotDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const updateWebinarSlot = (idx: number, next: Partial<WebinarSlot>) => {
    setWebinarSlots((prev) =>
      prev.map((slot, i) => (i === idx ? { ...slot, ...next } : slot))
    );
  };
  const validateWebinarTab = (): ProductFormErrors => {
    const e: ProductFormErrors = {};
    if (!webinarSlots.length) {
      e.webinarSlots = "Add at least one webinar slot.";
      return e;
    }
    if (webinarSlots.some((slot) => !slot.dateIso || !slot.time)) {
      e.webinarSlots = "Each webinar slot needs both date and time.";
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (
      !e.webinarSlots &&
      webinarSlots.some((slot) => new Date(`${slot.dateIso}T00:00:00`) < today)
    ) {
      e.webinarSlots = "Past dates are not allowed for webinar slots.";
    }
    if (!e.webinarSlots) {
      const unique = new Set(webinarSlots.map((slot) => `${slot.dateIso}|${slot.time}`));
      if (unique.size !== webinarSlots.length) {
        e.webinarSlots = "Duplicate webinar slots are not allowed.";
      }
    }
    if (!durationMins.trim() || !timeZone.trim() || !meetingLocation.trim()) {
      e.webinarSettings = "Complete webinar settings before publishing.";
    } else if (!Number.isFinite(Number(maxAttendees)) || Number(maxAttendees) < 1) {
      e.webinarSettings = "Seats per slot must be at least 1.";
    }
    return e;
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
        activeTab === "checkout" || activeTab === "course" || activeTab === "options" ? (
          <CheckoutMobilePreview
            heroUrl={checkoutHeroPreviewUrl}
            title={title}
            descriptionBody={previewDescriptionBody}
            listPrice={listPrice}
            payPrice={payPrice}
            showDiscount={showDiscountUi}
            bottomTitle={bottomTitle}
            purchaseCta={purchaseCta}
            customFieldLabels={customCheckoutFields}
            reviews={reviews}
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
      <input
        ref={courseBuilderVideoFileRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={onPickCourseBuilderVideoFile}
        aria-hidden
      />
      <input
        ref={descriptionImageFileRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={onPickDescriptionImage}
        aria-hidden
      />
      <input
        ref={descriptionVideoFileRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={onPickDescriptionVideoFile}
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

      {!isUrlMediaFlow && !isAffiliateFlow ? (
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
            if (activeTab === "thumbnail" && !validateDigitalThumbnailForNavigation()) return;
            ensureCheckoutDefaults();
            setActiveTab("checkout");
          }}
        >
          <IconCart className={activeTab === "checkout" ? "text-white" : "text-slate-500"} />
          Checkout Page
        </button>
        {isWebinarFlow ? (
          <button
            type="button"
            className={tabClass("webinar")}
            style={
              activeTab === "webinar"
                ? { backgroundColor: PURPLE, color: "#fff" }
                : undefined
            }
            onClick={() => {
              if (!validateDigitalThumbnailForNavigation()) return;
              ensureCheckoutDefaults();
              if (!validateDigitalCheckoutForNavigation()) return;
              setActiveTab("webinar");
            }}
          >
            <IconCart className={activeTab === "webinar" ? "text-white" : "text-slate-500"} />
            Webinar
          </button>
        ) : null}
        {isCourseCheckout && !isWebinarFlow && !isCoachingCheckout && !isCustomCheckout ? (
          <button
            type="button"
            className={tabClass("course")}
            style={
              activeTab === "course"
                ? { backgroundColor: PURPLE, color: "#fff" }
                : undefined
            }
            onClick={() => {
              if (!validateDigitalThumbnailForNavigation()) return;
              ensureCheckoutDefaults();
              if (!validateDigitalCheckoutForNavigation()) return;
              setActiveTab("course");
            }}
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
          onClick={() => {
            if (!validateDigitalThumbnailForNavigation()) return;
            ensureCheckoutDefaults();
            if (!validateDigitalCheckoutForNavigation()) return;
            if (!validateCourseForNavigation()) return;
            if (!validateWebinarForNavigation()) return;
            setActiveTab("options");
          }}
        >
          <IconSliders className={activeTab === "options" ? "text-white" : "text-slate-500"} />
          Options
        </button>
      </div>
      ) : null}

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
                    label: isUrlMediaFlow ? "Embed" : "Preview",
                    hint: isUrlMediaFlow ? "Embedded media" : "Rich preview",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ),
                  },
                ].filter(
                  (opt) =>
                    !(
                      (isCustomThumbnail || isMembershipFlow || isAffiliateFlow) &&
                      opt.key === "preview"
                    )
                ) as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setStyle(opt.key)}
                  className={`relative flex w-fit flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 transition ${
                    style === opt.key
                      ? "border-violet-500 bg-violet-50/80"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {isUrlMediaFlow && opt.key === "preview" ? (
                    <span className="absolute -right-1 -top-2 rounded-full bg-violet-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      NEW
                    </span>
                  ) : null}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      style === opt.key ? "text-violet-600" : "text-slate-400"
                    }`}
                    style={{ backgroundColor: style === opt.key ? "#ede9fe" : "#f1f5f9" }}
                    aria-hidden
                  >
                    {opt.icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {isUrlMediaFlow ? (
            <section>
              <h2 className="text-base font-bold text-slate-900">
                2<span className="ml-2 font-semibold">Paste URL</span>
                <span className="text-rose-500"> *</span>
              </h2>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-end">
                  <span className="text-xs text-slate-400">{urlMediaLink.length}/1024</span>
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <span className="mr-2 text-slate-400">🔗</span>
                  <input
                    value={urlMediaLink}
                    onChange={(e) => {
                      setUrlMediaLink(e.target.value.slice(0, 1024));
                      setProductFormErrors((p) => ({ ...p, urlMediaLink: undefined }));
                    }}
                    placeholder="http://your-link"
                    className="w-full border-0 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
                {productFormErrors.urlMediaLink ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.urlMediaLink}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="text-base font-bold text-slate-900">
              {isUrlMediaFlow || isAffiliateFlow ? (
                <>3<span className="ml-2 font-semibold">Select image</span></>
              ) : (
                <>2<span className="ml-2 font-semibold">Select image</span></>
              )}
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
              {isUrlMediaFlow || isAffiliateFlow ? (
                <>4<span className="ml-2 font-semibold">Add text</span></>
              ) : (
                <>3<span className="ml-2 font-semibold">Add text</span></>
              )}
            </h2>
            <div className="mt-4 space-y-5">
              {isAffiliateFlow ? (
                <>
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
                        setButtonText(e.target.value);
                        setProductFormErrors((p) => ({ ...p, title: undefined, button: undefined }));
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
                      <label htmlFor="affiliate-url" className="text-sm font-semibold text-slate-800">
                        Button URL
                      </label>
                      <span className="text-xs text-slate-400">
                        {affiliateUrl.length}/1024
                      </span>
                    </div>
                    <input
                      id="affiliate-url"
                      value={affiliateUrl}
                      maxLength={1024}
                      disabled
                      onChange={(e) => {
                        setAffiliateUrl(e.target.value);
                        setProductFormErrors((p) => ({ ...p, affiliateUrl: undefined }));
                      }}
                      aria-invalid={Boolean(productFormErrors.affiliateUrl)}
                      className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 ${
                        productFormErrors.affiliateUrl
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                          : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                      }`}
                    />
                    {productFormErrors.affiliateUrl ? (
                      <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.affiliateUrl}</p>
                    ) : null}
                  </div>
                </>
              ) : null}
              {!isAffiliateFlow ? (
                <>
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
                </>
              ) : null}
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
                disabled
                onChange={(e) => {
                  setTitle(e.target.value);
                  setProductFormErrors((p) => ({ ...p, title: undefined }));
                }}
                aria-invalid={Boolean(productFormErrors.title)}
                className={`mt-1 w-full rounded-xl border px-4 py-3 text-[15px] outline-none disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 ${
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
                {(
                  [
                    { label: "H", action: () => toggleDescriptionHeading() },
                    { label: "B", action: () => runDescriptionCommand("bold") },
                    { label: "S", action: () => runDescriptionCommand("strikeThrough") },
                    { label: "I", action: () => runDescriptionCommand("italic") },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={t.action}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-[16px] font-semibold hover:text-violet-700 ${
                      t.label === "H" ? "border border-slate-400 text-[14px]" : ""
                    }`}
                    aria-label={
                      t.label === "H"
                        ? "Heading"
                        : t.label === "B"
                          ? "Bold"
                          : t.label === "S"
                            ? "Strikethrough"
                            : "Italic"
                    }
                    title={
                      t.label === "H"
                        ? "Heading"
                        : t.label === "B"
                          ? "Bold"
                          : t.label === "S"
                            ? "Strikethrough"
                            : "Italic"
                    }
                  >
                    {t.label}
                  </button>
                ))}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => runDescriptionCommand("insertUnorderedList")}
                  className="flex h-7 w-7 items-center justify-center rounded-md hover:text-violet-700"
                  aria-label="List"
                  title="List"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="5" cy="7" r="1.2" fill="currentColor" stroke="none" />
                    <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
                    <circle cx="5" cy="17" r="1.2" fill="currentColor" stroke="none" />
                    <path d="M9 7h10M9 12h10M9 17h10" />
                  </svg>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    saveDescriptionSelection();
                    descriptionImageFileRef.current?.click();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md hover:text-violet-700"
                  aria-label="Image"
                  title="Insert Image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="1.5" />
                    <path d="m21 16-5-5-6 6-2-2-5 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    saveDescriptionSelection();
                    setDescriptionVideoModalOpen(true);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md hover:text-violet-700"
                  aria-label="Video"
                  title="Insert Video"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M10 9v6l5-3-5-3z" fill="currentColor" stroke="none" />
                  </svg>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={openDescriptionLinkModal}
                  className="flex h-7 w-7 items-center justify-center rounded-md hover:text-violet-700"
                  aria-label="Link"
                  title="Insert Link"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.5 1.5" />
                    <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7L13 18" />
                  </svg>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const aiText =
                      "What you will get: Actionable step-by-step guidance, ready-to-use templates, and clear next steps.";
                    runDescriptionCommand("insertText", aiText);
                  }}
                  className="ml-2 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:underline"
                  aria-label="Generate with AI"
                  title="AI Content Generator"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2zM19 14l.9 2.5L22.5 17l-2.6.9L19 20.5l-.9-2.6L15.5 17l2.6-.5L19 14zM5 13l1.1 3L9 17l-2.9 1L5 21l-1.1-3L1 17l2.9-1L5 13z" />
                  </svg>
                  Generate with AI
                </button>
              </div>
              <div
                ref={descriptionBodyRef}
                id="desc-body"
                contentEditable
                suppressContentEditableWarning
                onFocus={() => {
                  setIsEditingDescription(true);
                  placeDescriptionCaretAtTypingLine();
                }}
                onBlur={() => {
                  setIsEditingDescription(false);
                  setPreviewDescriptionBody(descriptionBody);
                }}
                onClick={() => {
                  const sel = window.getSelection();
                  const hasRange = Boolean(sel && sel.rangeCount > 0);
                  if (!hasRange) placeDescriptionCaretAtTypingLine();
                }}
                onKeyDown={() => {
                  const sel = window.getSelection();
                  if (!sel || sel.rangeCount === 0) placeDescriptionCaretAtTypingLine();
                }}
                onInput={syncDescriptionFromEditor}
                onMouseUp={saveDescriptionSelection}
                onKeyUp={saveDescriptionSelection}
                aria-invalid={Boolean(productFormErrors.descriptionBody)}
                data-placeholder="Describe your product..."
                className="min-h-[180px] w-full border-0 px-4 py-3 text-[15px] leading-relaxed outline-none focus:ring-0 empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_h1]:text-[28px] [&_h1]:font-normal [&_h1]:leading-tight [&_h2]:text-[24px] [&_h2]:font-normal [&_h2]:leading-tight [&_h3]:text-[20px] [&_h3]:font-normal [&_h3]:leading-snug [&_p]:my-1 [&_ul]:my-2 [&_ul]:pl-5 [&_li]:list-disc [&_img]:my-4 [&_img]:block [&_img]:w-full [&_img]:max-h-[340px] [&_img]:rounded-xl [&_img]:object-contain [&_img]:bg-slate-50 [&_video]:my-4 [&_video]:mx-auto [&_video]:block [&_video]:w-full [&_video]:rounded-xl [&_iframe]:my-4 [&_iframe]:mx-auto [&_iframe]:block [&_iframe]:w-full [&_iframe]:min-h-[220px] [&_iframe]:rounded-xl"
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
            {isCourseCheckout ? (
              <div className="mt-3 inline-flex items-center overflow-hidden rounded-md border border-violet-400">
                <button
                  type="button"
                  onClick={() => setPaymentType("one-time")}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${
                    paymentType === "one-time"
                      ? "bg-violet-500 text-white"
                      : "bg-white text-violet-500"
                  }`}
                >
                  One-Time Payment
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("subscription")}
                  className={`border-l px-3 py-1.5 text-xs font-semibold transition ${
                    paymentType === "subscription"
                      ? "bg-violet-500 text-white"
                      : "bg-white text-violet-500"
                  }`}
                  style={{ borderColor: "#c4b5fd" }}
                >
                  Subscription
                </button>
              </div>
            ) : null}
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
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      discountEnabled ? "bg-violet-500" : "bg-[#bfd0e6]"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
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
                  className={`mt-1 w-full rounded-lg border px-4 py-3 text-[15px] outline-none disabled:cursor-not-allowed disabled:border-[#e7eef8] disabled:bg-[#f3f8ff] disabled:text-slate-400 ${
                    productFormErrors.discountPrice ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                  }`}
                />
                {productFormErrors.discountPrice ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.discountPrice}</p>
                ) : null}
              </div>
            </div>
            {isMembershipFlow ? (
              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-800">Scheduling</p>
                <p className="mt-1 text-sm text-slate-600">
                  Customize the duration and billing cycle of your membership
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
                  <div>
                    <label className="text-sm font-semibold text-slate-800" htmlFor="membership-recurring">
                      Recurring <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="membership-recurring"
                      value={recurringCycle}
                      onChange={(e) => {
                        setRecurringCycle(e.target.value);
                        setProductFormErrors((p) => ({ ...p, membershipRecurring: undefined }));
                      }}
                      aria-invalid={Boolean(productFormErrors.membershipRecurring)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option>Yearly</option>
                      <option>Monthly</option>
                      <option>Weekly</option>
                      <option>Daily</option>
                    </select>
                    {productFormErrors.membershipRecurring ? (
                      <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.membershipRecurring}</p>
                    ) : null}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-slate-800" htmlFor="membership-cancel-after">
                        Cancel subscription after
                      </label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={cancelSubscriptionAfterEnabled}
                        onClick={() => {
                          setCancelSubscriptionAfterEnabled((v) => {
                            const next = !v;
                            if (next && cancelSubscriptionAfter === "N/A (ongoing payments)") {
                              setCancelSubscriptionAfter("3 months");
                            }
                            if (!next) {
                              setCancelSubscriptionAfter("N/A (ongoing payments)");
                            }
                            return next;
                          });
                          setProductFormErrors((p) => ({ ...p, membershipCancelAfter: undefined }));
                        }}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                          cancelSubscriptionAfterEnabled ? "bg-violet-500" : "bg-[#bfd0e6]"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            cancelSubscriptionAfterEnabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    <select
                      id="membership-cancel-after"
                      value={cancelSubscriptionAfter}
                      disabled={!cancelSubscriptionAfterEnabled}
                      onChange={(e) => {
                        setCancelSubscriptionAfter(e.target.value);
                        setProductFormErrors((p) => ({ ...p, membershipCancelAfter: undefined }));
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option>N/A (ongoing payments)</option>
                      <option>3 months</option>
                      <option>4 months</option>
                      <option>5 months</option>
                      <option>6 months</option>
                      <option>7 months</option>
                      <option>8 months</option>
                      <option>9 months</option>
                      <option>10 months</option>
                      <option>11 months</option>
                      <option>12 months</option>
                    </select>
                    {productFormErrors.membershipCancelAfter ? (
                      <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.membershipCancelAfter}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
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
              {customCheckoutFieldCards.map((field) => (
                <div key={field.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                    <span className="text-slate-400" aria-hidden>
                      {field.type === "phone"
                        ? "📞"
                        : field.type === "text"
                          ? "≡"
                          : field.type === "multiple_choice"
                            ? "◉"
                            : field.type === "dropdown"
                              ? "◌"
                              : "☑"}
                    </span>
                    <input
                      value={field.label}
                      onChange={(e) => {
                        setCustomCheckoutFieldCards((prev) =>
                          prev.map((f) => (f.id === field.id ? { ...f, label: e.target.value } : f))
                        );
                        setProductFormErrors((p) => ({ ...p, customFields: undefined }));
                      }}
                      placeholder={
                        field.type === "phone"
                          ? "Phone Number"
                          : field.type === "text"
                            ? "Short Answer Title"
                            : field.type === "multiple_choice"
                              ? "Multiple choice title..."
                              : field.type === "dropdown"
                                ? "Dropdown title..."
                                : "Checkbox title..."
                      }
                      className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
                    />
                  </div>
                  {field.options && field.options.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {field.options.map((opt, i) => (
                        <div key={`${field.id}-opt-${i}`} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                          <span className="text-slate-300" aria-hidden>⋮⋮</span>
                          <input
                            value={opt}
                            onChange={(e) => {
                              setCustomCheckoutFieldCards((prev) =>
                                prev.map((f) => {
                                  if (f.id !== field.id || !f.options) return f;
                                  const next = [...f.options];
                                  next[i] = e.target.value;
                                  return { ...f, options: next };
                                })
                              );
                            }}
                            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCustomCheckoutFieldCards((prev) =>
                                prev.map((f) => {
                                  if (f.id !== field.id || !f.options) return f;
                                  const next = f.options.filter((_, idx) => idx !== i);
                                  return { ...f, options: next.length ? next : ["Option 1"] };
                                })
                              );
                            }}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCheckoutFieldCards((prev) =>
                            prev.map((f) =>
                              f.id === field.id && f.options
                                ? { ...f, options: [...f.options, `Option ${f.options.length + 1}`] }
                                : f
                            )
                          );
                        }}
                        className="text-sm font-semibold"
                        style={{ color: PURPLE }}
                      >
                        + Add Option
                      </button>
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center justify-end gap-3">
                    <span className="text-sm font-semibold text-slate-700">Required</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCheckoutFieldCards((prev) =>
                          prev.map((f) => (f.id === field.id ? { ...f, required: !f.required } : f))
                        );
                      }}
                      className={`relative h-5 w-10 rounded-full ${field.required ? "bg-violet-500" : "bg-slate-300"}`}
                      aria-label="Required toggle"
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                          field.required ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCheckoutFieldCards((prev) => prev.filter((f) => f.id !== field.id));
                        setProductFormErrors((p) => ({ ...p, customFields: undefined }));
                      }}
                      className="text-slate-400 hover:text-rose-500"
                      aria-label="Delete field"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
              {productFormErrors.customFields ? (
                <p className="text-xs font-medium text-rose-600">{productFormErrors.customFields}</p>
              ) : null}
              <div className="relative inline-block" ref={checkoutFieldDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCheckoutFieldDropdownOpen((v) => !v)}
                  className="rounded-xl border-2 px-5 py-2.5 text-sm font-bold"
                  style={{ borderColor: PURPLE, color: PURPLE }}
                >
                  + Add Field
                </button>
                {checkoutFieldDropdownOpen ? (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[220px] overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
                    {CHECKOUT_FIELD_CHOICES.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          const mappedType: CheckoutFieldType =
                            opt.label === "Phone"
                              ? "phone"
                              : opt.label === "Text"
                                ? "text"
                                : opt.label === "Multiple choice"
                                  ? "multiple_choice"
                                  : opt.label === "Dropdown"
                                    ? "dropdown"
                                    : "checkboxes";
                          const defaultLabel =
                            mappedType === "phone"
                              ? "Phone Number"
                              : mappedType === "text"
                                ? "Short Answer Title"
                                : "";
                          setCustomCheckoutFieldCards((prev) => [
                            ...prev,
                            {
                              id:
                                typeof crypto !== "undefined" && "randomUUID" in crypto
                                  ? crypto.randomUUID()
                                  : `checkout-field-${Date.now()}-${prev.length}`,
                              type: mappedType,
                              label: defaultLabel,
                              required: false,
                              options:
                                mappedType === "multiple_choice" ||
                                mappedType === "dropdown" ||
                                mappedType === "checkboxes"
                                  ? ["Option 1", "Option 2"]
                                  : undefined,
                            },
                          ]);
                          setProductFormErrors((p) => ({ ...p, customFields: undefined }));
                          setCheckoutFieldDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-lg font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        <span className="text-base text-slate-400" aria-hidden>
                          {opt.icon}
                        </span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {isDigitalProductFlow ? (
            <section>
              <h2 className="text-base font-bold text-slate-900">
                5<span className="ml-2 font-semibold">Upload your Digital Product</span>
              </h2>
              <div className="mt-4">
                <label className="text-sm font-semibold text-slate-800">
                  Digital Product <span className="text-rose-500">*</span>
                </label>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-900">
                    Stan will send these files automatically to your customer upon purchase!
                  </p>
                  <div className="inline-flex overflow-hidden rounded-lg border border-violet-500">
                    <button
                      type="button"
                      onClick={() => {
                        setDigitalDelivery("upload");
                        setProductFormErrors((p) => ({ ...p, digitalRedirect: undefined }));
                      }}
                      className={`px-4 py-2 text-sm font-semibold transition ${
                        digitalDelivery === "upload"
                          ? "bg-violet-500 text-white"
                          : "bg-white text-violet-600"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDigitalDelivery("redirect");
                        setProductFormErrors((p) => ({ ...p, digitalFile: undefined }));
                      }}
                      className={`border-l border-violet-500 px-4 py-2 text-sm font-semibold transition ${
                        digitalDelivery === "redirect"
                          ? "bg-violet-500 text-white"
                          : "bg-white text-violet-600"
                      }`}
                    >
                      Redirect to URL
                    </button>
                  </div>
                </div>
              </div>

              {digitalDelivery === "upload" ? (
                <div className="mt-4 rounded-xl border border-dashed border-[#d8e8ff] bg-white p-7 text-center">
                  <p className="text-[15px] text-slate-500">Drag Your File(s) Here</p>
                  <button
                    type="button"
                    onClick={() => {
                      digitalFileRef.current?.click();
                      setProductFormErrors((p) => ({ ...p, digitalFile: undefined }));
                    }}
                    className="mt-4 rounded-xl border px-8 py-2 text-[15px] font-semibold"
                    style={{ borderColor: PURPLE, color: PURPLE }}
                  >
                    Upload
                  </button>
                  {digitalFileName ? (
                    <p className="mt-3 truncate text-sm text-slate-600">{digitalFileName}</p>
                  ) : null}
                  {productFormErrors.digitalFile ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">{productFormErrors.digitalFile}</p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4">
                  <label htmlFor="digital-redirect-url" className="text-sm font-semibold text-slate-800">
                    Redirect URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="digital-redirect-url"
                    type="url"
                    value={digitalRedirectUrl}
                    onChange={(e) => {
                      setDigitalRedirectUrl(e.target.value);
                      setProductFormErrors((p) => ({ ...p, digitalRedirect: undefined }));
                    }}
                    placeholder="https://example.com/download"
                    aria-invalid={Boolean(productFormErrors.digitalRedirect)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                      productFormErrors.digitalRedirect
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                        : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                    }`}
                  />
                  {productFormErrors.digitalRedirect ? (
                    <p className="mt-1.5 text-xs font-medium text-rose-600">{productFormErrors.digitalRedirect}</p>
                  ) : null}
                </div>
              )}
            </section>
          ) : null}

          
        </div>
      ) : activeTab === "webinar" ? (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="text-base font-bold text-slate-900">
              1<span className="ml-2 font-semibold">Add webinar slots</span>
              <span className="text-rose-500"> *</span>
            </h2>
            {productFormErrors.webinarSlots ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{productFormErrors.webinarSlots}</p>
            ) : null}
            <div className="mt-4 space-y-3">
              {webinarSlots.map((slot, idx) => (
                <div key={`${slot.dateIso}-${idx}`} className="relative grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setWebinarDatePickerIndex((prev) => (prev === idx ? null : idx))
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-lg font-semibold text-slate-800"
                    >
                      <span>{formatSlotDate(slot.dateIso)}</span>
                      <span className="text-slate-400">▾</span>
                    </button>
                    {webinarDatePickerIndex === idx ? (
                      <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-[330px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                        <div className="mb-2 text-center text-[38px] font-semibold text-slate-800">
                          {monthTitle}
                        </div>
                        <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-semibold text-slate-500">
                          {weekNames.map((w) => (
                            <div key={w}>{w}</div>
                          ))}
                        </div>
                        <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
                          {monthCells.map((cell) => {
                            const selected = slot.dateIso === cell.iso;
                            const cellDate = new Date(`${cell.iso}T00:00:00`);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isPast = cellDate < today;
                            return (
                              <button
                                key={cell.iso}
                                type="button"
                                disabled={isPast}
                                onClick={() => {
                                  updateWebinarSlot(idx, { dateIso: cell.iso });
                                  setWebinarDatePickerIndex(null);
                                  setProductFormErrors((p) => ({ ...p, webinarSlots: undefined }));
                                }}
                                className={`mx-auto h-9 w-9 rounded-full text-sm ${
                                  selected
                                    ? "bg-violet-500 font-semibold text-white"
                                    : isPast
                                      ? "cursor-not-allowed text-slate-300"
                                    : cell.inMonth
                                      ? "text-slate-700 hover:bg-slate-100"
                                      : "text-slate-300"
                                }`}
                              >
                                {cell.day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setWebinarTimeOptionsOpenIndex((prev) => (prev === idx ? null : idx))
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-violet-400 bg-white px-4 py-3 text-left text-lg font-semibold text-slate-800"
                    >
                      <span>{slot.time}</span>
                      <span className="text-slate-400">▾</span>
                    </button>
                    {webinarTimeOptionsOpenIndex === idx ? (
                      <div className="absolute left-0 top-[calc(100%+8px)] z-30 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                        {webinarTimeOptions.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              updateWebinarSlot(idx, { time });
                              setWebinarTimeOptionsOpenIndex(null);
                              setProductFormErrors((p) => ({ ...p, webinarSlots: undefined }));
                            }}
                            className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm ${
                              slot.time === time
                                ? "bg-slate-100 font-semibold text-slate-900"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Delete slot"
                    onClick={() => {
                      setWebinarSlots((prev) => prev.filter((_, i) => i !== idx));
                      setWebinarDatePickerIndex(null);
                      setWebinarTimeOptionsOpenIndex(null);
                    }}
                    className="absolute -right-8 top-2 text-slate-400 hover:text-rose-500"
                  >
                    🗑
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setWebinarSlots((prev) => [...prev, { dateIso: "2026-04-27", time: "1:00 PM" }]);
                  setProductFormErrors((p) => ({ ...p, webinarSlots: undefined }));
                }}
                className="w-full rounded-xl border-2 border-violet-400 px-4 py-2.5 text-sm font-semibold text-violet-600"
              >
                + Add Slot
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              2<span className="ml-2 font-semibold">Configure webinar settings</span>
            </h2>
            {productFormErrors.webinarSettings ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{productFormErrors.webinarSettings}</p>
            ) : null}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <select
                value={durationMins}
                onChange={(e) => {
                  setDurationMins(e.target.value);
                  setProductFormErrors((p) => ({ ...p, webinarSettings: undefined }));
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none"
              >
                <option>30 min</option>
                <option>45 min</option>
                <option>60 min</option>
                <option>90 min</option>
              </select>
              <select
                value={timeZone}
                onChange={(e) => {
                  setTimeZone(e.target.value);
                  setProductFormErrors((p) => ({ ...p, webinarSettings: undefined }));
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none"
              >
                <option>IST - Kolkata, Calcutta | UTC +5.5</option>
                <option>UTC - Coordinated Universal Time</option>
                <option>EST - New York | UTC -5</option>
              </select>
              <select
                value={meetingLocation}
                onChange={(e) => {
                  setMeetingLocation(e.target.value);
                  setProductFormErrors((p) => ({ ...p, webinarSettings: undefined }));
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none"
              >
                <option>Default</option>
                <option>Zoom Meeting</option>
                <option>Google Meet</option>
                <option>Custom Location</option>
              </select>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3">
                <input
                  value={maxAttendees}
                  onChange={(e) => {
                    setMaxAttendees(e.target.value.replace(/\D/g, ""));
                    setProductFormErrors((p) => ({ ...p, webinarSettings: undefined }));
                  }}
                  className="w-full bg-transparent text-[15px] outline-none"
                />
                <span className="text-sm text-slate-400">seats/slot</span>
              </div>
            </div>
          </section>
        </div>
      ) : activeTab === "course" ? (
        courseBuilderOpen ? (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCourseBuilderOpen(false)}
                className="text-violet-600 hover:text-violet-700"
                aria-label="Back to course modules"
              >
                ←
              </button>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Course Builder</h2>
            </div>

            <section>
              <p className="mb-2 text-sm font-semibold text-slate-800">Video</p>
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-2xl text-slate-500">
                    {courseBuilderVideoUrl ? (
                      <video src={courseBuilderVideoUrl} className="h-full w-full object-cover" />
                    ) : (
                      "▶"
                    )}
                  </div>
                  <div className="flex-1 text-center text-sm text-slate-500">
                    {courseBuilderVideoName ? `Selected: ${courseBuilderVideoName}` : "Upload a lesson video here"}
                  </div>
                  <button
                    type="button"
                    onClick={() => courseBuilderVideoFileRef.current?.click()}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold text-violet-700"
                    style={{ borderColor: "#a78bfa" }}
                  >
                    Select Video
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800" htmlFor="lesson-title">
                  Lesson Title
                </label>
                <span className="text-xs text-slate-400">{lessonTitle.length}/100</span>
              </div>
              <input
                id="lesson-title"
                value={lessonTitle}
                maxLength={100}
                onChange={(e) => {
                  setLessonTitle(e.target.value);
                  setProductFormErrors((p) => ({ ...p, course: undefined }));
                }}
                className="w-full rounded-xl border border-violet-300 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </section>

            <section>
              <p className="mb-1 text-sm font-semibold text-slate-800">Description</p>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  <span className="rounded border border-slate-200 px-2 py-0.5">H</span>
                  <span className="rounded border border-slate-200 px-2 py-0.5 font-bold">B</span>
                  <span className="rounded border border-slate-200 px-2 py-0.5 italic">I</span>
                  <span className="rounded border border-slate-200 px-2 py-0.5">🔗</span>
                  <span className="rounded border border-slate-200 px-2 py-0.5">🖼</span>
                </div>
                <textarea
                  value={lessonDescription}
                  onChange={(e) => {
                    setLessonDescription(e.target.value);
                    setProductFormErrors((p) => ({ ...p, course: undefined }));
                  }}
                  rows={8}
                  className="w-full resize-y px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none"
                />
              </div>
            </section>

            <section>
              <p className="text-sm font-semibold text-slate-800">Supporting Materials</p>
              <p className="mt-1 text-xs text-slate-500">
                Upload any files to help your students complete this module
              </p>
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <p className="text-sm text-slate-500">Drag Your File(s) Here</p>
                <button
                  type="button"
                  className="mt-3 rounded-lg border px-6 py-2 text-sm font-semibold text-violet-700"
                  style={{ borderColor: "#a78bfa" }}
                >
                  Upload
                </button>
              </div>
            </section>
          </div>
        ) : (
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
            {productFormErrors.course ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{productFormErrors.course}</p>
            ) : null}
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-semibold text-slate-900">Module 1: Introduction</p>
                  <div className="flex items-center gap-3">
                    {listingStatus === "published" ? (
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        Published
                      </span>
                    ) : null}
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
                  onClick={() => setCourseBuilderOpen(true)}
                  className="mt-4 w-full rounded-xl border-2 border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700"
                >
                  + Add Lesson
                </button>
              </div>

              {courseModules.map((moduleName, idx) => (
                <div
                  key={`${moduleName}-${idx}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4"
                >
                  <p className="text-lg font-semibold text-slate-900">{moduleName}</p>
                  <div className="flex items-center gap-3">
                    {listingStatus === "published" ? (
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                        Draft
                      </span>
                    )}
                    <button type="button" className="text-slate-400">⋮</button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setCourseModules((prev) => [...prev, "Next Module!"]);
                  setProductFormErrors((p) => ({ ...p, course: undefined }));
                }}
                className="w-full rounded-xl border-2 border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700"
              >
                + Add Module
              </button>
            </div>
          </section>
        </div>
        )
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
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAvailabilityDays((prev) => prev.filter((d) => d !== day));
                            setProductFormErrors((p) => ({ ...p, availabilityDays: undefined, availability: undefined }));
                          }}
                          className="px-1 text-slate-400 hover:text-rose-500"
                          aria-label={`Delete ${day} availability`}
                        >
                          🗑
                        </button>
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
          {showReviewsInOptions ? (
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
                  {productFormErrors.reviews ? (
                    <p className="mb-3 text-xs font-medium text-rose-600">{productFormErrors.reviews}</p>
                  ) : null}
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">⋮</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, i) => {
                                const starValue = i + 1;
                                return (
                                  <button
                                    key={starValue}
                                    type="button"
                                    onClick={() =>
                                      setReviews((prev) =>
                                        prev.map((r) =>
                                          r.id === review.id ? { ...r, rating: starValue } : r
                                        )
                                      )
                                    }
                                    className={`text-lg leading-none ${review.rating >= starValue ? "text-amber-400" : "text-slate-200"}`}
                                    aria-label={`Rate ${starValue} star`}
                                  >
                                    ★
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setReviews((prev) => prev.filter((r) => r.id !== review.id));
                              setReviewErrorsById((prev) => {
                                const next = { ...prev };
                                delete next[review.id];
                                return next;
                              });
                            }}
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
                            <div>
                              <input
                                value={review.name}
                                onChange={(e) => {
                                  setReviews((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r))
                                  );
                                  setReviewErrorsById((prev) => ({
                                    ...prev,
                                    [review.id]: { ...prev[review.id], name: undefined },
                                  }));
                                }}
                                placeholder="Name"
                                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                                  reviewErrorsById[review.id]?.name
                                    ? "border-rose-500 ring-1 ring-rose-100"
                                    : "border-slate-200"
                                }`}
                              />
                              {reviewErrorsById[review.id]?.name ? (
                                <p className="mt-1 text-xs text-rose-600">{reviewErrorsById[review.id]?.name}</p>
                              ) : null}
                            </div>
                            <div>
                              <textarea
                                value={review.text}
                                onChange={(e) => {
                                  setReviews((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, text: e.target.value } : r))
                                  );
                                  setReviewErrorsById((prev) => ({
                                    ...prev,
                                    [review.id]: { ...prev[review.id], text: undefined },
                                  }));
                                }}
                                placeholder="Text"
                                rows={3}
                                className={`w-full rounded-lg border bg-[#f6f6ff] px-3 py-2.5 text-sm outline-none ${
                                  reviewErrorsById[review.id]?.text
                                    ? "border-rose-500 ring-1 ring-rose-100"
                                    : "border-slate-200"
                                }`}
                              />
                              {reviewErrorsById[review.id]?.text ? (
                                <p className="mt-1 text-xs text-rose-600">{reviewErrorsById[review.id]?.text}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReviews((prev) => [...prev, getNewReview()]);
                      setProductFormErrors((p) => ({ ...p, reviews: undefined }));
                    }}
                    className="mt-4 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    style={{ borderColor: "#b9abf8", color: "#7c65f6" }}
                  >
                    + Add customer review
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
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
                    onClick={() => void addEmailFlow()}
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
                          <span className="ml-2 font-normal text-slate-400">
                            {availableFlows.find((flow) => flow.id === fid)?.name || fid}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = emailFlowIds.filter((x) => x !== fid);
                            setEmailFlowIds(next);
                            if (productId && token) {
                              void saveToApi(
                                listingStatus === "published" ? "published" : "draft",
                                next
                              );
                            }
                          }}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {flowsLoading ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Loading email flows...
                  </p>
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

          {isCoachingCheckout ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,.06)]">
              <button
                type="button"
                onClick={() => setReminderOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50/80"
              >
                <span className="flex items-center gap-3">
                  <span className="text-slate-500">🔔</span>
                  <span className="text-base font-bold text-slate-900">Reminder</span>
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`shrink-0 text-slate-400 transition ${reminderOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {reminderOpen ? (
                <div className="space-y-5 border-t border-slate-100 px-5 pb-5 pt-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={reminderEnabled}
                      onClick={() => setReminderEnabled((v) => !v)}
                      className={`relative h-6 w-11 rounded-full ${reminderEnabled ? "bg-violet-500" : "bg-slate-300"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${reminderEnabled ? "left-5" : "left-0.5"}`} />
                    </button>
                    <div>
                      <p className="text-lg font-bold text-slate-900">Email Reminders</p>
                      <p className="text-sm text-slate-500">Send a reminder email before specified times.</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="rem-subject">
                        Subject
                      </label>
                      <button
                        type="button"
                        onClick={() => setReminderSubject(DEFAULT_REMINDER_SUBJECT)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Restore Default
                      </button>
                    </div>
                    <input
                      id="rem-subject"
                      value={reminderSubject}
                      maxLength={CONFIRMATION_SUBJECT_MAX}
                      onChange={(e) => setReminderSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="rem-body">
                        Body
                      </label>
                      <button
                        type="button"
                        onClick={() => setReminderBody(DEFAULT_REMINDER_BODY)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Restore Default
                      </button>
                    </div>
                    <textarea
                      id="rem-body"
                      value={reminderBody}
                      maxLength={CONFIRMATION_BODY_MAX}
                      onChange={(e) => setReminderBody(e.target.value)}
                      rows={8}
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
                    />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">Timing</p>
                    <div className="mt-3 space-y-3">
                      {reminderTimings.map((timing) => (
                        <div key={timing.id} className="flex items-center gap-3">
                          <input
                            value={timing.amount}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^\d]/g, "");
                              setReminderTimings((prev) =>
                                prev.map((t) => (t.id === timing.id ? { ...t, amount: val } : t))
                              );
                            }}
                            className="w-40 rounded-xl border border-slate-200 px-4 py-3 text-[15px] font-semibold outline-none focus:border-violet-400"
                          />
                          <select
                            value={timing.unit}
                            onChange={(e) => {
                              const unit =
                                e.target.value === "minute(s) before"
                                  ? "minute(s) before"
                                  : e.target.value === "day(s) before"
                                    ? "day(s) before"
                                    : "hour(s) before";
                              setReminderTimings((prev) =>
                                prev.map((t) => (t.id === timing.id ? { ...t, unit } : t))
                              );
                            }}
                            className="w-80 rounded-xl border border-slate-200 px-4 py-3 text-[15px] font-semibold outline-none focus:border-violet-400"
                          >
                            <option>minute(s) before</option>
                            <option>hour(s) before</option>
                            <option>day(s) before</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              setReminderTimings((prev) =>
                                prev.length > 1 ? prev.filter((t) => t.id !== timing.id) : prev
                              )
                            }
                            className="px-2 text-slate-400 hover:text-rose-500"
                            aria-label="Delete reminder timing"
                            title="Delete reminder timing"
                          >
                            🗑
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setReminderTimings((prev) => [
                          ...prev,
                          {
                            id:
                              typeof crypto !== "undefined" && "randomUUID" in crypto
                                ? crypto.randomUUID()
                                : `rem-${Date.now()}-${prev.length}`,
                            amount: String(prev.length + 1),
                            unit: "hour(s) before",
                          },
                        ])
                      }
                      className="mt-4 w-full rounded-xl border-2 px-4 py-2.5 text-sm font-bold"
                      style={{ borderColor: PURPLE, color: PURPLE }}
                    >
                      + Add Reminder
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

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

      {activeTab === "course" && courseBuilderOpen ? (
        <div className="mt-10 border-t border-slate-100 pt-8">
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              className="text-sm italic text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              Improve this page
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
            >
              🗑 Delete
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={saving || Boolean(toast)}
                onClick={() => void handleSaveDraft()}
                className="inline-flex items-center justify-center gap-2 border-2 bg-white px-6 py-3 text-sm font-bold transition disabled:opacity-50"
                style={{ borderRadius: "8px", borderColor: PURPLE, color: PURPLE }}
              >
                Save As Draft
              </button>
              <button
                type="button"
                disabled={saving || Boolean(toast)}
                onClick={() => void handlePublish()}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PURPLE }}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      ) : (
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
          {activeTab === "checkout" ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={isWebinarFlow ? goToWebinarTab : () => void handlePublish()}
              className={
                isWebinarFlow
                  ? "rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
                  : "inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
              }
              style={isWebinarFlow ? undefined : { backgroundColor: PURPLE }}
            >
              {isWebinarFlow ? "Next" : "Publish"}
            </button>
          ) : null}
          {activeTab === "course" ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={() => void handlePublish()}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: PURPLE }}
            >
              Publish
            </button>
          ) : null}
          {activeTab === "webinar" ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={() => void handlePublish()}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: PURPLE }}
            >
              Publish
            </button>
          ) : null}
          {activeTab === "options" ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={() => void handlePublish()}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: PURPLE }}
            >
              Publish
            </button>
          ) : null}
          {activeTab === "availability" ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={() => void handlePublish()}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: PURPLE }}
            >
              Publish
            </button>
          ) : null}
          {activeTab === "thumbnail" ? (
            isUrlMediaFlow || isAffiliateFlow ? (
              <button
                type="button"
                disabled={saving || Boolean(toast)}
                onClick={() => void handlePublish()}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PURPLE }}
              >
                Publish
              </button>
            ) : (
              <button
                type="button"
                disabled={saving || Boolean(toast)}
                onClick={goToCheckoutTab}
                className="bg-blue-600 px-12 py-3 text-sm font-bold text-white transition hover:bg-blue-400 disabled:opacity-50"
                style={{ borderRadius: "8px" }}
              >
                Next
              </button>
            )
          ) : null}
        </div>
      </div>
      )}
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
    {descriptionVideoModalOpen ? (
      <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-[760px] rounded-[20px] bg-white p-6 shadow-2xl sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="w-full text-center text-[34px] font-bold text-[#24334f]">Add a Video</h3>
            <button
              type="button"
              onClick={closeDescriptionVideoModal}
              className="text-2xl leading-none text-slate-400 hover:text-slate-600"
              aria-label="Close add video modal"
            >
              ×
            </button>
          </div>
          <div className="mx-auto w-full max-w-[620px]">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400" aria-hidden>
                <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.5 1.5" />
                <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7L13 18" />
              </svg>
              <input
                value={descriptionVideoUrl}
                onChange={(e) => setDescriptionVideoUrl(e.target.value)}
                placeholder="Paste a YouTube, Loom, or Wistia video link here..."
                className="w-full border-0 text-sm text-slate-700 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleEmbedDescriptionVideo}
              className="mt-5 w-full rounded-xl bg-[#d8deec] py-3 text-base font-semibold text-[#4f5f7f] hover:bg-[#cfd8ea]"
            >
              Embed Video
            </button>
            <button
              type="button"
              onClick={() => descriptionVideoFileRef.current?.click()}
              className="mt-4 w-full rounded-xl border border-violet-400 py-3 text-base font-semibold text-violet-600 hover:bg-violet-50"
            >
              Upload Your Own
            </button>
          </div>
        </div>
      </div>
    ) : null}
    {descriptionLinkModalOpen ? (
      <div className="fixed inset-0 z-[126] flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-[760px] rounded-[20px] bg-white p-6 shadow-2xl sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="w-full text-center text-[38px] font-bold text-[#24334f]">Insert Link</h3>
            <button
              type="button"
              onClick={closeDescriptionLinkModal}
              className="text-2xl leading-none text-slate-400 hover:text-slate-600"
              aria-label="Close insert link modal"
            >
              ×
            </button>
          </div>
          <div className="mx-auto w-full max-w-[620px]">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400" aria-hidden>
                <path d="M4 20h16" />
                <path d="m6 16 5-10 3 6 4-8" />
              </svg>
              <input
                value={descriptionLinkName}
                onChange={(e) => setDescriptionLinkName(e.target.value)}
                placeholder="Name"
                className="w-full border-0 text-base text-slate-700 outline-none"
              />
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400" aria-hidden>
                <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.5 1.5" />
                <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7L13 18" />
              </svg>
              <input
                value={descriptionLinkUrl}
                onChange={(e) => setDescriptionLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border-0 text-base text-slate-700 outline-none"
              />
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleRemoveDescriptionLink}
                className="rounded-xl border border-violet-400 px-6 py-3 text-base font-semibold text-violet-600 hover:bg-violet-50"
              >
                Remove Hyperlink
              </button>
              <button
                type="button"
                onClick={handleSaveDescriptionLink}
                className="min-w-[140px] rounded-xl bg-[#6156f5] px-8 py-3 text-base font-semibold text-white hover:bg-[#5549ef]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
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
