"use client";

import { useState } from "react";
import { API_PAYMENTS_BASE, authFetch } from "../../lib/api";
import { networkErrorMessage } from "../../lib/networkError";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RazorpaySetupModal({ isOpen, onClose, onSuccess }: Props) {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!keyId.trim() || !keySecret.trim()) {
      setError("Both Key ID and Key Secret are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await authFetch(`${API_PAYMENTS_BASE}/settings`, {
        method: "POST",
        body: JSON.stringify({
          razorpay_key_id: keyId.trim(),
          razorpay_key_secret: keySecret.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (json as { message?: string }).message || "Failed to save settings."
        );
      onSuccess();
      onClose();
    } catch (e) {
      setError(networkErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
            💳
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Payment Setup Required
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              To accept payments, connect your Razorpay account.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-5 rounded-xl bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Steps
          </p>
          <ol className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                1
              </span>
              <span>
                Create a free Razorpay account{" "}
                <a
                  href="https://razorpay.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Create Account →
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                2
              </span>
              <span>
                Get your API keys from{" "}
                <span className="font-medium">Settings → API Keys</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                3
              </span>
              <span>Enter them below</span>
            </li>
          </ol>
        </div>

        {/* Key inputs */}
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Key ID
            </label>
            <input
              type="text"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              placeholder="rzp_live_xxxxxxxxxxxx"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Key Secret
            </label>
            <input
              type="password"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              placeholder="••••••••••••••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save & Enable Payments"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Skip for now
          </button>
        </div>

        {/* Footnote */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Razorpay is free to join. They charge 2% per transaction.
        </p>
      </div>
    </div>
  );
}
