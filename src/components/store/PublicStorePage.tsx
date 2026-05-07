"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_PUBLIC_BASE } from "../../lib/api";

type CheckoutJson = {
  discount_enabled?: boolean;
  discount_price?: number;
  purchase_cta?: string;
  custom_fields?: string[];
};

type ProductOptionsJson = {
  collect_emails?: boolean;
  custom_fields?: Array<string | { label?: string; id?: string }>;
  webinar?: {
    slots?: Array<{ dateIso?: string; time?: string }>;
  };
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
  options_json?: ProductOptionsJson & Record<string, unknown>;
  product_type?: string;
};

type PublicStorePayload = {
  store: { username: string; display_name: string };
  products: PublicProduct[];
};

type BuyerProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
};

type LeadFormState = {
  name: string;
  email: string;
  answers: Record<string, string>;
};

type WebinarChoiceState = {
  slotKey: string;
  wantsRecording: boolean;
};

type WebinarCheckoutState = {
  email: string;
  phone: string;
  countryCode: string;
  dialCode: string;
};

const PHONE_COUNTRY_OPTIONS = [
  { code: "IN", label: "India", dialCode: "+91" },
  { code: "US", label: "United States", dialCode: "+1" },
  { code: "GB", label: "United Kingdom", dialCode: "+44" },
  { code: "AE", label: "UAE", dialCode: "+971" },
  { code: "SG", label: "Singapore", dialCode: "+65" },
  { code: "AU", label: "Australia", dialCode: "+61" },
] as const;

function normalizePhoneForApi(rawPhone: string, dialCode: string): string {
  const raw = String(rawPhone || "").trim();
  const dial = String(dialCode || "").trim() || "+91";
  if (!raw) return "";
  if (raw.startsWith("+")) {
    const digits = raw.replace(/[^\d+]/g, "");
    return /^\+\d{8,15}$/.test(digits) ? digits : "";
  }
  const localDigits = raw.replace(/\D/g, "");
  if (!localDigits) return "";
  const full = `${dial}${localDigits}`.replace(/\s+/g, "");
  return /^\+\d{8,15}$/.test(full) ? full : "";
}

function displayPrice(p: PublicProduct): number {
  const cj = p.checkout_json || {};
  if (cj.discount_enabled && Number(cj.discount_price) > 0) {
    return Number(cj.discount_price);
  }
  return Number(p.price_numeric) || 0;
}

