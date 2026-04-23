"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_PAYMENTS_BASE, API_PUBLIC_BASE } from "../../lib/api";
import { networkErrorMessage } from "../../lib/networkError";

// ─── Razorpay window type ─────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: { color?: string };
  handler?: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type CreateOrderResponse = {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  order_id: string; // our internal order id
};

type UPIInfo = {
  upi_id?: string;
  upi_display_name?: string;
  upi_link?: string;
};

type SetupHint = {
  message: string;
  action_url?: string;
  action_label?: string;
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  productId: string;
  productTitle: string;
  price: number;
  currency: string;
  sellerName: string;
  sellerHandle: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function fmtINR(n: number, currency = "INR") {
  if (currency === "INR") {
    return `₹${Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${currency} ${Number(n).toFixed(2)}`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
}: {
  message: string;
  type: "error" | "success";
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-medium text-white shadow-2xl ${
        type === "success" ? "bg-emerald-600" : "bg-rose-600"
      }`}
    >
      {type === "error" ? (
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── Buyer Details Form ───────────────────────────────────────────────────────

type BuyerDetails = { name: string; email: string };

function BuyerForm({
  initial,
  onSubmit,
  submitLabel,
  loading,
}: {
  initial: BuyerDetails;
  onSubmit: (d: BuyerDetails) => void;
  submitLabel: string;
  loading: boolean;
}) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    onSubmit({ name: name.trim(), email: email.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500">
          Your Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          required
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            {submitLabel}
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type PayMode = "razorpay" | "upi";

export default function RazorpayCheckout({
  productId,
  productTitle,
  price,
  currency,
  sellerName,
  sellerHandle,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<PayMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [upiInfo, setUpiInfo] = useState<UPIInfo | null>(null);
  const [setupHint, setSetupHint] = useState<SetupHint | null>(null);

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const track = async (eventType: string, trackedProductId?: string) => {
    await fetch(`${API_PUBLIC_BASE}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: sellerHandle,
        product_id: trackedProductId || productId,
        event_type: eventType,
        metadata: { checkout: true },
      }),
    }).catch(() => {});
  };

  // ─── Razorpay flow ───

  const handleRazorpayPay = async (buyer: BuyerDetails) => {
    setLoading(true);
    setSetupHint(null);
    void track("checkout_start", productId);
    try {
      // 1. Create order
      const res = await fetch(`${API_PAYMENTS_BASE}/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          buyer_email: buyer.email,
          buyer_name: buyer.name,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as
        | CreateOrderResponse
        | { message?: string; action_url?: string; action_label?: string };
      if (!res.ok) {
        if ((json as { action_url?: string }).action_url) {
          setSetupHint({
            message: (json as { message?: string }).message || "Payment gateway setup required.",
            action_url: (json as { action_url?: string }).action_url,
            action_label: (json as { action_label?: string }).action_label || "Click here to setup/fix",
          });
        }
        throw new Error((json as { message?: string }).message || "Could not create order.");
      }

      const orderData = json as CreateOrderResponse;

      // 2. Load Razorpay checkout.js
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your internet connection.");

      // 3. Open checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency || currency,
          name: sellerName,
          description: productTitle,
          order_id: orderData.razorpay_order_id,
          prefill: { name: buyer.name, email: buyer.email },
          theme: { color: "#6b46ff" },
          handler: async (response: RazorpayResponse) => {
            // 4. Verify payment
            try {
              const verifyRes = await fetch(
                `${API_PAYMENTS_BASE}/razorpay/verify`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    order_id: orderData.order_id,
                  }),
                }
              );
              const verifyJson = (await verifyRes.json().catch(() => ({}))) as {
                message?: string;
              };
              if (!verifyRes.ok)
                throw new Error(verifyJson.message || "Payment verification failed.");
              showToast("Payment successful!", "success");
              void track("payment_success", productId);
              setTimeout(() => {
                router.push(
                  `/${encodeURIComponent(sellerHandle)}/thank-you?order=${encodeURIComponent(orderData.order_id)}`
                );
              }, 1000);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              resolve();
              setLoading(false);
            },
          },
        });
        rzp.open();
      });
    } catch (e) {
      showToast(networkErrorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── UPI flow ───

  const handleUPIPay = async (buyer: BuyerDetails) => {
    setLoading(true);
    setSetupHint(null);
    void track("checkout_start", productId);
    try {
      const res = await fetch(`${API_PAYMENTS_BASE}/upi/info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          buyer_email: buyer.email,
          buyer_name: buyer.name,
          amount: price,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as
        | UPIInfo
        | { message?: string; action_url?: string; action_label?: string };
      if (!res.ok) {
        if ((json as { action_url?: string }).action_url) {
          setSetupHint({
            message: (json as { message?: string }).message || "UPI setup required.",
            action_url: (json as { action_url?: string }).action_url,
            action_label: (json as { action_label?: string }).action_label || "Click here to setup/fix",
          });
        }
        throw new Error(
          (json as { message?: string }).message || "Could not fetch UPI info."
        );
      }
      setUpiInfo(json as UPIInfo);
    } catch (e) {
      showToast(networkErrorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
      {/* Product summary */}
      <div className="mb-5 rounded-xl bg-slate-50 p-4 text-center">
        <p className="text-sm font-medium text-slate-500">{productTitle}</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">
          {fmtINR(price, currency)}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">by {sellerName}</p>
      </div>

      {/* Payment method selection */}
      {!mode && !upiInfo && (
        <div className="space-y-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-center text-slate-400">
            Choose Payment Method
          </p>
          <button
            type="button"
            onClick={() => setMode("razorpay")}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-indigo-100 bg-indigo-50 px-4 py-3.5 text-left transition hover:border-indigo-300"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <svg
                className="h-5 w-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Pay with Razorpay
              </p>
              <p className="text-xs text-slate-500">
                Cards, NetBanking, Wallets, UPI
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode("upi")}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-violet-100 bg-violet-50 px-4 py-3.5 text-left transition hover:border-violet-300"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-lg">
              ₹
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Pay via UPI
              </p>
              <p className="text-xs text-slate-500">
                Direct UPI transfer — GPay, PhonePe, Paytm
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Razorpay buyer form */}
      {mode === "razorpay" && !upiInfo && (
        <>
          <button
            type="button"
            onClick={() => { setMode(null); }}
            className="mb-3 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <BuyerForm
            initial={{ name: "", email: "" }}
            onSubmit={(d) => void handleRazorpayPay(d)}
            submitLabel="Pay with Razorpay"
            loading={loading}
          />
        </>
      )}

      {/* UPI buyer form */}
      {mode === "upi" && !upiInfo && (
        <>
          <button
            type="button"
            onClick={() => { setMode(null); }}
            className="mb-3 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <BuyerForm
            initial={{ name: "", email: "" }}
            onSubmit={(d) => void handleUPIPay(d)}
            submitLabel="Get UPI Details"
            loading={loading}
          />
        </>
      )}

      {/* UPI info display */}
      {upiInfo && (
        <div className="space-y-4">
          <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
              UPI Payment
            </p>
            {upiInfo.upi_display_name && (
              <p className="mt-1 font-semibold text-slate-900">
                {upiInfo.upi_display_name}
              </p>
            )}
            {upiInfo.upi_id && (
              <p className="mt-1 font-mono text-lg font-bold text-violet-700">
                {upiInfo.upi_id}
              </p>
            )}
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {fmtINR(price, currency)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{productTitle}</p>
          </div>

          {upiInfo.upi_link && (
            <a
              href={upiInfo.upi_link}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Open UPI App
            </a>
          )}

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center text-xs text-slate-500">
            Send exactly{" "}
            <span className="font-semibold text-slate-800">
              {fmtINR(price, currency)}
            </span>{" "}
            to the UPI ID above. Your product will be delivered to your email
            after payment confirmation.
          </div>

          <button
            type="button"
            onClick={() => { setUpiInfo(null); setMode(null); }}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Use a different method
          </button>
        </div>
      )}

      {/* Security note */}
      {!upiInfo && (
        <p className="mt-4 flex items-center justify-center gap-1 text-center text-[11px] text-slate-400">
          <svg
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            />
          </svg>
          Secure checkout. Your data is encrypted.
        </p>
      )}

      {setupHint && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p>{setupHint.message}</p>
          {setupHint.action_url ? (
            <a
              href={setupHint.action_url}
              className="mt-2 inline-flex rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {setupHint.action_label || "Click here to setup/fix"}
            </a>
          ) : null}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
