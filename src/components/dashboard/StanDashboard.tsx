"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
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

type Props = {
  displayName: string;
  handle: string;
  showName: string;
  onSignOut: () => void;
};

type ProductRow = {
  id: string;
  status: string;
  title: string;
  subtitle: string;
  button_text: string;
  price_numeric: number;
  thumbnail_url: string | null;
  checkout_json: Record<string, unknown> | null;
  updated_at: string;
};

type DesignStyleId = "consult" | "starter" | "kels" | "work" | "dark";

type DesignStyle = {
  id: DesignStyleId;
  name: string;
  bgClass: string;
  accentClass: string;
  previewTitleClass: string;
  heroLabel: string;
  cardTitle: string;
  imageUrl: string;
};

const DESIGN_STYLES: DesignStyle[] = [
  {
    id: "consult",
    name: "The Consultant",
    bgClass: "bg-gradient-to-br from-emerald-100 via-white to-emerald-200",
    accentClass: "bg-[#1f8a70] text-white",
    previewTitleClass: "text-[#1f8a70]",
    heroLabel: "Consult Pro",
    cardTitle: "Book a call",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "starter",
    name: "Starter Kit",
    bgClass: "bg-gradient-to-br from-blue-100 via-violet-100 to-orange-100",
    accentClass: "bg-[#374151] text-white",
    previewTitleClass: "text-[#1f2937]",
    heroLabel: "Starter Pack",
    cardTitle: "Starter course",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "kels",
    name: "The Kels",
    bgClass: "bg-gradient-to-br from-rose-100 via-violet-100 to-fuchsia-100",
    accentClass: "bg-[#7c3aed] text-white",
    previewTitleClass: "text-[#7c3aed]",
    heroLabel: "The Kels",
    cardTitle: "Custom skincare",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "work",
    name: "Work Mode",
    bgClass: "bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100",
    accentClass: "bg-[#111827] text-white",
    previewTitleClass: "text-[#374151]",
    heroLabel: "Work Mode",
    cardTitle: "Brand blueprint",
    imageUrl:
      "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "dark",
    name: "Dark Pro",
    bgClass: "bg-gradient-to-br from-slate-800 via-zinc-800 to-black",
    accentClass: "bg-white text-slate-900",
    previewTitleClass: "text-slate-900",
    heroLabel: "Dark Pro",
    cardTitle: "Premium vault",
    imageUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=600&q=80",
  },
];

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

