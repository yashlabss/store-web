"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_PUBLIC_BASE } from "../../lib/api";

type ThemePayload = {
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  card_style?: string;
  primary_font?: string;
};

type LandingPayload = {
  store: { username: string; display_name: string };
  page: {
    title: string;
    slug: string;
    data?: { headline?: string; description?: string; cta?: string };
  };
  theme: ThemePayload | null;
};

export default function PublicLandingPage({
  username,
  slug,
}: {
  username: string;
  slug: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<LandingPayload | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    void fetch(
      `${API_PUBLIC_BASE}/landing/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    )
      .then(async (res) => {
        const json = (await res.json().catch(() => ({}))) as LandingPayload & {
          message?: string;
        };
        if (!res.ok) throw new Error(json.message || "Landing page not found.");
        setPayload(json);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Landing page not found."))
      .finally(() => setLoading(false));
  }, [slug, username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!payload || error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <p className="text-lg font-semibold text-slate-900">Landing page not found</p>
        <p className="mt-2 text-sm text-slate-500">{error || "This page may be unpublished."}</p>
        <Link href={`/${encodeURIComponent(username)}`} className="mt-5 text-sm font-semibold text-violet-600">
          Back to store
        </Link>
      </div>
    );
  }

  const headline = payload.page?.data?.headline || payload.page.title;
  const description =
    payload.page?.data?.description || "This is a high-converting landing page for your offer.";
  const cta = payload.page?.data?.cta || "Continue";
  const theme = payload.theme || {};

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{
        backgroundColor: theme.background_color || "#ffffff",
        fontFamily: theme.primary_font || "Inter",
      }}
    >
      <div
        className="mx-auto max-w-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,.08)]"
        style={{ borderRadius: theme.card_style === "sharp" ? 6 : 20 }}
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {payload.store.display_name}
        </p>
        <h1
          className="mt-3 text-4xl font-bold leading-tight"
          style={{ color: theme.secondary_color || "#6b46ff" }}
        >
          {headline}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{description}</p>
        <button
          type="button"
          className="mt-8 rounded-full px-7 py-3.5 text-[15px] font-bold text-white"
          style={{ backgroundColor: theme.primary_color || "#0f766e" }}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}
