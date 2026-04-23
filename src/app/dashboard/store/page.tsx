"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  API_AUTH_BASE,
  API_LANDING_PAGES_BASE,
  API_PRODUCTS_BASE,
} from "../../../lib/api";
import { networkErrorMessage } from "../../../lib/networkError";

type UserRow = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
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
};

type LandingPageRow = {
  id: string;
  title: string;
  page_type: string;
  slug: string;
  status: "draft" | "published";
  location: "store" | "landing";
  hidden: boolean;
  order_index: number;
  updated_at: string;
};

type TabKey = "details" | "landing-pages-tab" | "design";

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

function AvatarCircle({ label, size }: { label: string; size: number }) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-[#5b8ac4] ring-1 ring-slate-100"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, Math.round(size * 0.28)),
        backgroundColor: "#dbeafe",
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export default function DashboardStoreIndex() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserRow | null>(null);
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [pages, setPages] = useState<LandingPageRow[] | null>(null);
  const [error, setError] = useState("");
  const activeTab = (searchParams.get("tab") || "details") as TabKey;
  const isDetails = activeTab === "details";
  const isLanding = activeTab === "landing-pages-tab";
  const isDesign = activeTab === "design";

  const loadAll = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace("/auth/login?redirectTo=/dashboard/store");
      return;
    }

    setError("");
    try {
      const [uRes, pRes, lRes] = await Promise.all([
        fetch(`${API_AUTH_BASE}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_PRODUCTS_BASE}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_LANDING_PAGES_BASE}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const uJson = (await uRes.json().catch(() => ({}))) as {
        user?: UserRow;
        message?: string;
      };
      const pJson = (await pRes.json().catch(() => ({}))) as {
        products?: ProductRow[];
        message?: string;
      };
      const lJson = (await lRes.json().catch(() => ({}))) as {
        pages?: LandingPageRow[];
        message?: string;
      };

      if (!uRes.ok) {
        if (uRes.status === 401) {
          localStorage.removeItem("auth_token");
          router.replace("/auth/login?redirectTo=/dashboard/store");
          return;
        }
        throw new Error(uJson.message || "Could not load profile.");
      }
      if (!pRes.ok) {
        throw new Error(pJson.message || "Could not load products.");
      }
      if (!lRes.ok) {
        throw new Error(lJson.message || "Could not load landing pages.");
      }

      setUser(uJson.user || null);
      if (typeof window !== "undefined" && uJson.user?.username) {
        localStorage.setItem("username_hint", uJson.user.username);
      }
      setProducts(Array.isArray(pJson.products) ? pJson.products : []);
      setPages(Array.isArray(lJson.pages) ? lJson.pages : []);
    } catch (e) {
      setError(networkErrorMessage(e));
      setProducts([]);
      setPages([]);
    }
  }, [router]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const displayName = useMemo(() => {
    const handle = (user?.username || "creator").trim() || "creator";
    return (
      user?.full_name?.trim() ||
      handle.charAt(0).toUpperCase() + handle.slice(1)
    );
  }, [user]);
  const handle = useMemo(
    () => (user?.username || "creator").trim() || "creator",
    [user]
  );

  const previewProducts = (products || []).slice(0, 2);
  const landingItems = (pages || []).filter((p) => p.location === "landing");
  const storeItems = (pages || []).filter((p) => p.location === "store");
  const visiblePages = isLanding ? landingItems : storeItems;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  async function patchPage(pageId: string, patch: Record<string, unknown>) {
    if (!token) return;
    await fetch(`${API_LANDING_PAGES_BASE}/${encodeURIComponent(pageId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });
    await loadAll();
  }

  function setTab(next: TabKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`/dashboard/store?${params.toString()}`);
  }

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="flex flex-wrap items-end gap-1 border-b border-slate-200 pb-0 sm:gap-2">
            <button
              type="button"
              onClick={() => setTab("details")}
              className="rounded-t-xl border border-b-0 px-3 py-2.5 text-sm font-semibold sm:px-4"
              style={{
                borderColor: isDetails ? "#6b46ff" : "#e2e8f0",
                backgroundColor: isDetails ? "rgba(107, 70, 255, 0.08)" : "white",
                color: isDetails ? "#6b46ff" : "#64748b",
              }}
            >
              Store
            </button>
            <button
              type="button"
              onClick={() => setTab("landing-pages-tab")}
              className="px-2 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 sm:px-3"
              style={{ color: isLanding ? "#6b46ff" : undefined }}
            >
              Landing Pages
            </button>
            <button
              type="button"
              onClick={() => setTab("design")}
              className="px-2 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 sm:px-3"
              style={{ color: isDesign ? "#6b46ff" : undefined }}
            >
              Edit Design
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-4">
              <AvatarCircle label={displayName} size={72} />
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-slate-900">
                  {displayName}
                </p>
                <p className="mt-1 text-[15px] text-slate-500">@{handle}</p>
              </div>
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-rose-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-5 space-y-3">
            {isDesign ? (
              <Link
                href="/dashboard/store/edit-design"
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
              >
                <p className="text-lg font-semibold text-slate-900">Open Design Studio</p>
                <p className="mt-1 text-sm text-slate-500">
                  Customize colors, typography and button/card styles for your store and landing pages.
                </p>
              </Link>
            ) : products === null || pages === null ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              </div>
            ) : isDetails && products.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-8 text-center text-sm text-slate-500">
                No products yet. Add one below.
              </p>
            ) : isLanding && visiblePages.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-8 text-center text-sm text-slate-500">
                No landing pages yet. Create one below.
              </p>
            ) : isDetails ? (
              products.map((p) => {
                const price = listDisplayPrice(p);
                const editHref = `/dashboard/store/product/new?id=${encodeURIComponent(
                  p.id
                )}`;
                return (
                  <Link
                    key={p.id}
                    href={editHref}
                    className="flex min-h-[74px] items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition hover:border-slate-200 hover:shadow-md sm:px-4"
                  >
                    <span className="shrink-0 text-slate-300" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="7" r="1.5" />
                        <circle cx="15" cy="7" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="17" r="1.5" />
                        <circle cx="15" cy="17" r="1.5" />
                      </svg>
                    </span>
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {p.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {p.title?.trim() || "Untitled product"}
                      </p>
                      <p className="text-sm font-medium text-slate-500">
                        ${price.toFixed(2)}
                      </p>
                    </div>
                    {p.status === "draft" ? (
                      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-800">
                        Draft
                      </span>
                    ) : null}
                    <span className="shrink-0 text-slate-300" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="6" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="18" r="1.5" />
                      </svg>
                    </span>
                  </Link>
                );
              })
            ) : (
              visiblePages.map((p) => {
                const editHref = `/dashboard/store/page/${encodeURIComponent(
                  p.page_type
                )}/${encodeURIComponent(p.id)}`;
                return (
                  <Link
                    key={p.id}
                    href={editHref}
                    className="flex min-h-[74px] items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition hover:border-slate-200 hover:shadow-md sm:px-4"
                  >
                    <span className="shrink-0 text-slate-300" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="7" r="1.5" />
                        <circle cx="15" cy="7" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="17" r="1.5" />
                        <circle cx="15" cy="17" r="1.5" />
                      </svg>
                    </span>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-500">
                      LP
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {p.title?.trim() || "Untitled page"}
                      </p>
                      <p className="text-sm font-medium text-slate-500">/{p.slug}</p>
                    </div>
                    {p.hidden ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          void patchPage(p.id, { hidden: false });
                        }}
                        className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800"
                      >
                        Hidden
                      </button>
                    ) : p.status === "draft" ? (
                      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-800">
                        Draft
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                        Live
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          void patchPage(p.id, { location: p.location === "landing" ? "store" : "landing" });
                        }}
                        className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        {p.location === "landing" ? "Move to Store" : "Make Landing"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          void fetch(`${API_LANDING_PAGES_BASE}/${encodeURIComponent(p.id)}/duplicate`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` },
                          }).then(() => loadAll());
                        }}
                        className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        Duplicate
                      </button>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="mt-6">
            {isDetails ? (
              <Link
                href="/dashboard/store/product/add"
                className="flex w-full items-center justify-center rounded-lg py-3 text-[16px] font-bold text-white shadow-sm"
                style={{ backgroundColor: "#6b46ff" }}
              >
                + Add Product
              </Link>
            ) : isLanding ? (
              <Link
                href="/dashboard/store/page/create"
                className="flex w-full items-center justify-center rounded-lg py-3 text-[16px] font-bold text-white shadow-sm"
                style={{ backgroundColor: "#6b46ff" }}
              >
                + Add Landing Page
              </Link>
            ) : (
              <Link
                href="/dashboard/store/edit-design"
                className="flex w-full items-center justify-center rounded-lg py-3 text-[16px] font-bold text-white shadow-sm"
                style={{ backgroundColor: "#6b46ff" }}
              >
                Open Edit Design
              </Link>
            )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="mx-auto w-full max-w-[300px] rounded-[2rem] border-[8px] border-slate-900 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <AvatarCircle label={displayName} size={44} />
              <p className="font-bold text-slate-900">{displayName}</p>
            </div>
            <div className="space-y-4">
              {previewProducts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                  Product preview appears here.
                </div>
              ) : (
                previewProducts.map((p) => {
                  const price = listDisplayPrice(p);
                  return (
                    <div key={p.id} className="rounded-2xl border border-slate-200 p-3">
                      <div className="flex gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {p.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {p.title?.trim() || "Product"}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {p.subtitle?.trim() || "my product"}
                          </p>
                          <p className="mt-1 font-bold text-emerald-600">
                            ${price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-3 w-full rounded-full py-2.5 text-sm font-bold text-white"
                        style={{ backgroundColor: "#0f766e" }}
                      >
                        {p.button_text?.trim() || "Buy product"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