function AvatarLarge({ label }: { label: string }) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full text-2xl font-semibold text-[#5b8ac4] ring-1 ring-slate-100"
      style={{ backgroundColor: "#dbeafe" }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

function PhonePreview({
  name,
  styleId = "kels",
  product,
}: {
  name: string;
  styleId?: DesignStyleId;
  product?: ProductRow | null;
}) {
  const activeStyle = DESIGN_STYLES.find((s) => s.id === styleId) || DESIGN_STYLES[0];
  const title = product?.title?.trim() || "product";
  const subtitle = product?.subtitle?.trim() || "my product";
  const price = listDisplayPrice(product || ({} as ProductRow)).toFixed(2);
  const buttonText = product?.button_text?.trim() || "buy my product";

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div
        className="relative w-full max-w-[280px] rounded-[2rem] border-[4px] border-slate-900 bg-white p-4 pt-5 shadow-xl"
        style={{ minHeight: "min(480px, 58vh)", maxHeight: "min(520px, 70vh)" }}
      >
        <div className="mx-auto mb-3 flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-[#5b8ac4] ring-1 ring-slate-100"
            style={{ backgroundColor: "#dbeafe" }}
          >
            {name.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-[#0f8b82]/30 bg-white p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeStyle.imageUrl} alt={activeStyle.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-[22px] font-semibold leading-tight ${activeStyle.previewTitleClass}`}>{title}</p>
                <p className="truncate text-xs text-slate-400">{subtitle || "you can able to download"}</p>
                <p className="text-[28px] font-semibold leading-none text-[#0f8b82]">${price === "0.00" ? "9.99" : price}</p>
              </div>
            </div>
            <button type="button" className={`mt-2.5 w-full rounded-full py-2 text-sm font-semibold ${activeStyle.accentClass}`}>
              {buttonText}
            </button>
          </div>

          <div className="rounded-2xl border border-[#0f8b82]/30 bg-white p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-2xl">📁</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[22px] font-semibold leading-tight text-slate-900">product</p>
                <p className="text-xs text-slate-400">my product</p>
                <p className="text-[28px] font-semibold leading-none text-[#0f8b82]">$9.99</p>
              </div>
            </div>
            <p className="mt-2.5 text-[11px] text-slate-600">PDF Document</p>
            <button type="button" className={`mt-2.5 w-full rounded-full py-2 text-sm font-semibold ${activeStyle.accentClass}`}>
              buy my product
            </button>
            <p className="mt-2 text-center text-xs font-medium text-[#0f8b82]">Learn More</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Matches ProductListRow outer layout so loading → loaded doesn’t shift layout. */
function ProductListRowSkeleton() {
  return (
    <li className="pointer-events-none" aria-hidden>
      <div className="flex min-h-[80px] items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm sm:gap-4 sm:px-4">
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

function ProductListRow({ p }: { p: ProductRow }) {
  const price = listDisplayPrice(p);
  const title = p.title?.trim() || "Untitled product";
  const editHref = `/dashboard/store/product/new?id=${encodeURIComponent(p.id)}`;

  return (
    <li>
      <Link
        href={editHref}
        className="flex min-h-[80px] items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition-[border-color,box-shadow] hover:border-slate-200 hover:shadow-md sm:gap-4 sm:px-4"
      >
        <span className="flex shrink-0 cursor-grab text-slate-300" aria-hidden title="Reorder (coming soon)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="9" cy="7" r="1.5" />
            <circle cx="15" cy="7" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="17" r="1.5" />
            <circle cx="15" cy="17" r="1.5" />
          </svg>
        </span>
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {p.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.thumbnail_url}
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
          <p className="truncate font-semibold text-slate-900">{title}</p>
          <p className="mt-0.5 text-sm font-medium" style={{ color: PURPLE }}>
            ${price.toFixed(2)}
          </p>
        </div>
        <span className="flex shrink-0 text-slate-400" aria-hidden title="Digital product">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
        </span>
        {p.status === "draft" ? (
          <span className="inline-flex min-w-[3.25rem] shrink-0 justify-center rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-800">
            Draft
          </span>
        ) : (
          <span className="inline-flex min-w-[3.25rem] shrink-0 justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
            Live
          </span>
        )}
        <span className="shrink-0 text-slate-300" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </span>
      </Link>
    </li>
  );
}

type DashboardTab = "store" | "landing" | "design";

function TopTabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition",
        active
          ? "border-[#8f7cff] bg-[#f6f3ff] text-[#5844d7]"
          : "border-transparent bg-transparent text-slate-700 hover:text-slate-900",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}

function LandingPageRow({ p }: { p: ProductRow }) {
  const title = p.title?.trim() || "Untitled landing page";
  const price = listDisplayPrice(p).toFixed(2);
  const editHref = `/dashboard/store/product/new?id=${encodeURIComponent(p.id)}`;

  return (
    <li>
      <Link
        href={editHref}
        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm transition hover:border-slate-200 hover:shadow"
      >
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100">
          {p.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.thumbnail_url}
              alt=""
              width={40}
              height={40}
              decoding="async"
              className="block h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-400">No img</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-slate-900">{title}</p>
          <p className="text-2xl font-medium leading-tight text-slate-500">${price}</p>
        </div>
        <span className="shrink-0 text-slate-300" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="6" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="12" cy="18" r="1.75" />
          </svg>
        </span>
      </Link>
    </li>
  );
}

export default function StanDashboard({ displayName, handle, showName, onSignOut }: Props) {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [listError, setListError] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("store");
  const [selectedStyleId, setSelectedStyleId] = useState<DesignStyleId>("kels");
  const [carouselCenterIndex, setCarouselCenterIndex] = useState<number>(
    Math.max(
      0,
      DESIGN_STYLES.findIndex((style) => style.id === "kels"),
    ),
  );

  const moveCarousel = useCallback((step: -1 | 1) => {
    const total = DESIGN_STYLES.length;
    const nextIndex = (carouselCenterIndex + step + total) % total;
    setCarouselCenterIndex(nextIndex);
    setSelectedStyleId(DESIGN_STYLES[nextIndex].id);
  }, [carouselCenterIndex]);

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
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (e) {
      setListError(networkErrorMessage(e));
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

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
        <h1 className="text-sm font-semibold text-slate-900">
          My Store
        </h1>
      }
      preview={
        <div className="lg:mt-[72px]">
          <PhonePreview name={displayName} styleId={selectedStyleId} product={products?.[0] || null} />
        </div>
      }
    >
      <div className="mx-auto max-w-[760px]">
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm font-medium text-amber-900">
          Heads up, customers can&apos;t purchase from you yet! Please set up your Direct Deposit to start selling
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <TopTabButton
            active={activeTab === "store"}
            onClick={() => setActiveTab("store")}
            icon={<IconStoreTab className={activeTab === "store" ? "text-[#5844d7]" : "text-slate-500"} />}
          >
            Store
          </TopTabButton>
          <TopTabButton active={activeTab === "landing"} onClick={() => setActiveTab("landing")}>
            Landing Pages
            <IconArrowUpRight />
          </TopTabButton>
          <button
            type="button"
            onClick={() => setActiveTab("design")}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              activeTab === "design"
                ? "border-[#8f7cff] bg-[#f6f3ff] text-[#5844d7]"
                : "border-transparent text-slate-700 hover:text-slate-900"
            }`}
          >
            Edit Design
            <IconSparkle />
          </button>
        </div>

        {activeTab === "design" ? (
          <div className="mt-8">
            <div className="mx-auto max-w-[640px] px-2">
              <div className="flex items-end justify-center gap-3">
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const total = DESIGN_STYLES.length;
                  const idx = (carouselCenterIndex + offset + total) % total;
                  const style = DESIGN_STYLES[idx];
                  const isCenter = offset === 0;
                  const isNear = Math.abs(offset) === 1;
                  return (
                    <button
                      key={`${style.id}-${offset}`}
                      type="button"
                      onClick={() => {
                        setCarouselCenterIndex(idx);
                        setSelectedStyleId(style.id);
                      }}
                      className={[
                        "relative overflow-hidden rounded-2xl border transition-all duration-200",
                        isCenter
                          ? "h-[320px] w-[178px] border-[#6b46ff] shadow-xl ring-2 ring-[#6b46ff]/25"
                          : isNear
                            ? "h-[290px] w-[156px] border-slate-200 shadow-lg"
                            : "h-[264px] w-[140px] border-slate-200 shadow-md",
                      ].join(" ")}
                      aria-label={`Select ${style.name}`}
                    >
                      <div className={`h-full w-full ${style.bgClass} p-2`}>
                        <div className="h-full rounded-xl bg-white/95 p-2">
                          <div className="mb-2 flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-full bg-slate-300" />
                            <p className="truncate text-[11px] font-semibold text-slate-800">
                              {style.heroLabel}
                            </p>
                          </div>
                          <div className="h-[52%] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={style.imageUrl}
                              alt={style.name}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="mt-2 rounded-md bg-gradient-to-r from-slate-100 to-white p-1.5">
                            <p className="truncate text-[10px] font-semibold text-slate-800">{style.cardTitle}</p>
                            <p className="mt-0.5 text-[10px] font-medium text-slate-600">$29.00</p>
                          </div>
                          <div
                            className={`mt-2 w-full rounded-full py-1.5 text-center text-[10px] font-semibold ${style.accentClass}`}
                            aria-hidden
                          >
                            Get it now
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative mx-auto mt-6 h-8 w-[260px] text-sm text-slate-700">
              <button
                type="button"
                className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl text-slate-500 transition hover:text-slate-800"
                aria-label="Previous style"
                onClick={() => moveCarousel(-1)}
              >
                ‹
              </button>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium">
                {DESIGN_STYLES[carouselCenterIndex]?.name || "The Kels"}
              </span>
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl text-slate-500 transition hover:text-slate-800"
                aria-label="Next style"
                onClick={() => moveCarousel(1)}
              >
                ›
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">Colors</p>
                  <div className="flex items-center gap-2">
                    <button type="button" className="h-8 w-8 rounded-md border border-[#0f8b82] bg-[#0f8b82]" aria-label="Select primary color" />
                    <button type="button" className="h-8 w-8 rounded-md border border-slate-200 bg-white" aria-label="Select secondary color" />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">Font</p>
                  <select
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6b46ff]"
                    defaultValue="plus-jakarta"
                  >
                    <option value="plus-jakarta">Plus Jakarta Sans</option>
                    <option value="inter">Inter</option>
                    <option value="manrope">Manrope</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab("store")}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("store")}
                className="rounded-lg bg-[#6b46ff] px-6 py-2 text-sm font-semibold text-white hover:opacity-95"
              >
                Save
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "store" ? (
          <div className="mt-4 rounded-md border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <AvatarLarge label={displayName} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[1.9rem] font-semibold leading-tight text-[#1f2457]">{displayName}</span>
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Edit name"
                  >
                    <IconPencil />
                  </button>
                </div>
                <p className="mt-1 text-[1.75rem] leading-tight text-slate-500">@{handle}</p>
              </div>
            </div>
          </div>
        ) : activeTab === "landing" ? (
          <div className="mt-6">
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

            {products === null ? (
              <ul className="flex flex-col gap-3">
                <ProductListRowSkeleton />
              </ul>
            ) : products.length === 0 ? (
              <p className="flex min-h-[80px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
                No landing pages yet. Add one below.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {products.map((p) => (
                  <LandingPageRow key={p.id} p={p} />
                ))}
              </ul>
            )}

            <Link
              href="/dashboard/store/product/add"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#6b46ff] to-[#7b5cff] py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-95 active:opacity-90"
            >
              + Add Landing Page
            </Link>
          </div>
        ) : null}

        {activeTab === "store" ? (
          <>
            <div className="mt-6">
              {products === null ? (
                <ul className="flex flex-col gap-3">
                  <ProductListRowSkeleton />
                </ul>
              ) : products.length === 0 ? (
                <p className="flex min-h-[80px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 text-center text-sm text-slate-500">
                  No products yet. Add one below.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {products.map((p) => (
                    <ProductListRow key={p.id} p={p} />
                  ))}
                </ul>
              )}
            </div>

            <Link
              href="/dashboard/store/product/add"
              className="mt-6 flex w-full items-center justify-center rounded-lg py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-95 active:opacity-90"
              style={{ backgroundColor: PURPLE }}
            >
              + Add Product
            </Link>

            <Link
              href={publicStoreUrl(handle)}
              className="mt-4 block text-center text-[15px] font-semibold text-[#6b46ff] underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View public store
            </Link>

            <p className="mt-5 text-center">
              <button
                type="button"
                className="text-[15px] font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-[#6b46ff]"
              >
                Add Section
              </button>
            </p>
          </>
        ) : null}
      </div>
    </DashboardShell>
  );
}
