"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { API_PUBLIC_BASE } from "../../lib/api";

const PURPLE = "#6b46ff";

type CheckoutJson = {
  discount_enabled?: boolean;
  discount_price?: number;
};

export type PublicProduct = {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  price_numeric: number;
  thumbnail_url: string | null;
  style: string;
  status?: string;
  checkout_json: CheckoutJson & Record<string, unknown>;
};

type PublicStorePayload = {
  store: { username: string; display_name: string };
  products: PublicProduct[];
};

function displayPrice(p: PublicProduct): number {
  const cj = p.checkout_json || {};
  if (cj.discount_enabled && Number(cj.discount_price) > 0) {
    return Number(cj.discount_price);
  }
  return Number(p.price_numeric) || 0;
}

function ProfileAvatar({ label }: { label: string }) {
  return (
    <div
      className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-full ring-1 ring-slate-100"
      style={{ backgroundColor: "#dbeafe" }}
      aria-label={label ? `Profile: ${label}` : "Profile"}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-14 w-14 text-[#93c5fd]"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

export default function PublicStorePage({ username }: { username: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PublicStorePayload | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_PUBLIC_BASE}/store/${encodeURIComponent(username)}`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Could not load store.");
      }
      setData(json as PublicStorePayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load store.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    void load();
  }, [load]);

  const purchase = async (productId: string) => {
    let email = buyerEmail.trim();
    if (!email && typeof window !== "undefined") {
      const entered = window.prompt("Enter your email to continue:");
      if (entered) {
        email = entered.trim();
        setBuyerEmail(email);
      }
    }
    if (!email) {
      setToast("Enter your email to complete purchase.");
      window.setTimeout(() => setToast(""), 4000);
      return;
    }
    setBusyId(productId);
    setToast("");
    try {
      const res = await fetch(`${API_PUBLIC_BASE}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          buyer_email: email,
          ...(buyerName.trim() ? { buyer_name: buyerName.trim() } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Purchase failed.");
      const orderId = json?.order?.id as string | undefined;
      if (orderId) {
        router.push(`/${encodeURIComponent(username)}/thank-you?order=${encodeURIComponent(orderId)}`);
        return;
      }
      setToast("Purchase saved. Thank you!");
      window.setTimeout(() => setToast(""), 4000);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Purchase failed.");
      window.setTimeout(() => setToast(""), 4000);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-lg font-semibold text-slate-800">Store not found</p>
        <p className="mt-2 max-w-md text-slate-500">
          {error || "No account with this username, or the link is wrong."}
        </p>
        <p className="mt-3 max-w-md text-sm text-slate-400">
          Use the same username you chose at signup (e.g. <code className="rounded bg-slate-100 px-1">/yaswanth</code>).
        </p>
        <Link href="/" className="mt-8 font-semibold text-violet-600 underline">
          Go home
        </Link>
      </div>
    );
  }

  const { store, products } = data;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-6xl flex-col items-center justify-center gap-10 px-4 py-10 md:flex-row md:items-center md:justify-between md:gap-16 md:px-8">
        <section className="flex w-full max-w-[230px] flex-col items-center text-center md:shrink-0">
          <ProfileAvatar label={store.display_name} />
          <h1 className="mt-5 text-center text-[32px] font-bold tracking-tight text-slate-900">
            {store.display_name}
          </h1>
        </section>

        <section className="w-full flex-1">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
              <p className="font-medium text-slate-700">No products to show yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Add a product in the dashboard, then click <strong>Publish</strong> (or save as draft —
                drafts appear on this page locally while you develop).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {products.map((p) => {
                const price = displayPrice(p);
                return (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-[#0a7a69]/40 bg-white shadow-[0_8px_24px_rgba(15,23,42,.08)]"
                  >
                    <div className="flex gap-3 px-4 pt-4">
                      <div className="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {p.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.thumbnail_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <h2 className="line-clamp-1 text-[18px] font-bold leading-tight text-slate-900">{p.title}</h2>
                          {p.status === "draft" ? (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Draft
                            </span>
                          ) : null}
                        </div>
                        <p className="line-clamp-1 text-sm text-slate-500">{p.subtitle}</p>
                        <p className="mt-1 text-[20px] font-bold text-[#0a7a69]">
                          ${price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-3">
                      <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0a7a69] text-[10px] text-white">
                          ↓
                        </span>
                        Ready To Download
                      </p>
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => void purchase(p.id)}
                        className="w-full rounded-full py-3 text-[18px] font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                        style={{ backgroundColor: "#0a7a69" }}
                      >
                        {busyId === p.id ? "Processing…" : p.button_text || "Buy now"}
                      </button>
                      <button type="button" className="mt-3 w-full text-center text-sm font-semibold text-[#0a7a69]">
                        Learn More
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {toast ? (
        <div
          className="fixed bottom-24 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-center text-sm text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <div className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2">
        <button
          type="button"
          className="bg-transparent px-2 py-1 text-xs font-medium text-slate-500"
        >
          Privacy Policy
        </button>
      </div>

      <div className="fixed bottom-0 left-0 flex w-[210px] items-center justify-between gap-3 rounded-tr-xl bg-[#eceeff] px-3 py-2 text-[#1f2a44]">
        <span className="text-sm font-bold">Stan</span>
        <span className="text-xs font-semibold">Try 14 Days Free</span>
      </div>
    </div>
  );
}
