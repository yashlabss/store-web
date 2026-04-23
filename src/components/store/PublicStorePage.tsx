"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  theme?: {
    primary_color?: string;
    secondary_color?: string;
    background_color?: string;
    primary_font?: string;
    card_style?: string;
  } | null;
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

// ── Free-product checkout modal ───────────────────────────────────────────────

type FreeModalProps = {
  product: PublicProduct;
  onClose: () => void;
  onConfirm: (name: string, email: string) => void;
  busy: boolean;
  serverError?: string;
};

function FreeCheckoutModal({
  product,
  onClose,
  onConfirm,
  busy,
  serverError = "",
}: FreeModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    if (!name.trim()) {
      setNameErr("Please enter your name");
      hasError = true;
    } else if (name.trim().length < 2) {
      setNameErr("Please enter your name");
      hasError = true;
    } else {
      setNameErr("");
    }
    if (!email.trim()) {
      setEmailErr("Please enter your email");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailErr("Please enter a valid email");
      hasError = true;
    } else {
      setEmailErr("");
    }
    if (hasError) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailErr("Please enter a valid email");
      return;
    }
    onConfirm(name.trim(), email.trim());
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Free product
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900">{product.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Price badge */}
        <div className="mb-5 rounded-xl bg-emerald-50 py-2 text-center text-sm font-bold text-emerald-700">
          FREE
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              disabled={busy}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            {nameErr ? <p className="mt-1 text-xs text-rose-600">{nameErr}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              required
              disabled={busy}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            {emailErr ? <p className="mt-1 text-xs text-rose-600">{emailErr}</p> : null}
          </div>
          {serverError ? (
            <p className="text-xs text-rose-600">{serverError}</p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-95 disabled:opacity-60"
            style={{ backgroundColor: PURPLE }}
          >
            {busy ? "Please wait..." : "Get Free Access"}
          </button>
          <p className="text-center text-[11px] text-slate-400">
            By continuing you agree to our Terms of Service.
          </p>
        </form>
      </div>
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────

export default function PublicStorePage({ username }: { username: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PublicStorePayload | null>(null);
  const [toast, setToast] = useState("");

  // Modal state — null means closed
  const [freeModalProduct, setFreeModalProduct] = useState<PublicProduct | null>(null);
  const [freeBusy, setFreeBusy] = useState(false);
  const [freeError, setFreeError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_PUBLIC_BASE}/store/${encodeURIComponent(username)}`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not load store.");
      setData(json as PublicStorePayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load store.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    void fetch(`${API_PUBLIC_BASE}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        event_type: "page_view",
        metadata: { page: "store" },
      }),
    }).catch(() => {});
  }, [username]);

  // Free product purchase (no payment gateway needed)
  const purchaseFree = async (productId: string, buyerName: string, buyerEmail: string) => {
    setFreeBusy(true);
    try {
      const res = await fetch(`${API_PUBLIC_BASE}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Purchase failed.");
      const orderId = json?.order?.id as string | undefined;
      const token = json?.token as string | undefined;
      setFreeModalProduct(null);
      setFreeError("");
      if (orderId) {
        router.push(
          `/${encodeURIComponent(username)}/thank-you?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token || "")}`
        );
        return;
      }
      setToast("Purchase saved. Thank you!");
      window.setTimeout(() => setToast(""), 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setFreeError(msg);
      setToast(msg);
      window.setTimeout(() => setToast(""), 4000);
    } finally {
      setFreeBusy(false);
    }
  };

  // ── Render: loading ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  // ── Render: error ──
  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-lg font-semibold text-slate-800">Store not found</p>
        <p className="mt-2 max-w-md text-slate-500">
          {error || "No account with this username, or the link is wrong."}
        </p>
        <p className="mt-3 max-w-md text-sm text-slate-400">
          Use the same username you chose at signup (e.g.{" "}
          <code className="rounded bg-slate-100 px-1">/yaswanth</code>).
        </p>
        <Link href="/" className="mt-8 font-semibold text-violet-600 underline">
          Go home
        </Link>
      </div>
    );
  }

  const { store, products, theme } = data;
  const primaryColor = theme?.primary_color || PURPLE;
  const secondaryColor = theme?.secondary_color || PURPLE;
  const backgroundColor = theme?.background_color || "#ffffff";
  const fontFamily = theme?.primary_font || "Inter";
  const cardRadius = theme?.card_style === "sharp" ? "0.5rem" : "1rem";

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor, fontFamily }}>
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-5xl flex-col items-center justify-center gap-12 px-4 py-10 sm:py-14 md:flex-row md:items-start md:justify-center md:gap-16 lg:gap-24">
        {/* Creator profile */}
        <section className="flex flex-col items-center text-center md:shrink-0">
          <ProfileAvatar label={store.display_name} />
          <h1 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-900">
            {store.display_name}
          </h1>
        </section>

        {/* Product list */}
        <section className="w-full max-w-md flex-1 md:max-w-lg">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
              <p className="font-medium text-slate-700">No products to show yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Add a product in the dashboard, then click{" "}
                <strong>Publish</strong> (or save as draft — drafts appear on
                this page locally while you develop).
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {products.map((p) => {
                const price = displayPrice(p);
                const isFree = price === 0;
                return (
                  <article
                    key={p.id}
                    className="overflow-hidden border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,.08)]"
                    style={{ borderRadius: cardRadius }}
                  >
                    {/* Product header */}
                    <div className="flex gap-4 p-5">
                      <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-slate-100">
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
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-start gap-2">
                          <h2 className="font-bold leading-snug text-slate-900">
                            {p.title}
                          </h2>
                          {p.status === "draft" && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                          {p.subtitle}
                        </p>
                        <p
                          className="mt-2 text-lg font-bold"
                          style={{ color: isFree ? "#059669" : secondaryColor }}
                        >
                          {isFree ? "Free" : `₹${price.toFixed(2)}`}
                        </p>
                      </div>
                    </div>

                    {/* Buy button */}
                    <div className="border-t border-slate-50 px-5 pb-5 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          void fetch(`${API_PUBLIC_BASE}/track`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              username,
                              product_id: p.id,
                              event_type: "cta_click",
                              metadata: { source: "store_card" },
                            }),
                          }).catch(() => {});
                          setFreeError("");
                          setFreeModalProduct(p);
                        }}
                        className="w-full rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-95"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {p.button_text || (isFree ? "Get Now" : "Buy Now")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-center text-sm text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}

      {/* Privacy policy stub */}
      <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm"
        >
          Privacy Policy
        </button>
      </div>

      {/* Branding bar */}
      <div className="fixed bottom-0 left-0 flex w-full items-center justify-between gap-3 bg-[#6b46ff] px-4 py-2.5 text-white">
        <span className="text-sm font-bold">$ Yash</span>
        <span className="text-xs opacity-90">Try 14 Days Free</span>
      </div>

      {/* Free-product checkout modal */}
      {freeModalProduct && (
        <FreeCheckoutModal
          product={freeModalProduct}
          busy={freeBusy}
          serverError={freeError}
          onClose={() => setFreeModalProduct(null)}
          onConfirm={(name, email) =>
            void purchaseFree(freeModalProduct.id, name, email)
          }
        />
      )}

      {/* Paid modal intentionally disabled for no-payment claim flow */}
    </div>
  );
}
