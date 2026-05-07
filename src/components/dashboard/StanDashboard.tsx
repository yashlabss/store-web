"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  IconArrowUpRight,
  IconPencil,
  IconSparkle,
  IconStoreTab,
} from "./dashboardIcons";
import { publicStoreUrl } from "../../lib/publicStorePath";
import { API_PRODUCTS_BASE } from "../../lib/api";
import { networkErrorMessage } from "../../lib/networkError";
import DashboardShell, { PURPLE } from "./DashboardShell";
import {
  PRODUCT_CATEGORIES,
  normalizeProductCategoryKey,
  type ProductCategoryKey,
} from "../../lib/productCategories";

type Props = {
  displayName: string;
  handle: string;
  showName: string;
  onSignOut: () => void;
};

type ProductRow = {
  id: string;
  status: string;
  location?: string;
  title: string;
  subtitle: string;
  button_text: string;
  price_numeric: number;
  thumbnail_url: string | null;
  checkout_json: Record<string, unknown> | null;
  options_json?: Record<string, unknown> | null;
  active_tab?: string;
  style?: string;
  updated_at: string;
};

const DELETED_PRODUCT_IDS_KEY = "stan_deleted_product_ids";
const DASHBOARD_FILTER_CATEGORY_KEYS = new Set<ProductCategoryKey>([
  "all",
  "collect_emails_applications",
  "digital_product",
  "coaching",
  "custom_product",
  "ecourse",
  "recurring_membership",
  "webinar",
  "community",
  "url_media",
  "stan_affiliate",
]);
const DASHBOARD_FILTER_CATEGORIES = PRODUCT_CATEGORIES.filter((cat) =>
  DASHBOARD_FILTER_CATEGORY_KEYS.has(cat.key as ProductCategoryKey)
);
const CATEGORY_KEY_SET = new Set<ProductCategoryKey>(
  PRODUCT_CATEGORIES.map((x) => x.key).filter((x): x is ProductCategoryKey => x !== "all")
);

