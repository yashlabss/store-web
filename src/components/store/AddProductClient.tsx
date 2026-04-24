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

type UserRow = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
};

type TabKey = "thumbnail" | "checkout" | "options";
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
  const wrap = style === "button" ? "max-w-[240px]" : style === "preview" ? "max-w-[280px]" : "max-w-[280px]";
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
    <div className="mx-auto w-full max-w-[280px]">
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
        <div className="max-h-[min(520px,70vh)] overflow-y-auto px-4 pb-6 pt-2">
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
  const [title, setTitle] = useState("Get My [Template/eBook/Course] Now!");
  const [subtitle, setSubtitle] = useState("We will deliver this file right to your inbox");
  const [buttonText, setButtonText] = useState("Get My Guide");
  const [price, setPrice] = useState(9.99);
  const [checkoutNote, setCheckoutNote] = useState("");
  const [optionsNote, setOptionsNote] = useState("");

  const [descriptionBody, setDescriptionBody] = useState("");
  const [bottomTitle, setBottomTitle] = useState("Get My Guide");
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
      tab === "thumbnail" || tab === "checkout" || tab === "options" ? tab : "thumbnail"
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
    const oj = p.options_json as { note?: string; attached_file_name?: string };
    if (typeof oj?.note === "string") setOptionsNote(oj.note);
    if (typeof oj?.attached_file_name === "string") setFileLabel(oj.attached_file_name);
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
    setProductId(null);
    setListingStatus("draft");
    setActiveTab("thumbnail");
    setStyle("callout");
    setTitle("Get My [Template/eBook/Course] Now!");
    setSubtitle("We will deliver this file right to your inbox");
    setButtonText("Get My Guide");
    setPrice(9.99);
    setCheckoutNote("");
    setOptionsNote("");
    setDescriptionBody("");
    setBottomTitle("Get My Guide");
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
      active_tab: activeTab,
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
        ...(fileLabel ? { attached_file_name: fileLabel } : {}),
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
    fileLabel,
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

  const handlePublish = async () => {
    if (!title.trim()) {
      setSaveMsg("Add a title before publishing.");
      return;
    }
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
        <p className="mt-4 text-sm font-medium text-emerald-600" role="status">
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
                ] as const
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
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center">
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
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
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
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
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
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
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
              2<span className="ml-2 font-semibold">Write description</span>
            </h2>
            <div className="mt-4 mb-1 flex items-center justify-between gap-2">
              <label htmlFor="desc-body" className="text-sm font-semibold text-slate-800">
                Description Body<span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {descriptionBody.length}/{DESC_MAX}
              </span>
            </div>
            <p className="mb-2 text-sm text-slate-500">
              Separate paragraphs with a blank line. Start lines with `- ` for bullet lists.
            </p>
            <textarea
              id="desc-body"
              value={descriptionBody}
              maxLength={DESC_MAX}
              onChange={(e) => setDescriptionBody(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="Describe your product…"
            />
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
                  onChange={(e) => setBottomTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
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
                  onChange={(e) => setPurchaseCta(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              3<span className="ml-2 font-semibold">Set price</span>
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-800" htmlFor="price-main">
                  Price ($)<span className="text-rose-500">*</span>
                </label>
                <input
                  id="price-main"
                  type="number"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1 w-full max-w-xs rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
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
                        return next;
                      });
                    }}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      discountEnabled ? "bg-violet-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                        discountEnabled ? "left-6" : "left-0.5"
                      }`}
                    />
                  </button>
                  Discount price ($)
                </label>
              </div>
              <div>
                <label
                  className={`text-sm font-semibold ${discountEnabled ? "text-slate-800" : "text-slate-400"}`}
                  htmlFor="discount-amt"
                >
                  Discount amount
                </label>
                <input
                  id="discount-amt"
                  type="number"
                  min={0}
                  step={0.01}
                  disabled={!discountEnabled}
                  value={discountEnabled ? discountPrice : 0}
                  onChange={(e) => setDiscountPrice(Number(e.target.value))}
                  className="mt-1 w-full max-w-xs rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-6 flex w-full max-w-md items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500"
            >
              <span aria-hidden>🔒</span>
              Upgrade to Unlock
            </button>
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
                  }}
                  placeholder={`Custom field ${idx + 1}`}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
                />
              ))}
              <button
                type="button"
                onClick={() => setCustomCheckoutFields((f) => [...f, ""])}
                className="rounded-xl border-2 px-5 py-2.5 text-sm font-bold"
                style={{ borderColor: PURPLE, color: PURPLE }}
              >
                + Add Field
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              5<span className="ml-2 font-semibold">Upload your Digital Product</span>
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              We&apos;ll deliver these files to your customer after purchase.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDigitalDelivery("upload")}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  digitalDelivery === "upload"
                    ? "text-white shadow-sm"
                    : "border-2 border-slate-200 bg-white text-slate-600"
                }`}
                style={
                  digitalDelivery === "upload" ? { backgroundColor: PURPLE } : undefined
                }
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setDigitalDelivery("redirect")}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  digitalDelivery === "redirect"
                    ? "text-white shadow-sm"
                    : "border-2 border-slate-200 bg-white text-slate-600"
                }`}
                style={
                  digitalDelivery === "redirect" ? { backgroundColor: PURPLE } : undefined
                }
              >
                Redirect to URL
              </button>
            </div>
            {digitalDelivery === "upload" ? (
              <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
                <p className="text-sm font-medium text-slate-600">Drag your file(s) here</p>
                {digitalFileName ? (
                  <p className="mt-2 text-xs text-slate-500">{digitalFileName}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => digitalFileRef.current?.click()}
                  className="mt-4 rounded-xl border-2 px-6 py-2.5 text-sm font-bold"
                  style={{ borderColor: PURPLE, color: PURPLE }}
                >
                  Upload
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <label className="text-sm font-semibold text-slate-800" htmlFor="redir-url">
                  Redirect URL
                </label>
                <input
                  id="redir-url"
                  type="url"
                  value={digitalRedirectUrl}
                  onChange={(e) => setDigitalRedirectUrl(e.target.value)}
                  placeholder="https://"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
                />
              </div>
            )}
          </section>

          <section>
            <label className="text-sm font-semibold text-slate-800" htmlFor="cknote">
              Note for buyer (optional)
            </label>
            <textarea
              id="cknote"
              value={checkoutNote}
              onChange={(e) => setCheckoutNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
              placeholder="Shown on receipt email (optional)."
            />
          </section>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Options</h2>
          <p className="text-sm text-slate-600">
            Extra settings for this product. Stored as JSON on the product row.
          </p>
          <div>
            <label className="text-sm font-semibold text-slate-800" htmlFor="optnote">
              Internal note
            </label>
            <textarea
              id="optnote"
              value={optionsNote}
              onChange={(e) => setOptionsNote(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
              placeholder="Visible only to you in the editor."
            />
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
              style={{ borderRadius: "8px" }}
            style={{ borderColor: PURPLE, color: PURPLE }}
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
              onClick={() => void handlePublish()}
              className="rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Publish
            </button>
          ) : activeTab === "thumbnail" ? (
            <button
              type="button"
              disabled={saving || Boolean(toast)}
              onClick={() => {
                ensureCheckoutDefaults();
                setActiveTab("checkout");
              }}
              className="bg-blue-600 px-12 py-3 text-sm font-bold text-white transition hover:bg-blue-400 disabled:opacity-50"
              style={{ borderRadius: "8px" }}
            >
              Next
            </button>
          ) : null}
        </div>
      </div>
    </DashboardShell>
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
