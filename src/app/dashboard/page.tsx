"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  API_ANALYTICS_BASE,
  API_DIGITAL_PRODUCTS_BASE,
  API_PRODUCTS_BASE,
  authFetch,
} from "../../lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DashboardStats = {
  total_revenue: number;
  total_orders: number;
  unique_customers: number;
  published_products: number;
};

type ProductRow = {
  id: string;
  title: string;
  status: string;
  price_numeric: number;
  thumbnail_url: string | null;
  updated_at: string;
};

type OrderRow = {
  id: string;
  created_at: string;
  amount: number;
  currency: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  product_title: string | null;
};

// ---------------------------------------------------------------------------
// Skeleton helpers
// ---------------------------------------------------------------------------
function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={["animate-pulse rounded-lg bg-slate-100", className ?? ""].join(" ")}
      aria-hidden
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <SkeletonBox className="mb-3 h-3 w-24" />
      <SkeletonBox className="h-7 w-32" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: accent ?? "#6b46ff" }}
        >
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  const isLive = status === "published" || status === "live" || status === "active";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        isLive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-sky-50 text-sky-700",
      ].join(" ")}
    >
      {isLive ? "Live" : "Draft"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------
function IcoRevenue() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 4h12M6 9h12M12 9l-4 11M6 4a5 5 0 0 1 5 5H6" />
    </svg>
  );
}
function IcoOrders() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IcoCustomers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.85" />
    </svg>
  );
}
function IcoProducts() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
function IcoTrendUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
function IcoPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IcoExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function DashboardHomePage() {
  const [stats,    setStats]    = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [orders,   setOrders]   = useState<OrderRow[] | null>(null);
  const [statsErr,    setStatsErr]    = useState("");
  const [productsErr, setProductsErr] = useState("");
  const [ordersErr,   setOrdersErr]   = useState("");

  // Derive user name from localStorage (set by layout during auth)
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // ---------- Fetch dashboard stats ----------
  useEffect(() => {
    void (async () => {
      try {
        const res = await authFetch(`${API_ANALYTICS_BASE}/dashboard`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((json as { message?: string }).message || "Failed to load stats");
        setStats(json as DashboardStats);
      } catch (e) {
        setStatsErr(e instanceof Error ? e.message : "Failed to load stats");
        // Provide zeroed fallback so layout doesn't break
        setStats({ total_revenue: 0, total_orders: 0, unique_customers: 0, published_products: 0 });
      }
    })();
  }, []);

  // ---------- Fetch recent products ----------
  useEffect(() => {
    void (async () => {
      try {
        const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}?limit=4`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((json as { message?: string }).message || "Failed to load products");
        const rows = Array.isArray(json.products) ? json.products : Array.isArray(json) ? json : [];
        setProducts(rows as ProductRow[]);
      } catch (e) {
        setProductsErr(e instanceof Error ? e.message : "Failed to load products");
        setProducts([]);
      }
    })();
  }, []);

  // ---------- Fetch recent orders ----------
  useEffect(() => {
    void (async () => {
      try {
        const res = await authFetch(`${API_PRODUCTS_BASE}/orders?limit=5`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((json as { message?: string }).message || "Failed to load orders");
        const rows = Array.isArray(json.orders) ? json.orders : [];
        setOrders(rows as OrderRow[]);
      } catch (e) {
        setOrdersErr(e instanceof Error ? e.message : "Failed to load orders");
        setOrders([]);
      }
    })();
  }, []);

  const fmtMoney = (n: number) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate  = (s: string) =>
    new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="mx-auto max-w-5xl space-y-8">

      {/* ---------------------------------------------------------------- */}
      {/* Welcome header + quick actions                                    */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
            {greeting} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/dashboard/store/product/add"
            className="flex items-center gap-2 rounded-xl bg-[#6b46ff] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90 active:opacity-80"
          >
            <IcoPlus />
            Add Product
          </Link>
          <Link
            href="/dashboard/store"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <IcoExternalLink />
            View Store
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Stats row                                                         */}
      {/* ---------------------------------------------------------------- */}
      {statsErr && (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600" role="alert">
          {statsErr}
        </p>
      )}

      {stats === null ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={fmtMoney(stats.total_revenue)}
            icon={<IcoRevenue />}
            accent="#6b46ff"
          />
          <StatCard
            label="Total Orders"
            value={stats.total_orders}
            icon={<IcoOrders />}
            accent="#0ea5e9"
          />
          <StatCard
            label="Unique Customers"
            value={stats.unique_customers}
            icon={<IcoCustomers />}
            accent="#10b981"
          />
          <StatCard
            label="Published Products"
            value={stats.published_products}
            icon={<IcoProducts />}
            accent="#f59e0b"
          />
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Two-column section: Recent Orders + Products                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Recent orders (wider) */}
        <section className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-[14px] font-semibold text-slate-900">Recent Orders</h2>
              <Link
                href="/dashboard/income"
                className="text-[12px] font-semibold text-[#6b46ff] hover:underline"
              >
                View all
              </Link>
            </div>

            {ordersErr && (
              <p className="px-5 py-4 text-sm text-rose-600">{ordersErr}</p>
            )}

            {orders === null ? (
              <div className="divide-y divide-slate-50">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <SkeletonBox className="h-4 flex-1" />
                    <SkeletonBox className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <IcoOrders />
                </div>
                <p className="text-sm font-medium text-slate-600">No orders yet</p>
                <p className="mt-1 text-xs text-slate-400">Share your store link to get your first sale</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-[12.5px]">
                  <thead>
                    <tr className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Buyer</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map((o) => (
                      <tr key={o.id} className="transition hover:bg-slate-50">
                        <td className="max-w-[140px] truncate px-5 py-3 font-medium text-slate-900">
                          {o.product_title || "—"}
                        </td>
                        <td className="max-w-[120px] truncate px-5 py-3 text-slate-600">
                          {o.buyer_name || o.buyer_email || "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-900">
                          {fmtMoney(o.amount)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-slate-400">
                          {fmtDate(o.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Products (narrower) */}
        <section className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-[14px] font-semibold text-slate-900">Products</h2>
              <Link
                href="/dashboard/store"
                className="text-[12px] font-semibold text-[#6b46ff] hover:underline"
              >
                Manage
              </Link>
            </div>

            {productsErr && (
              <p className="px-5 py-4 text-sm text-rose-600">{productsErr}</p>
            )}

            {products === null ? (
              <ul className="divide-y divide-slate-50">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <SkeletonBox className="h-10 w-10 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonBox className="h-3.5 w-3/4" />
                      <SkeletonBox className="h-3 w-1/3" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <IcoProducts />
                </div>
                <p className="text-sm font-medium text-slate-600">No products yet</p>
                <Link
                  href="/dashboard/store/product/add"
                  className="mt-3 rounded-lg bg-[#6b46ff] px-3 py-1.5 text-[12px] font-semibold text-white"
                >
                  Add your first product
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {products.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/store/product/new?id=${encodeURIComponent(p.id)}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {p.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.thumbnail_url}
                            alt=""
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-400">
                            IMG
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-semibold text-slate-900">
                          {p.title?.trim() || "Untitled"}
                        </p>
                        <p className="mt-0.5 text-[11.5px] font-medium" style={{ color: "#6b46ff" }}>
                          ₹{Number(p.price_numeric).toFixed(2)}
                        </p>
                      </div>
                      <StatusBadge status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Revenue chart placeholder                                         */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-[14px] font-semibold text-slate-900">Revenue Analytics</h2>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #6b46ff 0%, #9333ea 100%)" }}
            >
              <IcoTrendUp />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-slate-700">Revenue analytics coming soon</p>
              <p className="mt-1 text-[12.5px] text-slate-400">
                Charts and trend data will appear here once you have sales.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