function detectProductCategory(p: ProductRow): ProductCategoryKey {
  const toDashboardCategory = (key: ProductCategoryKey): ProductCategoryKey => {
    if (key === "audio" || key === "video" || key === "pdf") return "digital_product";
    if (key === "uncategorized") return "digital_product";
    return key;
  };
  const options = (p.options_json || {}) as Record<string, unknown>;
  const checkout = (p.checkout_json || {}) as Record<string, unknown>;
  const explicitCategory =
    normalizeProductCategoryKey(options.category) ||
    normalizeProductCategoryKey(options.category_key) ||
    normalizeProductCategoryKey(options.product_category) ||
    normalizeProductCategoryKey(checkout.category) ||
    normalizeProductCategoryKey(checkout.product_category);
  if (explicitCategory) return toDashboardCategory(explicitCategory);
  const t = `${String(p.title || "")} ${String(p.subtitle || "")} ${String(p.button_text || "")}`.toLowerCase();
  const digitalDelivery = String(checkout.digital_delivery || "").toLowerCase();
  const redirectUrl = String(checkout.digital_redirect_url || "").trim();
  const hasDigitalFile = Boolean(checkout.digital_file_name || checkout.digital_file_data_url);
  const fileName = String(checkout.digital_file_name || "").toLowerCase();
  const dataUrl = String(checkout.digital_file_data_url || "").toLowerCase();

  if (
    options.collect_emails === true ||
    Array.isArray(options.custom_fields) ||
    /collect emails?|email list|application|apply now|submit.*download/.test(t)
  ) {
    return "collect_emails_applications";
  }
  if (options.webinar || /webinar|masterclass|live session/.test(t)) return "webinar";
  if (options.availability || /coaching|consultation|book call|1:1/.test(t)) return "coaching";
  if (Array.isArray(options.lessons) || options.course || /course|module|lesson/.test(t)) return "ecourse";
  if (options.membership || /membership|subscription|monthly|recurring/.test(t)) return "recurring_membership";
  if (options.community || /community|discord|telegram|private group/.test(t)) return "community";
  if (options.affiliate || options.affiliate_url || /affiliate|refer/.test(t)) return "stan_affiliate";
  if (digitalDelivery === "redirect" || redirectUrl || /url|media link|external link/.test(t)) return "url_media";
  if (/\.mp3|\.wav|\.m4a|\.aac|\.ogg|\.flac/.test(fileName) || /^data:audio\//.test(dataUrl)) return "digital_product";
  if (/\.mp4|\.webm|\.mov|\.m3u8/.test(fileName) || /^data:video\//.test(dataUrl)) return "digital_product";
  if (/\.pdf/.test(fileName) || /^data:application\/pdf/.test(dataUrl)) return "digital_product";
  if (/template|notion|canva|sheet|kit/.test(t)) return "custom_product";
  if (hasDigitalFile || /download|digital|product file|ebook|pdf|video|audio/.test(t)) return "digital_product";
  return "digital_product";
}

function CategoryFilterChips({
  categories,
  activeCategory,
  onChange,
}: {
  categories: Array<{ key: ProductCategoryKey; label: string }>;
  activeCategory: ProductCategoryKey;
  onChange: (key: ProductCategoryKey) => void;
}) {
  return (
    <div className="mb-4 -mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-center gap-2 py-1">
        {categories.map((cat) => {
          const active = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onChange(cat.key)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                active
                  ? "border-[#6b46ff] bg-gradient-to-r from-[#6b46ff] to-[#8b5cf6] text-white shadow-[0_4px_14px_rgba(107,70,255,0.35)]"
                  : "border-[#e7dcc9] bg-white text-slate-600 hover:border-[#cdbf9f] hover:bg-[#faf7f1] hover:text-slate-900"
              }`}
              aria-pressed={active}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isLandingProduct(p: ProductRow): boolean {
  const anyP = p as ProductRow & {
    data?: { source_product_id?: string };
    options_json?: { data?: { source_product_id?: string }; location?: string } | null;
    checkout_json?: { data?: { source_product_id?: string }; location?: string } | null;
  };
  const explicitLocation =
    String(anyP.location || "") ||
    String(anyP.options_json?.location || "") ||
    String(anyP.checkout_json?.location || "");
  if (explicitLocation.toLowerCase() === "landing") return true;
  if (anyP.data?.source_product_id) return true;
  if (anyP.options_json?.data?.source_product_id) return true;
  if (anyP.checkout_json?.data?.source_product_id) return true;
  return /\blanding page\b/i.test(anyP.title || "");
}

function isDeletedProduct(p: ProductRow): boolean {
  const opts = (p.options_json || {}) as { __deleted?: boolean | string };
  return opts.__deleted === true || String(opts.__deleted).toLowerCase() === "true";
}

function normalizeLandingRows(payload: unknown): ProductRow[] {
  const data = payload as
    | { landing_pages?: unknown; landingPages?: unknown; pages?: unknown; products?: unknown }
    | unknown[];
  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(data?.landing_pages)
      ? data.landing_pages
      : Array.isArray(data?.landingPages)
        ? data.landingPages
        : Array.isArray(data?.pages)
          ? data.pages
          : Array.isArray(data?.products)
            ? data.products
            : [];
  const mapped: Array<ProductRow | null> = rawList.map((raw): ProductRow | null => {
      const item = raw as Record<string, unknown>;
      const id = typeof item.id === "string" ? item.id : "";
      if (!id) return null;
      return {
        id,
        status: typeof item.status === "string" ? item.status : "draft",
        location: "landing",
        title: typeof item.title === "string" ? item.title : "Untitled Landing Page",
        subtitle: typeof item.subtitle === "string" ? item.subtitle : "",
        button_text: typeof item.button_text === "string" ? item.button_text : "View",
        price_numeric: Number(item.price_numeric) || 0,
        thumbnail_url:
          typeof item.thumbnail_url === "string"
            ? item.thumbnail_url
            : typeof item.image_url === "string"
              ? item.image_url
              : null,
        checkout_json:
          item.checkout_json && typeof item.checkout_json === "object"
            ? (item.checkout_json as Record<string, unknown>)
            : {},
        options_json:
          item.options_json && typeof item.options_json === "object"
            ? ({ ...(item.options_json as Record<string, unknown>), location: "landing" } as Record<string, unknown>)
            : { location: "landing" },
        active_tab: typeof item.active_tab === "string" ? item.active_tab : "thumbnail",
        style: typeof item.style === "string" ? item.style : "callout",
        updated_at:
          typeof item.updated_at === "string" ? item.updated_at : new Date().toISOString(),
      };
    });
  return mapped.filter((row): row is ProductRow => row !== null);
}

function getProductEditHref(p: ProductRow): string {
  const options = (p.options_json || {}) as {
    collect_emails?: boolean;
    custom_fields?: unknown;
  };
  const hasCustomFieldsArray = Array.isArray(options.custom_fields);
  const looksLikeCollectEmailsButton = /submit\s*&?\s*download/i.test(p.button_text || "");
  const looksLikeCollectEmailsSubtitle = /join my email list|never miss an update/i.test(p.subtitle || "");
  if (options.collect_emails === true || hasCustomFieldsArray || looksLikeCollectEmailsButton || looksLikeCollectEmailsSubtitle) {
    return `/dashboard/store/product/emails?id=${encodeURIComponent(p.id)}`;
  }
  return `/dashboard/store/product/new?id=${encodeURIComponent(p.id)}`;
}

function readDeletedProductIds(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(DELETED_PRODUCT_IDS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function listDisplayPrice(p: ProductRow): number {
  const cj = (p.checkout_json || {}) as {
    discount_enabled?: boolean;
    discount_price?: number;
  };
  if (cj.discount_enabled && Number(cj.discount_price) > 0) {
    return Number(cj.discount_price);
  }
  return Number(p.price_numeric) || 0;
}

function firstImageFromDescriptionHtml(value: string): string | null {
  if (!value) return null;
  const match = value.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (!match?.[1]) return null;
  return match[1].trim() || null;
}

function getProductPreviewImageUrl(p: ProductRow): string | null {
  if (p.thumbnail_url?.trim()) return p.thumbnail_url;
  const checkout = (p.checkout_json || {}) as {
    checkout_image_url?: string | null;
    description_body?: string;
  };
  if (typeof checkout.checkout_image_url === "string" && checkout.checkout_image_url.trim()) {
    return checkout.checkout_image_url.trim();
  }
  if (typeof checkout.description_body === "string") {
    return firstImageFromDescriptionHtml(checkout.description_body);
  }
  return null;
}

function AvatarLarge({ label }: { label: string }) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full text-2xl font-semibold text-[#1f2a44] ring-1 ring-[#e7dcc9]"
      style={{ backgroundColor: "#f7f1e6" }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

function PhonePreview({ name, products }: { name: string; products: ProductRow[] | null }) {
  const previewProducts = products || [];
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div
        className="relative w-full max-w-[min(20rem,calc(100vw-2rem))] rounded-[2rem] border-[8px] border-[#1a1f46] bg-white p-5 pt-8 shadow-xl"
        style={{ minHeight: "min(480px, 58vh)", maxHeight: "min(520px, 70vh)" }}
      >
        <div className="mx-auto flex flex-col items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl font-semibold text-[#1f2a44] ring-1 ring-[#e7dcc9]" style={{ backgroundColor: "#f7f1e6" }}>
            {name.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <p className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900">
            {name}
          </p>
        </div>
        <div className="mt-5 max-h-[min(260px,36vh)] space-y-2.5 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {previewProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#d8c7ab] bg-[#fbf7f0] px-3 py-4 text-center text-xs text-slate-500">
              Added products will appear here
            </div>
          ) : (
            previewProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 rounded-xl border border-[#e7dcc9] bg-white px-2.5 py-2">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f7f1e6]">
                  {getProductPreviewImageUrl(p) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getProductPreviewImageUrl(p) || ""} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-slate-900">{p.title?.trim() || "Untitled product"}</p>
                  <p className="text-[11px] text-slate-600">${listDisplayPrice(p).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#1f2a44] text-white shadow-md"
          aria-label="Help"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      </div>
      <p className="mt-3 hidden text-center text-[11px] font-medium uppercase tracking-wide text-slate-400 lg:block">
        Preview
      </p>
    </div>
  );
}

/** Matches ProductListRow outer layout so loading → loaded doesn’t shift layout. */
function ProductListRowSkeleton() {
  return (
    <li className="pointer-events-none" aria-hidden>
      <div className="flex min-h-[80px] items-center gap-3 rounded-2xl border border-[#e7dcc9] bg-white px-3 py-3 shadow-sm sm:gap-4 sm:px-4">
        <span className="flex h-[18px] w-[18px] shrink-0 rounded bg-slate-100" />
        <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-100" />
        <div className="min-w-0 flex-1 space-y-2 py-0.5">
          <div className="h-4 max-w-[min(100%,14rem)] rounded-md bg-slate-100" />
          <div className="h-3.5 w-16 rounded-md bg-slate-100" />
        </div>
        <span className="h-5 w-5 shrink-0 rounded bg-slate-100" />
        <span className="h-6 min-w-[3.25rem] shrink-0 rounded-full bg-slate-100" />
        <span className="h-5 w-5 shrink-0 rounded bg-slate-100" />
      </div>
    </li>
  );
}

function ProductListRow({
  p,
  handle,
  onUnpublish,
  onDuplicate,
  onDelete,
  onMakeLanding,
  onNotify,
  onError,
}: {
  p: ProductRow;
  handle: string;
  onUnpublish: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMakeLanding: (id: string) => Promise<void>;
  onNotify: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const price = listDisplayPrice(p);
  const title = p.title?.trim() || "Untitled product";
  const previewImageUrl = getProductPreviewImageUrl(p);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<null | string>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editHref = getProductEditHref(p);
  const publicBase = publicStoreUrl(handle);
  const publicUrl = `${publicBase}${publicBase.includes("?") ? "&" : "?"}product=${encodeURIComponent(p.id)}`;
  const checkout = (p.checkout_json || {}) as {
    digital_file_data_url?: string | null;
    digital_file_name?: string | null;
  };
  const options = (p.options_json || {}) as { attached_file_name?: string | null };
  const digitalFileDataUrl = typeof checkout.digital_file_data_url === "string" ? checkout.digital_file_data_url : "";
  const digitalFileName =
    (typeof checkout.digital_file_name === "string" && checkout.digital_file_name.trim()) ||
    (typeof options.attached_file_name === "string" && options.attached_file_name.trim()) ||
    `${title}.bin`;

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const runAction = async (action: string, task: () => Promise<void>) => {
    setBusyAction(action);
    try {
      await task();
      setMenuOpen(false);
    } catch {
      onError("Action failed. Please try again.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDownloadProduct = async () => {
    if (!digitalFileDataUrl) {
      onError("No downloadable file found for this product.");
      return;
    }
    try {
      const link = document.createElement("a");
      link.href = digitalFileDataUrl;
      link.download = digitalFileName;
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onNotify("Download started.");
    } catch {
      onError("Could not start download. Please try again.");
    }
  };

  return (
    <li>
      <div className="flex min-h-[80px] items-center gap-3 rounded-2xl border border-[#e7dcc9] bg-white px-3 py-3 shadow-sm transition-[border-color,box-shadow] hover:border-[#d8c7ab] hover:shadow-md sm:gap-4 sm:px-4">
        <span className="flex shrink-0 cursor-grab text-[#d8c7ab]" aria-hidden title="Reorder (coming soon)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="9" cy="7" r="1.5" />
            <circle cx="15" cy="7" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="17" r="1.5" />
            <circle cx="15" cy="17" r="1.5" />
          </svg>
        </span>
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f7f1e6]">
          {previewImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImageUrl}
              alt=""
              width={56}
              height={56}
              decoding="async"
              className="block h-full w-full min-h-[56px] min-w-[56px] object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[56px] w-full items-center justify-center text-[10px] text-slate-400">
              No img
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => router.push(editHref)}
            className="block max-w-full truncate text-left font-semibold text-slate-900 hover:underline"
          >
            {title}
          </button>
          <p className="mt-0.5 text-sm font-medium" style={{ color: PURPLE }}>
            ${price.toFixed(2)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleDownloadProduct()}
          className="flex shrink-0 text-[#b08d57] transition hover:text-[#6c5a3d]"
          title="Download product file"
          aria-label="Download product file"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
        </button>
        {p.status === "draft" ? (
          <span className="inline-flex min-w-[3.25rem] shrink-0 justify-center rounded-full bg-[#f7f1e6] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#6c5a3d]">
            Draft
          </span>
        ) : (
          <span className="inline-flex min-w-[3.25rem] shrink-0 justify-center rounded-full bg-[#eceff3] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#1f2a44]">
            Live
          </span>
        )}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1 text-[#d8c7ab] transition hover:bg-[#f7f1e6] hover:text-[#6c5a3d]"
            aria-label="Open product actions"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => {
                  void runAction("copy", async () => {
                    const fullUrl = publicUrl.startsWith("http")
                      ? publicUrl
                      : typeof window !== "undefined"
                        ? `${window.location.origin}${publicUrl}`
                        : publicUrl;
                    let copied = false;
                    try {
                      if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(fullUrl);
                        copied = true;
                      }
                    } catch {
                      /* fallback below */
                    }
                    if (!copied) {
                      const ta = document.createElement("textarea");
                      ta.value = fullUrl;
                      ta.setAttribute("readonly", "");
                      ta.style.position = "absolute";
                      ta.style.left = "-9999px";
                      document.body.appendChild(ta);
                      ta.select();
                      copied = document.execCommand("copy");
                      document.body.removeChild(ta);
                    }
                    if (!copied) throw new Error("copy-failed");
                    onNotify("Product URL copied.");
                  });
                }}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Copy URL
              </button>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => router.push(editHref)}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Edit Product
              </button>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void runAction("unpublish", () => onUnpublish(p.id))}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Unpublish
              </button>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void runAction("duplicate", () => onDuplicate(p.id))}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Duplicate Product
              </button>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void runAction("landing", () => onMakeLanding(p.id))}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Make Landing Page
              </button>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void runAction("delete", () => onDelete(p.id))}
                className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                Delete Product
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function StanDashboard({ displayName, handle, showName, onSignOut }: Props) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "landing" ? "landing" : "store";
  const [activeCategory, setActiveCategory] = useState<ProductCategoryKey>("all");
  const [isFiltering, setIsFiltering] = useState(false);
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>(() => readDeletedProductIds());
  const [listError, setListError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const visibleProducts =
    products == null
      ? null
      : products.filter((p) => (activeTab === "landing" ? isLandingProduct(p) : !isLandingProduct(p)));
  const filteredProducts = useMemo(() => {
    if (!visibleProducts) return visibleProducts;
    if (activeCategory === "all") return visibleProducts;
    return visibleProducts.filter((p) => detectProductCategory(p) === activeCategory);
  }, [visibleProducts, activeCategory]);
  const categoryTabs = useMemo(
    () => DASHBOARD_FILTER_CATEGORIES as Array<{ key: ProductCategoryKey; label: string }>,
    []
  );

  useEffect(() => {
    setIsFiltering(true);
    const timer = window.setTimeout(() => setIsFiltering(false), 180);
    return () => window.clearTimeout(timer);
  }, [activeCategory]);
  useEffect(() => {
    const validKeys = new Set(categoryTabs.map((x) => x.key));
    if (!validKeys.has(activeCategory)) {
      setActiveCategory("all");
    }
  }, [categoryTabs, activeCategory]);

  const persistDeletedProductId = useCallback((id: string) => {
    setDeletedProductIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(DELETED_PRODUCT_IDS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const loadProducts = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      setProducts([]);
      return;
    }
    setListError("");
    try {
      const res = await fetch(`${API_PRODUCTS_BASE}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { message?: string }).message || "Could not load products.");
      }
      const rows = Array.isArray(data.products) ? (data.products as ProductRow[]) : [];
      let landingRows: ProductRow[] = [];
      try {
        const landingRes = await fetch("/api/landing-pages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (landingRes.ok) {
          const landingData = await landingRes.json().catch(() => ({}));
          landingRows = normalizeLandingRows(landingData);
        }
      } catch {
        /* landing pages API is optional; ignore failures */
      }
      const mergedRows = [...rows, ...landingRows];
      const dedupedRows = Array.from(new Map(mergedRows.map((row) => [row.id, row])).values());
      const hiddenIds = new Set(readDeletedProductIds());
      setProducts(dedupedRows.filter((p) => !isDeletedProduct(p) && !hiddenIds.has(p.id)));
    } catch (e) {
      setListError(networkErrorMessage(e));
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const runProductAction = useCallback(
    async (request: () => Promise<Response>, okMessage: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!token) throw new Error("Please log in again.");
      const res = await request();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message || "Action failed.");
      setActionMsg(okMessage);
      setListError("");
      await loadProducts();
    },
    [loadProducts]
  );

  const unpublishProduct = useCallback(
    async (id: string) => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        await runProductAction(
          () =>
            fetch(`${API_PRODUCTS_BASE}/${id}/unpublish`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            }),
          "Product moved to draft."
        );
      } catch (e) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
          if (!token) throw e;
          const fullRes = await fetch(`${API_PRODUCTS_BASE}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fullData = await fullRes.json().catch(() => ({}));
          if (!fullRes.ok || !(fullData as { product?: ProductRow }).product) {
            throw e;
          }
          const fullProduct = (fullData as {
            product: ProductRow & { options_json?: Record<string, unknown> };
          }).product;
          await runProductAction(
            () =>
              fetch(`${API_PRODUCTS_BASE}/draft`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: fullProduct.id,
                  status: "draft",
                  active_tab: fullProduct.active_tab || "thumbnail",
                  style: fullProduct.style || "callout",
                  title: fullProduct.title || "",
                  subtitle: fullProduct.subtitle || "",
                  button_text: fullProduct.button_text || "",
                  price_numeric: Number(fullProduct.price_numeric) || 0,
                  thumbnail_url: fullProduct.thumbnail_url || null,
                  checkout_json: fullProduct.checkout_json || {},
                  options_json: fullProduct.options_json || {},
                }),
              }),
            "Product moved to draft."
          );
        } catch (fallbackErr) {
          setListError(networkErrorMessage(fallbackErr));
        }
      }
    },
    [runProductAction]
  );

  const duplicateProduct = useCallback(
    async (id: string) => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        await runProductAction(
          () =>
            fetch(`${API_PRODUCTS_BASE}/${id}/duplicate`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            }),
          "Product duplicated."
        );
      } catch (e) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
          if (!token) throw e;
          const fullRes = await fetch(`${API_PRODUCTS_BASE}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fullData = await fullRes.json().catch(() => ({}));
          if (!fullRes.ok || !(fullData as { product?: ProductRow }).product) {
            throw e;
          }
          const fullProduct = (fullData as {
            product: ProductRow & { options_json?: Record<string, unknown> };
          }).product;
          await runProductAction(
            () =>
              fetch(`${API_PRODUCTS_BASE}/draft`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: "draft",
                  active_tab: fullProduct.active_tab || "thumbnail",
                  style: fullProduct.style || "callout",
                  title: `${fullProduct.title || "Untitled"} (Copy)`,
                  subtitle: fullProduct.subtitle || "",
                  button_text: fullProduct.button_text || "",
                  price_numeric: Number(fullProduct.price_numeric) || 0,
                  thumbnail_url: fullProduct.thumbnail_url || null,
                  checkout_json: fullProduct.checkout_json || {},
                  options_json: fullProduct.options_json || {},
                }),
              }),
            "Product duplicated."
          );
        } catch (fallbackErr) {
          setListError(networkErrorMessage(fallbackErr));
        }
      }
    },
    [runProductAction]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      // Hide immediately so deleted products never pop back into the list.
      persistDeletedProductId(id);
      setProducts((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        await runProductAction(
          () =>
            fetch(`${API_PRODUCTS_BASE}/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }),
          "Product deleted."
        );
      } catch (e) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
          if (!token) throw e;
          const fullRes = await fetch(`${API_PRODUCTS_BASE}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fullData = await fullRes.json().catch(() => ({}));
          if (!fullRes.ok || !(fullData as { product?: ProductRow }).product) {
            throw e;
          }
          const fullProduct = (fullData as { product: ProductRow }).product;
          await runProductAction(
            () =>
              fetch(`${API_PRODUCTS_BASE}/draft`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: fullProduct.id,
                  status: "draft",
                  active_tab:
                    fullProduct.active_tab === "checkout" || fullProduct.active_tab === "options"
                      ? fullProduct.active_tab
                      : "thumbnail",
                  style:
                    fullProduct.style === "button" || fullProduct.style === "preview"
                      ? fullProduct.style
                      : "callout",
                  title: fullProduct.title || "",
                  subtitle: fullProduct.subtitle || "",
                  button_text: fullProduct.button_text || "",
                  price_numeric: Number(fullProduct.price_numeric) || 0,
                  thumbnail_url: fullProduct.thumbnail_url || null,
                  checkout_json: fullProduct.checkout_json || {},
                  options_json: {
                    ...(fullProduct.options_json || {}),
                    __deleted: true,
                    __deleted_at: new Date().toISOString(),
                  },
                }),
              }),
            "Product deleted."
          );
        } catch (fallbackErr) {
          setListError(`${networkErrorMessage(fallbackErr)} Product is hidden locally as deleted.`);
        }
      }
    },
    [persistDeletedProductId, runProductAction]
  );

  const makeLandingPage = useCallback(async (id: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!token) throw new Error("Please log in again.");
      const source = (products || []).find((p) => p.id === id);
      const createViaLandingApi = async () => {
        const res = await fetch("/api/landing-pages", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `${source?.title || "Product"} Landing Page`,
            location: "landing",
            status: "draft",
            data: { source_product_id: id },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { message?: string }).message || "Could not create landing page.");
      };
      const createViaProductsDraftFallback = async () => {
        const res = await fetch(`${API_PRODUCTS_BASE}/draft`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "draft",
            active_tab: "thumbnail",
            style: source?.style || "callout",
            title: `${source?.title || "Product"} Landing Page`,
            subtitle: source?.subtitle || "",
            button_text: source?.button_text || "Learn More",
            price_numeric: Number(source?.price_numeric) || 0,
            thumbnail_url: source?.thumbnail_url || null,
            checkout_json: {
              ...((source?.checkout_json || {}) as Record<string, unknown>),
              location: "landing",
              data: { source_product_id: id },
            },
            options_json: {
              ...((source?.options_json || {}) as Record<string, unknown>),
              location: "landing",
              data: { source_product_id: id },
            },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { message?: string }).message || "Could not create landing page.");
      };
      try {
        await createViaLandingApi();
      } catch {
        await createViaProductsDraftFallback();
      }
      setActionMsg("Landing page created.");
      window.setTimeout(() => {
        window.location.href = "/dashboard?tab=landing";
      }, 300);
    } catch (e) {
      setListError(networkErrorMessage(e));
    }
  }, [products]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void loadProducts();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadProducts]);

  return (
    <DashboardShell
      displayName={displayName}
      handle={handle}
      showName={showName}
      onSignOut={onSignOut}
      navContext="store-home"
      topLeft={
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
          My Store
        </h1>
      }
      preview={<PhonePreview name={displayName} products={visibleProducts} />}
    >
      <div className="mx-auto max-w-[640px]">
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm font-medium text-amber-900">
          Heads up, customers can&apos;t purchase from you yet! Please set up your Direct Deposit to start selling
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-1 border-b border-[#e7dcc9] pb-0 sm:gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-t-xl border border-b-0 px-3 py-2.5 text-sm font-semibold sm:px-4"
            style={{
              borderColor: activeTab === "store" ? PURPLE : "#e7dcc9",
              backgroundColor: activeTab === "store" ? "rgba(176, 141, 87, 0.12)" : "#fff",
              color: activeTab === "store" ? PURPLE : "#64748b",
            }}
          >
            <IconStoreTab className={activeTab === "store" ? "text-[#6b46ff]" : "text-slate-400"} />
            Store
          </Link>
          <Link
            href="/dashboard?tab=landing"
            className="flex items-center gap-2 rounded-t-xl border border-b-0 px-3 py-2.5 text-sm font-semibold sm:px-4"
            style={{
              borderColor: activeTab === "landing" ? PURPLE : "#e7dcc9",
              backgroundColor: activeTab === "landing" ? "rgba(176, 141, 87, 0.12)" : "#fff",
              color: activeTab === "landing" ? PURPLE : "#64748b",
            }}
          >
            Landing Pages
            <IconArrowUpRight />
          </Link>
          <button
            type="button"
            className="flex items-center gap-2 px-2 py-2.5 text-sm font-medium text-slate-500 hover:text-[#1f2a44] sm:px-3"
          >
            Edit Design
            <IconSparkle />
          </button>
          <Link
            href="/dashboard/store/product/new?kind=affiliate"
            className="ml-auto mb-2 inline-flex items-center rounded-full border border-[#6b46ff]/30 bg-[#6b46ff]/10 px-3.5 py-1.5 text-xs font-semibold text-[#6b46ff] transition-all duration-200 hover:border-[#6b46ff] hover:bg-[#6b46ff] hover:text-white hover:shadow-[0_6px_16px_rgba(107,70,255,0.3)] sm:text-sm"
          >
            Refer and Earn
          </Link>
        </div>

        {activeTab === "store" ? (
          <div className="mt-8 rounded-2xl border border-[#e7dcc9] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <AvatarLarge label={displayName} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-semibold text-slate-900">{displayName}</span>
                  <button
                    type="button"
                    className="rounded-md p-1 text-[#b08d57] hover:bg-[#f7f1e6] hover:text-[#1f2a44]"
                    aria-label="Edit name"
                  >
                    <IconPencil />
                  </button>
                </div>
                <p className="mt-1 text-[15px] text-slate-500">@{handle}</p>
              </div>
            </div>
          </div>
        ) : null}

        {listError ? (
          <p className="mt-4 text-sm text-rose-600" role="alert">
            {listError}
            <button
              type="button"
              className="ml-2 font-semibold underline"
              onClick={() => void loadProducts()}
            >
              Retry
            </button>
          </p>
        ) : null}
        {actionMsg ? (
          <p className="mt-3 text-sm font-medium text-emerald-600" role="status">
            {actionMsg}
          </p>
        ) : null}

        <div className="mt-6">
          {activeTab === "store" ? (
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#b08d57]">Products</h2>
          ) : null}
          {activeTab === "store" ? (
            <CategoryFilterChips
              categories={categoryTabs}
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
          ) : null}
          {visibleProducts === null ? (
            <ul className="flex flex-col gap-3">
              <ProductListRowSkeleton />
            </ul>
          ) : filteredProducts.length === 0 ? (
            <p className="flex min-h-[80px] items-center justify-center rounded-2xl border border-dashed border-[#d8c7ab] bg-[#fbf7f0] px-4 text-center text-sm text-slate-500">
              {activeTab === "landing"
                ? "No landing pages yet. Add one below."
                : activeCategory === "all"
                  ? "No products yet. Add one below."
                  : "No products found in this category."}
            </p>
          ) : (
            <ul
              className={`flex flex-col gap-3 transition-all duration-200 ${
                isFiltering ? "scale-[0.995] opacity-70" : "scale-100 opacity-100"
              }`}
            >
              {filteredProducts.map((p) => (
                <ProductListRow
                  key={p.id}
                  p={p}
                  handle={handle}
                  onUnpublish={unpublishProduct}
                  onDuplicate={duplicateProduct}
                  onDelete={deleteProduct}
                  onMakeLanding={makeLandingPage}
                  onNotify={(msg) => {
                    setActionMsg(msg);
                    setListError("");
                  }}
                  onError={(msg) => {
                    setListError(msg);
                  }}
                />
              ))}
            </ul>
          )}
        </div>

        <Link
          href={activeTab === "landing" ? "/dashboard/store/landing/add" : "/dashboard/store/product/add"}
          className="mt-8 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#1f2a44] to-[#2d3b61] py-3.5 text-[16px] font-bold text-white shadow-md transition hover:opacity-95 active:opacity-90"
          style={{ backgroundColor: PURPLE }}
        >
          {activeTab === "landing" ? "+ Add Landing Page" : "+ Add Product"}
        </Link>

        <Link
          href={publicStoreUrl(handle)}
          className="mt-4 block text-center text-[15px] font-semibold text-[#1f2a44] underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          View public store
        </Link>

        <p className="mt-5 text-center">
          <button
            type="button"
            className="text-[15px] font-semibold text-slate-600 underline decoration-[#d8c7ab] underline-offset-4 hover:text-[#1f2a44]"
          >
            Add Section
          </button>
        </p>
      </div>
    </DashboardShell>
  );
}