function getProductCta(p: PublicProduct, fallback: string) {
  const checkoutCta = String(p.checkout_json?.purchase_cta || "").trim();
  if (checkoutCta) return checkoutCta;
  const buttonText = String(p.button_text || "").trim();
  if (buttonText) return buttonText;
  return fallback;
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
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);
  const [buyerChecked, setBuyerChecked] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [leadForms, setLeadForms] = useState<Record<string, LeadFormState>>({});
  const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});
  const [leadSuccess, setLeadSuccess] = useState<Record<string, string>>({});
  const [webinarChoices, setWebinarChoices] = useState<Record<string, WebinarChoiceState>>({});
  const [webinarForms, setWebinarForms] = useState<Record<string, WebinarCheckoutState>>({});

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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token =
        typeof window === "undefined"
          ? ""
          : localStorage.getItem("buyer_auth_token") || "";
      if (!token) {
        if (!cancelled) {
          setBuyer(null);
          setBuyerChecked(true);
        }
        return;
      }
      try {
        const res = await fetch(`${API_PUBLIC_BASE}/buyer/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Session expired.");
        if (!cancelled) setBuyer(json.buyer as BuyerProfile);
      } catch {
        if (typeof window !== "undefined") localStorage.removeItem("buyer_auth_token");
        if (!cancelled) setBuyer(null);
      } finally {
        if (!cancelled) setBuyerChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isWebinarProduct = (p: PublicProduct) => {
    if (String(p.product_type || "").toLowerCase() === "webinar") return true;
    const w = p.options_json?.webinar;
    return Boolean(w && typeof w === "object" && Array.isArray((w as { slots?: unknown }).slots));
  };

  const getWebinarSlots = (p: PublicProduct) => {
    const raw = p.options_json?.webinar?.slots;
    if (!Array.isArray(raw)) return [] as { dateIso: string; time: string }[];
    return raw
      .filter(
        (slot) =>
          slot &&
          typeof slot === "object" &&
          typeof slot.dateIso === "string" &&
          typeof slot.time === "string" &&
          slot.dateIso.trim() &&
          slot.time.trim()
      )
      .map((slot) => ({
        dateIso: slot.dateIso!.trim(),
        time: slot.time!.trim(),
      }));
  };

  const formatWebinarSlot = (slot: { dateIso: string; time: string }) => {
    const d = new Date(`${slot.dateIso}T00:00:00`);
    const datePart = Number.isNaN(d.getTime())
      ? slot.dateIso
      : d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
    return `${datePart} • ${slot.time}`;
  };

  const purchase = async (product: PublicProduct) => {
    const token =
      typeof window === "undefined"
        ? ""
        : localStorage.getItem("buyer_auth_token") || "";
    const webinarSlots = getWebinarSlots(product);
    const isWebinar = isWebinarProduct(product);
    const webinarForm = webinarForms[product.id] || {
      email: "",
      phone: "",
      countryCode: "IN",
      dialCode: "+91",
    };
    const emailCandidate = isWebinar
      ? String(webinarForm.email || "").trim()
      : String(buyer?.email || "").trim();
    const buyerPhone = isWebinar
      ? normalizePhoneForApi(webinarForm.phone || "", webinarForm.dialCode || "+91")
      : String(buyer?.phone || "").trim();
    if (!isWebinar && !token) {
      const redirectTo = `/${encodeURIComponent(username)}`;
      router.push(`/buyer/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      return;
    }
    if (isWebinar && !/^\S+@\S+\.\S+$/.test(emailCandidate)) {
      setToast("Please enter a valid email.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }
    if (isWebinar && !buyerPhone) {
      setToast("Please enter a valid phone number with country.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }
    const choice = webinarChoices[product.id];
    const defaultSlotKey =
      webinarSlots.length > 0 ? `${webinarSlots[0].dateIso}|${webinarSlots[0].time}` : "";
    const slotKey = choice?.slotKey || defaultSlotKey;
    const selectedSlot = webinarSlots.find((slot) => `${slot.dateIso}|${slot.time}` === slotKey);
    if (isWebinar && !selectedSlot) {
      setToast("Please select a webinar slot.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }
    setBusyId(product.id);
    setToast("");
    try {
      const res = await fetch(`${API_PUBLIC_BASE}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product_id: product.id,
          ...(buyerPhone ? { buyer_whatsapp: buyerPhone } : {}),
          ...(buyer?.full_name ? { buyer_name: buyer.full_name } : {}),
          ...(emailCandidate ? { buyer_email: emailCandidate } : {}),
          ...(isWebinar && selectedSlot
            ? {
                webinar_slot_date: selectedSlot.dateIso,
                webinar_slot_time: selectedSlot.time,
                webinar_recording_requested: Boolean(choice?.wantsRecording),
              }
            : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof json?.message === "string" && json.message.trim()
            ? json.message.trim()
            : typeof json?.error === "string" && json.error.trim()
              ? json.error.trim()
              : "Purchase failed.";
        throw new Error(msg);
      }
      const orderId = json?.order?.id as string | undefined;
      const deliveryToken = json?.token as string | undefined;
      if (orderId) {
        const base = `/${encodeURIComponent(username)}/thank-you?order=${encodeURIComponent(orderId)}`;
        router.push(
          deliveryToken ? `${base}&token=${encodeURIComponent(deliveryToken)}` : base
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

  /** Sticker price (not discount-adjusted). Used so $0 guides from "Add product" match Collect Emails behavior. */
  const stickerPrice = (p: PublicProduct) => Number(p.price_numeric) || 0;

  const getCustomFields = (p: PublicProduct) => {
    const fromOptions = Array.isArray(p.options_json?.custom_fields)
      ? p.options_json.custom_fields
          .map((field) => {
            if (typeof field === "string") return field.trim();
            if (field && typeof field === "object" && typeof field.label === "string") {
              return field.label.trim();
            }
            return "";
          })
          .filter((x): x is string => Boolean(x))
      : [];
    if (fromOptions.length) return fromOptions;
    const cf = p.checkout_json?.custom_fields;
    if (!Array.isArray(cf)) return [];
    return cf
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter((x): x is string => Boolean(x));
  };

  const isLeadCaptureProduct = (p: PublicProduct) => {
    // Webinars always use the webinar checkout UI (email, phone + country, slot, recording) — not the generic lead form.
    if (isWebinarProduct(p)) return false;
    const opts = p.options_json;
    if (opts?.collect_emails === false) return false;
    if (Boolean(opts?.collect_emails)) return true;
    if (String(p.product_type || "").toLowerCase() === "emails") return true;
    // Free sticker-price product with configured questions (e.g. "free guide" from Add product) → same form as Collect Emails
    if (stickerPrice(p) <= 0 && getCustomFields(p).length > 0) return true;
    return false;
  };

  const getLeadForm = (productId: string, p: PublicProduct): LeadFormState => {
    const existing = leadForms[productId];
    if (existing) return existing;
    const answers = Object.fromEntries(getCustomFields(p).map((field) => [field, ""]));
    return { name: "", email: "", answers };
  };

  const setLeadFormField = (
    productId: string,
    p: PublicProduct,
    key: "name" | "email",
    value: string
  ) => {
    setLeadForms((prev) => {
      const current = prev[productId] || getLeadForm(productId, p);
      return {
        ...prev,
        [productId]: { ...current, [key]: value },
      };
    });
    setLeadErrors((prev) => ({ ...prev, [productId]: "" }));
    setLeadSuccess((prev) => ({ ...prev, [productId]: "" }));
  };

  const setLeadAnswer = (productId: string, p: PublicProduct, field: string, value: string) => {
    setLeadForms((prev) => {
      const current = prev[productId] || getLeadForm(productId, p);
      return {
        ...prev,
        [productId]: {
          ...current,
          answers: { ...current.answers, [field]: value },
        },
      };
    });
    setLeadErrors((prev) => ({ ...prev, [productId]: "" }));
    setLeadSuccess((prev) => ({ ...prev, [productId]: "" }));
  };

  const submitLead = async (p: PublicProduct) => {
    const form = getLeadForm(p.id, p);
    const customFields = getCustomFields(p);
    const name = form.name.trim();
    const email = form.email.trim();
    const phoneFieldKey = customFields.find((field) => /whatsapp|phone|mobile/i.test(field));
    const phoneValue = phoneFieldKey ? String(form.answers[phoneFieldKey] || "").trim() : "";
    if (name.length < 2) {
      setLeadErrors((prev) => ({ ...prev, [p.id]: "Please enter your name." }));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setLeadErrors((prev) => ({ ...prev, [p.id]: "Please enter a valid email address." }));
      return;
    }
    for (const field of customFields) {
      const value = String(form.answers[field] || "").trim();
      if (!value) {
        setLeadErrors((prev) => ({ ...prev, [p.id]: `Please fill "${field}".` }));
        return;
      }
    }

    setBusyId(p.id);
    setLeadErrors((prev) => ({ ...prev, [p.id]: "" }));
    setLeadSuccess((prev) => ({ ...prev, [p.id]: "" }));
    try {
      const res = await fetch(`${API_PUBLIC_BASE}/lead-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: p.id,
          buyer_name: name,
          buyer_email: email,
          ...(phoneValue ? { buyer_whatsapp: phoneValue } : {}),
          answers: Object.fromEntries(
            customFields.map((field) => [field, String(form.answers[field] || "").trim()])
          ),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not submit application.");
      setLeadSuccess((prev) => ({
        ...prev,
        [p.id]: "Submitted successfully. Please check your email.",
      }));
      setLeadForms((prev) => ({
        ...prev,
        [p.id]: {
          name: "",
          email: "",
          answers: Object.fromEntries(customFields.map((field) => [field, ""])),
        },
      }));
    } catch (e) {
      setLeadErrors((prev) => ({
        ...prev,
        [p.id]: e instanceof Error ? e.message : "Could not submit application.",
      }));
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
          {buyerChecked && !buyer ? (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
              <p className="text-sm font-semibold text-amber-900">
                Login required before purchase
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Sign in with buyer email/password for paid checkout. Lead/application forms can be submitted directly.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/buyer/login?redirectTo=${encodeURIComponent(`/${username}`)}`}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Buyer Login
                </Link>
                <Link
                  href={`/buyer/signup?redirectTo=${encodeURIComponent(`/${username}`)}`}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
                >
                  Create Buyer Account
                </Link>
              </div>
            </div>
          ) : null}
          {buyer ? (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Logged in as{" "}
              <span className="font-semibold">
                {buyer.full_name?.trim() ? buyer.full_name : buyer.email}
              </span>
            </div>
          ) : null}
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
                const isLeadCapture = isLeadCaptureProduct(p);
                const form = getLeadForm(p.id, p);
                const customFields = getCustomFields(p);
                const webinarSlotsList = getWebinarSlots(p);
                const isWebinarCard = isWebinarProduct(p);
                const webinarRegisterDisabled = isWebinarCard && webinarSlotsList.length === 0;
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
                      {isLeadCapture ? (
                        <>
                          <input
                            type="text"
                            placeholder="Your name"
                            value={form.name}
                            onChange={(e) => setLeadFormField(p.id, p, "name", e.target.value)}
                            className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                          />
                          <input
                            type="email"
                            placeholder="Your email"
                            value={form.email}
                            onChange={(e) => setLeadFormField(p.id, p, "email", e.target.value)}
                            className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                          />
                          {customFields.map((field) => (
                            <input
                              key={field}
                              type="text"
                              placeholder={field}
                              value={form.answers[field] || ""}
                              onChange={(e) => setLeadAnswer(p.id, p, field, e.target.value)}
                              className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                            />
                          ))}
                          {leadErrors[p.id] ? (
                            <p className="mb-2 text-xs font-medium text-red-600">{leadErrors[p.id]}</p>
                          ) : null}
                          {leadSuccess[p.id] ? (
                            <p className="mb-2 text-xs font-medium text-emerald-600">{leadSuccess[p.id]}</p>
                          ) : null}
                          <button
                            type="button"
                            disabled={busyId === p.id}
                            onClick={() => void submitLead(p)}
                            className="w-full rounded-full py-3 text-[18px] font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                            style={{ backgroundColor: "#0a7a69" }}
                          >
                            {busyId === p.id
                              ? "Submitting..."
                              : getProductCta(p, "Submit application")}
                          </button>
                        </>
                      ) : (
                        <>
                          {isWebinarCard ? (
                            <div className="mb-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <label className="block text-xs font-semibold text-slate-700">
                                Email
                              </label>
                              <input
                                type="email"
                                value={webinarForms[p.id]?.email || ""}
                                onChange={(e) =>
                                  setWebinarForms((prev) => ({
                                    ...prev,
                                    [p.id]: {
                                      email: e.target.value,
                                      phone: prev[p.id]?.phone || "",
                                      countryCode: prev[p.id]?.countryCode || "IN",
                                      dialCode: prev[p.id]?.dialCode || "+91",
                                    },
                                  }))
                                }
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                              />
                              <label className="block text-xs font-semibold text-slate-700">
                                Phone / WhatsApp number
                              </label>
                              <div className="flex gap-2">
                                <select
                                  value={webinarForms[p.id]?.countryCode || "IN"}
                                  onChange={(e) => {
                                    const selected =
                                      PHONE_COUNTRY_OPTIONS.find((c) => c.code === e.target.value) ||
                                      PHONE_COUNTRY_OPTIONS[0];
                                    setWebinarForms((prev) => ({
                                      ...prev,
                                      [p.id]: {
                                        email: prev[p.id]?.email || "",
                                        phone: prev[p.id]?.phone || "",
                                        countryCode: selected.code,
                                        dialCode: selected.dialCode,
                                      },
                                    }));
                                  }}
                                  className="w-[44%] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                                >
                                  {PHONE_COUNTRY_OPTIONS.map((c) => (
                                    <option key={c.code} value={c.code}>
                                      {c.label} ({c.dialCode})
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="tel"
                                  value={webinarForms[p.id]?.phone || ""}
                                  onChange={(e) =>
                                    setWebinarForms((prev) => ({
                                      ...prev,
                                      [p.id]: {
                                        email: prev[p.id]?.email || "",
                                        phone: e.target.value,
                                        countryCode: prev[p.id]?.countryCode || "IN",
                                        dialCode: prev[p.id]?.dialCode || "+91",
                                      },
                                    }))
                                  }
                                  placeholder="Enter number"
                                  className="w-[56%] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                                />
                              </div>
                              <label className="block text-xs font-semibold text-slate-700">
                                Choose webinar slot
                              </label>
                              {webinarSlotsList.length > 0 ? (
                                <select
                                  value={
                                    webinarChoices[p.id]?.slotKey ||
                                    `${webinarSlotsList[0].dateIso}|${webinarSlotsList[0].time}`
                                  }
                                  onChange={(e) =>
                                    setWebinarChoices((prev) => ({
                                      ...prev,
                                      [p.id]: {
                                        slotKey: e.target.value,
                                        wantsRecording: prev[p.id]?.wantsRecording || false,
                                      },
                                    }))
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                                >
                                  {webinarSlotsList.map((slot) => {
                                    const key = `${slot.dateIso}|${slot.time}`;
                                    return (
                                      <option key={key} value={key}>
                                        {formatWebinarSlot(slot)}
                                      </option>
                                    );
                                  })}
                                </select>
                              ) : (
                                <>
                                  <select
                                    disabled
                                    aria-disabled
                                    className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600"
                                    value=""
                                  >
                                    <option value="">No sessions scheduled yet</option>
                                  </select>
                                  <p className="text-xs text-amber-800">
                                    Add at least one date and time slot in the dashboard (Webinar tab)
                                    so people can register.
                                  </p>
                                </>
                              )}
                              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={Boolean(webinarChoices[p.id]?.wantsRecording)}
                                  onChange={(e) =>
                                    setWebinarChoices((prev) => ({
                                      ...prev,
                                      [p.id]: {
                                        slotKey:
                                          webinarSlotsList.length > 0
                                            ? prev[p.id]?.slotKey ||
                                              `${webinarSlotsList[0].dateIso}|${webinarSlotsList[0].time}`
                                            : "",
                                        wantsRecording: e.target.checked,
                                      },
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                />
                                I want recorded copy later
                              </label>
                            </div>
                          ) : null}
                          <button
                            type="button"
                            disabled={busyId === p.id || webinarRegisterDisabled}
                            onClick={() => void purchase(p)}
                            className="w-full rounded-full py-3 text-[18px] font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                            style={{ backgroundColor: "#0a7a69" }}
                          >
                            {busyId === p.id
                              ? isWebinarCard
                                ? "Registering..."
                                : "Processing payment..."
                              : getProductCta(p, isWebinarCard ? "Register" : "Pay")}
                          </button>
                        </>
                      )}
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
