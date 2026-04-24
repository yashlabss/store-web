"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
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

type CheckoutErrors = {
  email: string;
  whatsapp: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_CODES = [
  { label: "IN (+91)", value: "+91" },
  { label: "US (+1)", value: "+1" },
  { label: "UK (+44)", value: "+44" },
  { label: "AE (+971)", value: "+971" },
  { label: "SG (+65)", value: "+65" },
];

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
  const [buyerCountryCode, setBuyerCountryCode] = useState("+91");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CheckoutErrors>({
    email: "",
    whatsapp: "",
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `${API_PUBLIC_BASE}/store/${encodeURIComponent(username)}`,
          { cache: "no-store" }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.message || "Could not load store.");
        }
        if (!cancelled) setData(json as PublicStorePayload);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load store.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const validateInputs = (): { ok: boolean; whatsappE164: string | null } => {
    const email = buyerEmail.trim();
    const whatsappRaw = buyerWhatsapp.trim();
    const next: CheckoutErrors = { email: "", whatsapp: "" };
    let whatsappE164: string | null = null;

    if (!email) {
      next.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = "Please enter a valid email address.";
    }

    if (whatsappRaw) {
      const candidate = whatsappRaw.startsWith("+")
        ? whatsappRaw
        : `${buyerCountryCode}${whatsappRaw}`;
      const parsed = parsePhoneNumberFromString(candidate);
      if (!parsed || !parsed.isValid()) {
        next.whatsapp = "Please enter a valid WhatsApp number (use country code).";
      } else {
        whatsappE164 = parsed.number;
      }
    }

    setFieldErrors(next);
    return {
      ok: !next.email && !next.whatsapp,
      whatsappE164,
    };
  };

  const purchase = async (productId: string) => {
    const email = buyerEmail.trim();
    const validation = validateInputs();
    if (!validation.ok) {
      setToast("Please fix the highlighted fields.");
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
          ...(validation.whatsappE164
            ? { buyer_whatsapp: validation.whatsappE164 }
            : {}),
          ...(buyerName.trim() ? { buyer_name: buyerName.trim() } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Purchase failed.");
      const orderId = json?.order?.id as string | undefined;
      const token = json?.token as string | undefined;
      if (orderId) {
        const base = `/${encodeURIComponent(username)}/thank-you?order=${encodeURIComponent(orderId)}`;
        router.push(
          token ? `${base}&token=${encodeURIComponent(token)}` : base
        );
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
    <div className="min-h-screen bg-white pb-28">
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-5xl flex-col items-center justify-center gap-12 px-4 py-10 sm:py-14 md:flex-row md:items-start md:justify-center md:gap-16 lg:gap-24">
        <section className="flex flex-col items-center text-center md:shrink-0">
          <ProfileAvatar label={store.display_name} />
          <h1 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-900">
            {store.display_name}
          </h1>
        </section>

        <section className="w-full max-w-md flex-1 md:max-w-lg">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
              <p className="font-medium text-slate-700">No products to show yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Add a product in the dashboard, then click <strong>Publish</strong> (or save as draft —
                drafts appear on this page locally while you develop).
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {products.map((p) => {
                const price = displayPrice(p);
                return (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,.08)]"
                  >
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
                          <h2 className="font-bold leading-snug text-slate-900">{p.title}</h2>
                          {p.status === "draft" ? (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Draft
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.subtitle}</p>
                        <p className="mt-2 text-lg font-bold" style={{ color: PURPLE }}>
                          ${price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-slate-50 px-5 pb-5 pt-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                        1-click checkout
                      </p>
                      <label className="sr-only" htmlFor={`buyer-name-${p.id}`}>
                        Your name
                      </label>
                      <input
                        id={`buyer-name-${p.id}`}
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Your name (optional)"
                        autoComplete="name"
                        className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                      />
                      <label className="sr-only" htmlFor={`buyer-email-${p.id}`}>
                        Email
                      </label>
                      <input
                        id={`buyer-email-${p.id}`}
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => {
                          setBuyerEmail(e.target.value);
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => ({ ...prev, email: "" }));
                          }
                        }}
                        placeholder="Email (required)"
                        autoComplete="email"
                        required
                        className="mb-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                      />
                      {fieldErrors.email ? (
                        <p className="mb-2 text-xs font-medium text-red-600">{fieldErrors.email}</p>
                      ) : null}
                      <label className="sr-only" htmlFor={`buyer-whatsapp-${p.id}`}>
                        WhatsApp number
                      </label>
                      <div className="mb-1 flex gap-2">
                        <select
                          value={buyerCountryCode}
                          onChange={(e) => setBuyerCountryCode(e.target.value)}
                          aria-label="Country code"
                          className="w-[120px] rounded-xl border border-slate-200 px-2 py-2 text-sm outline-none focus:border-violet-400"
                        >
                          {COUNTRY_CODES.map((code) => (
                            <option key={code.value} value={code.value}>
                              {code.label}
                            </option>
                          ))}
                        </select>
                        <input
                          id={`buyer-whatsapp-${p.id}`}
                          type="tel"
                          value={buyerWhatsapp}
                          onChange={(e) => {
                            setBuyerWhatsapp(e.target.value);
                            if (fieldErrors.whatsapp) {
                              setFieldErrors((prev) => ({ ...prev, whatsapp: "" }));
                            }
                          }}
                          placeholder="WhatsApp number (optional)"
                          autoComplete="tel-national"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                        />
                      </div>
                      {fieldErrors.whatsapp ? (
                        <p className="mb-2 text-xs font-medium text-red-600">{fieldErrors.whatsapp}</p>
                      ) : null}
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => void purchase(p.id)}
                        className="w-full rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                        style={{ backgroundColor: PURPLE }}
                      >
                        {busyId === p.id ? "Processing payment..." : "Pay"}
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

      <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm"
        >
          Privacy Policy
        </button>
      </div>

      <div className="fixed bottom-0 left-0 flex w-full items-center justify-between gap-3 bg-[#6b46ff] px-4 py-2.5 text-white">
        <span className="text-sm font-bold">$ Yash</span>
        <span className="text-xs opacity-90">Try 14 Days Free</span>
      </div>
    </div>
  );
}
