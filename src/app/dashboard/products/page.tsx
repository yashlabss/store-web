"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { API_DIGITAL_PRODUCTS_BASE, authFetch } from "../../../lib/api";
import { networkErrorMessage } from "../../../lib/networkError";

// ─── Types ───────────────────────────────────────────────────────────────────

type DigitalProduct = {
  id: string;
  product_type: string;
  title: string;
  subtitle?: string;
  price_numeric: number;
  currency: string;
  status: string;
  thumbnail_url: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
  revenue?: number;
  order_count?: number;
};

// ─── Product type metadata ────────────────────────────────────────────────────

const PRODUCT_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  digital_download: { label: "Digital Download", color: "#2563eb", bg: "#dbeafe" },
  digital:          { label: "Digital Download", color: "#2563eb", bg: "#dbeafe" },
  course:           { label: "Online Course",    color: "#7c3aed", bg: "#ede9fe" },
  membership:       { label: "Membership",       color: "#059669", bg: "#d1fae5" },
  booking:          { label: "Booking / Call",   color: "#d97706", bg: "#fef3c7" },
  webinar:          { label: "Webinar",          color: "#db2777", bg: "#fce7f3" },
  community:        { label: "Community",        color: "#0891b2", bg: "#cffafe" },
  lead_magnet:      { label: "Lead Magnet",      color: "#ca8a04", bg: "#fef9c3" },
  custom:           { label: "Custom Product",   color: "#64748b", bg: "#f1f5f9" },
  link:             { label: "Link / URL",       color: "#dc2626", bg: "#fee2e2" },
};

function getTypeMeta(type: string) {
  return (
    PRODUCT_TYPE_META[type] ?? {
      label: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      color: "#64748b",
      bg: "#f1f5f9",
    }
  );
}

function getTypeBg(type: string) {
  return getTypeMeta(type).bg;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.8 2.8 0 0 1 4 4L7 21l-4 1 1-4L17 3z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="h-32 w-full rounded-xl bg-slate-100" />
      <div className="mt-3 h-4 w-20 rounded bg-slate-100" />
      <div className="mt-2 h-5 w-full rounded bg-slate-100" />
      <div className="mt-1 h-4 w-3/4 rounded bg-slate-100" />
      <div className="mt-3 flex gap-2">
        <div className="h-8 flex-1 rounded-lg bg-slate-100" />
        <div className="h-8 w-8 rounded-lg bg-slate-100" />
        <div className="h-8 w-8 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onDelete,
  onTogglePublish,
  toggling,
}: {
  product: DigitalProduct;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: string) => void;
  toggling: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const meta = getTypeMeta(product.product_type);
  const isPublished = product.status === "published";

  const formatPrice = (n: number) =>
    n === 0 ? "Free" : `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-slate-200 hover:shadow-md">
      {/* Thumbnail */}
      <div
        className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-t-2xl"
        style={{ backgroundColor: getTypeBg(product.product_type) }}
      >
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.thumbnail_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="1.25" aria-hidden style={{ opacity: 0.35 }}>
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        )}
        {/* Status badge */}
        <span
          className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {isPublished ? "Live" : "Draft"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* Type badge */}
        <span
          className="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>

        {/* Title */}
        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-slate-900">
          {product.title || "Untitled"}
        </h3>

        {/* Price */}
        <p className="mt-1 text-base font-bold" style={{ color: "#6b46ff" }}>
          {formatPrice(product.price_numeric)}
        </p>

        {/* Stats */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
          <span>
            <span className="font-semibold text-slate-600">
              ₹{(product.revenue ?? 0).toLocaleString("en-IN")}
            </span>{" "}
            revenue
          </span>
          <span className="h-3 w-px bg-slate-200" aria-hidden />
          <span>
            <span className="font-semibold text-slate-600">{product.order_count ?? 0}</span> orders
          </span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <Link
            href={`/dashboard/products/${product.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <IconEdit />
            Edit
          </Link>

          {/* Publish toggle */}
          <button
            type="button"
            disabled={toggling}
            onClick={() => onTogglePublish(product.id, product.status)}
            title={isPublished ? "Unpublish" : "Publish"}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
              isPublished
                ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {isPublished ? (
                <>
                  <path d="M17.5 17.5 6 6" />
                  <path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 6.36-2.64M21 12A9 9 0 0 0 12 3a9 9 0 0 0-6.36 2.64" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v8M8 12h8" />
                </>
              )}
            </svg>
          </button>

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onDelete(product.id)}
                className="rounded-lg bg-rose-600 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Delete product"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
            >
              <IconTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b46ff" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M12 22V12M3.27 6.96 12 12.01l8.73-5.05" />
        </svg>
      </div>
      {hasFilters ? (
        <>
          <p className="mt-5 text-lg font-bold text-slate-900">No products match your filters</p>
          <p className="mt-2 text-sm text-slate-500">Try changing the filter or search query.</p>
        </>
      ) : (
        <>
          <p className="mt-5 text-lg font-bold text-slate-900">No products yet</p>
          <p className="mt-2 text-sm text-slate-500">Add your first product and start selling.</p>
          <Link
            href="/dashboard/products/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: "#6b46ff" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add your first product
          </Link>
        </>
      )}
    </div>
  );
}

