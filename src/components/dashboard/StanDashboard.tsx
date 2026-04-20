"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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

function PhonePreview({ name }: { name: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div
        className="relative w-full max-w-[280px] rounded-[2rem] border-[10px] border-slate-900 bg-white p-6 pt-10 shadow-xl"
        style={{ minHeight: "min(480px, 58vh)", maxHeight: "min(520px, 70vh)" }}
      >
        <div className="mx-auto flex flex-col items-center">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl font-semibold text-[#5b8ac4] ring-1 ring-slate-100"
            style={{ backgroundColor: "#dbeafe" }}
          >
            {name.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <p className="mt-6 text-center text-xl font-bold tracking-tight text-slate-900">
            {name}
          </p>
        </div>
        <button
          type="button"
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#3b82f6] text-white shadow-md"
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

export default function StanDashboard({ displayName, handle, showName, onSignOut }: Props) {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [listError, setListError] = useState("");

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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
          My Store
        </h1>
      }
      preview={<PhonePreview name={displayName} />}
    >
      <div className="mx-auto max-w-[640px]">
        <div className="mt-6 flex flex-wrap items-end gap-1 border-b border-slate-200 pb-0 sm:gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-t-xl border border-b-0 px-3 py-2.5 text-sm font-semibold sm:px-4"
            style={{
              borderColor: PURPLE,
              backgroundColor: "rgba(107, 70, 255, 0.08)",
              color: PURPLE,
            }}
          >
            <IconStoreTab className="text-[#6b46ff]" />
            Store
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-2 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 sm:px-3"
          >
            Landing Pages
            <IconArrowUpRight />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-2 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 sm:px-3"
          >
            Edit Design
            <IconSparkle />
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <AvatarLarge label={displayName} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-semibold text-slate-900">{displayName}</span>
                <button
                  type="button"
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Edit name"
                >
                  <IconPencil />
                </button>
              </div>
              <p className="mt-1 text-[15px] text-slate-500">@{handle}</p>
            </div>
          </div>
        </div>

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

        <div className="mt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Products</h2>
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
          className="mt-8 flex w-full items-center justify-center rounded-full py-3.5 text-[16px] font-bold text-white shadow-md transition hover:opacity-95 active:opacity-90"
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
      </div>
    </DashboardShell>
  );
}
