"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_PUBLIC_BASE } from "../../lib/api";

const PURPLE = "#6b46ff";

type Delivery = {
  type: string;
  file_name: string | null;
  redirect_url: string | null;
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
};

export default function ThankYouPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = typeof params?.username === "string" ? params.username : "";
  const orderId = searchParams.get("order");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<OrderPayload | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Missing order. Return to the store and complete a purchase.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const res = await fetch(
          `${API_PUBLIC_BASE}/order/${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Could not load order.");
        if (!cancelled) setData(json as OrderPayload);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

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
        <p className="text-lg font-semibold text-slate-800">{error || "Something went wrong."}</p>
        <Link href={username ? `/${encodeURIComponent(username)}` : "/"} className="mt-6 font-semibold text-violet-600 underline">
          Back to store
        </Link>
      </div>
    );
  }

  const { order, delivery } = data;
  const amount = Number(order.amount) || 0;
  const showRedirect =
    delivery.type === "redirect" && delivery.redirect_url && /^https?:\/\//i.test(delivery.redirect_url);

  return (
    <div className="min-h-screen bg-[#fafbff] pb-28">
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,.06)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl" aria-hidden>
            ✓
          </div>
          <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900">
            You&apos;re in — thank you!
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Your purchase is confirmed. Access your digital product below.
          </p>

          <div className="mt-8 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{order.product_title || "Product"}</p>
            <p className="mt-1">
              {order.currency || "USD"} ${amount.toFixed(2)} ·{" "}
              {order.payment_method === "demo_instant" ? "Instant checkout (demo)" : order.payment_method}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Access</h2>
            {showRedirect ? (
              <a
                href={delivery.redirect_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-95"
                style={{ backgroundColor: PURPLE }}
              >
                Open download link
              </a>
            ) : delivery.file_name ? (
              <p className="mt-2 text-sm text-slate-600">
                Your file: <span className="font-medium text-slate-900">{delivery.file_name}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                The creator will deliver this product according to their settings. Keep this confirmation for your
                records.
              </p>
            )}
            <p className="mt-4 text-xs text-slate-500">
              In production, a receipt email is sent automatically (e.g. from your platform domain). This demo does not
              send email.
            </p>
          </div>

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
