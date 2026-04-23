"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_PUBLIC_BASE } from "../../lib/api";

const PURPLE = "#6b46ff";

type DownloadLink = {
  label: string;
  url: string;
};

type Delivery = {
  type: string;
  file_name: string | null;
  redirect_url: string | null;
  download_links?: DownloadLink[];
  thumbnail_url?: string | null;
};

type OrderPayload = {
  order: {
    id: string;
    created_at: string;
    amount: number;
    currency: string;
    buyer_email: string | null;
    buyer_name: string | null;
    payment_method: string;
    product_title: string | null;
  };
  delivery: Delivery;
  access: {
    token: string;
    token_status: "active" | "expired" | "limit_reached" | "revoked";
    max_downloads: number;
    download_count: number;
    remaining_downloads: number;
    expires_at: string;
  };
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckCircleIcon() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
      <svg
        className="h-9 w-9 text-emerald-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function TokenExpiredView({ username }: { username: string }) {
  return (
    <div className="space-y-5 text-center">
      <p className="text-5xl">⏰</p>
      <h2 className="text-xl font-bold text-slate-900">This link has expired</h2>
      <p className="text-sm text-slate-600">
        Download links are valid for 48 hours after getting access.
      </p>
      <div className="space-y-2">
        <Link
          href="/auth/login"
          className="block w-full rounded-full py-3 text-sm font-bold text-white"
          style={{ backgroundColor: PURPLE }}
        >
          Log In to Re-download
        </Link>
        <Link
          href="/auth/signup"
          className="block w-full rounded-full border border-slate-200 py-3 text-sm font-bold text-slate-700"
        >
          Create Account
        </Link>
      </div>
      <Link href={`/${encodeURIComponent(username)}`} className="text-sm font-semibold text-slate-500 underline">
        Back to store
      </Link>
    </div>
  );
}

function LimitReachedView() {
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Download limit reached
      </p>
      <Link
        href="/auth/login"
        className="block w-full rounded-full py-3 text-sm font-bold text-white"
        style={{ backgroundColor: PURPLE }}
      >
        Log In to Re-download
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ThankYouPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username =
    typeof params?.username === "string" ? params.username : "";
  const orderId = searchParams.get("order");
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<OrderPayload | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    if (!orderId || !token) {
      setLoading(false);
      setError("Missing order or token. Return to the store and claim again.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const res = await fetch(
          `${API_PUBLIC_BASE}/order/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Could not load order.");
        if (!cancelled) setData(json as OrderPayload);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Could not load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId, token]);

  async function handleDownload() {
    if (!data?.access?.token) return;
    setDownloadLoading(true);
    setDownloadError("");
    try {
      const res = await fetch(`${API_PUBLIC_BASE}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.access.token }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not prepare download.");
      const url = json.url as string;
      const fileName =
        typeof json.file_name === "string" && json.file_name.trim()
          ? json.file_name.trim()
          : "download";
      if (!url) throw new Error("Missing download URL.");
      if (url.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        try {
          const fileRes = await fetch(url, { mode: "cors" });
          if (fileRes.ok) {
            const blob = await fileRes.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
          } else {
            window.location.href = url;
          }
        } catch {
          window.location.href = url;
        }
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              access: {
                ...prev.access,
                remaining_downloads: Number(json.remaining_downloads),
                download_count: Number(json.download_count),
              },
            }
          : prev
      );
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Could not download file.");
    } finally {
      setDownloadLoading(false);
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-lg font-semibold text-slate-800">
          {error || "Something went wrong."}
        </p>
        <Link
          href={username ? `/${encodeURIComponent(username)}` : "/"}
          className="mt-6 font-semibold text-violet-600 underline"
        >
          Back to store
        </Link>
      </div>
    );
  }

  const { order, delivery } = data;
  const access = data.access;
  const amount = Number(order.amount) || 0;
  const currency = order.currency || "INR";
  const amountDisplay =
    currency === "INR"
      ? `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${currency} ${amount.toFixed(2)}`;
  const tokenStatus = access?.token_status || "active";
  const isExpired = tokenStatus === "expired" || tokenStatus === "revoked";
  const isLimitReached = tokenStatus === "limit_reached";
  const remaining = Number(access?.remaining_downloads || 0);
  const productTitle = order.product_title || "Product";

  return (
    <div className="min-h-screen bg-[#fafbff] pb-28">
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,.06)]">
          {isExpired ? (
            <TokenExpiredView username={username} />
          ) : (
            <>
              <CheckCircleIcon />
              <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900">
                You&apos;re all set{order.buyer_name ? `, ${order.buyer_name}` : ""}!
              </h1>
              <p className="mt-2 text-center text-sm text-slate-500">
                Your access is ready. We also sent details to{" "}
                <span className="font-semibold">{order.buyer_email || "your email"}</span>.
              </p>

              <div className="mt-8 overflow-hidden rounded-xl bg-slate-50">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Order summary
                  </p>
                </div>
                <div className="space-y-2 px-4 py-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-slate-900">
                      {productTitle}
                    </span>
                    <span className="shrink-0 font-bold text-slate-900">
                      {amountDisplay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
                    <span>Order #{order.id.slice(0, 8)}</span>
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  {order.buyer_email && (
                    <p className="text-xs text-slate-500">
                      {order.buyer_email}
                    </p>
                  )}
                </div>
              </div>

              {isLimitReached ? (
                <div className="mt-8">
                  <LimitReachedView />
                </div>
              ) : (
                <div className="mt-8">
                  <button
                    type="button"
                    disabled={downloadLoading}
                    onClick={() => void handleDownload()}
                    className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
                    style={{ backgroundColor: PURPLE }}
                  >
                    {downloadLoading ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Preparing your file...
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="h-5 w-5" />
                        Download Now
                      </>
                    )}
                  </button>
                  <p className="mt-3 text-center text-xs text-slate-500">
                    {remaining} downloads remaining
                  </p>
                  <p className="mt-1 text-center text-xs text-slate-400">
                    Link expires at {new Date(access.expires_at).toLocaleString()}
                  </p>
                  {downloadError ? (
                    <p className="mt-2 text-center text-xs text-rose-600">
                      {downloadError}
                    </p>
                  ) : null}
                </div>
              )}

              <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-600">Want to access this anytime?</p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href="/auth/signup"
                    className="rounded-full py-3 text-sm font-bold text-white"
                    style={{ backgroundColor: PURPLE }}
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/auth/login"
                    className="text-sm font-semibold text-violet-600 underline"
                  >
                    Already have one? Log in
                  </Link>
                </div>
              </div>
            </>
          )}

          <Link
            href={username ? `/${encodeURIComponent(username)}` : "/"}
            className="mt-8 block text-center text-sm font-semibold text-violet-600 underline underline-offset-2"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