// ─── Filter constants ─────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "digital_download", label: "Digital Download" },
  { value: "course", label: "Online Course" },
  { value: "membership", label: "Membership" },
  { value: "booking", label: "Booking / Call" },
  { value: "webinar", label: "Webinar" },
  { value: "community", label: "Community" },
  { value: "lead_magnet", label: "Lead Magnet" },
  { value: "custom", label: "Custom Product" },
  { value: "link", label: "Link / URL" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusTab, setStatusTab] = useState<"" | "published" | "draft">("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(
    async (opts: { status?: string; type?: string; search?: string }) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (opts.status) params.set("status", opts.status);
        if (opts.type) params.set("type", opts.type);
        if (opts.search) params.set("search", opts.search);
        const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}?${params.toString()}`);
        const data = (await res.json().catch(() => ({}))) as {
          products?: DigitalProduct[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message || "Failed to load products.");
        setProducts(data.products ?? []);
      } catch (e) {
        setError(networkErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchProducts({ status: statusTab, type: typeFilter, search });
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [statusTab, typeFilter, search, fetchProducts]);

  const handleDelete = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(d.message || "Delete failed.");
      }
    } catch (e) {
      alert(networkErrorMessage(e));
      void fetchProducts({ status: statusTab, type: typeFilter, search });
    }
  }, [fetchProducts, statusTab, typeFilter, search]);

  const handleTogglePublish = useCallback(async (id: string, currentStatus: string) => {
    setTogglingId(id);
    try {
      const action = currentStatus === "published" ? "unpublish" : "publish";
      const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/${id}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error("Toggle failed.");
      const d = (await res.json().catch(() => ({}))) as { product?: { status: string } };
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: d.product?.status ?? (action === "publish" ? "published" : "draft") }
            : p
        )
      );
    } catch (e) {
      alert(networkErrorMessage(e));
    } finally {
      setTogglingId(null);
    }
  }, []);

  const hasFilters = Boolean(statusTab || typeFilter || search.trim());

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">My Products</h1>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          style={{ backgroundColor: "#6b46ff" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Status tabs */}
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(
            [
              { value: "" as const,          label: "All" },
              { value: "published" as const, label: "Published" },
              { value: "draft" as const,     label: "Drafts" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusTab(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusTab === tab.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Count */}
        {!loading && (
          <span className="text-sm text-slate-400">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Error */}
      {error ? (
        <p className="mt-4 text-sm font-medium text-rose-600" role="alert">{error}</p>
      ) : null}

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
                toggling={togglingId === p.id}
              />
            ))}
      </div>

      {!loading && products.length === 0 ? <EmptyState hasFilters={hasFilters} /> : null}
    </div>
  );
}
