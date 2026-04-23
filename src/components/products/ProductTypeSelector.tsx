"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_DIGITAL_PRODUCTS_BASE, authFetch } from "../../lib/api";
import { networkErrorMessage } from "../../lib/networkError";

// ─── Product type definitions ────────────────────────────────────────────────

type ProductTypeOption = {
  id: string;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
};

function IconDownload() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function IconCrown() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 20h20M4 20 2 8l5 4 5-6 5 6 5-4-2 12H4z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconBroadcast() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconMagnet() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 15A6 6 0 0 0 18 15V3h-4v12a2 2 0 0 1-4 0V3H6v12z" />
      <line x1="6" y1="3" x2="10" y2="3" />
      <line x1="14" y1="3" x2="18" y2="3" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const PRODUCT_TYPES: ProductTypeOption[] = [
  {
    id: "digital_download",
    title: "Digital Download",
    description: "PDFs, eBooks, templates, files — delivered instantly after purchase.",
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    icon: <IconDownload />,
  },
  {
    id: "course",
    title: "Online Course",
    description: "Video lessons, structured modules, drip content for learners.",
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
    icon: <IconPlay />,
  },
  {
    id: "membership",
    title: "Membership",
    description: "Recurring subscriptions with exclusive access to content or community.",
    iconBg: "#d1fae5",
    iconColor: "#059669",
    icon: <IconCrown />,
  },
  {
    id: "booking",
    title: "Booking / Call",
    description: "1-on-1 calls, group sessions, workshops — schedule and charge.",
    iconBg: "#fef3c7",
    iconColor: "#d97706",
    icon: <IconCalendar />,
  },
  {
    id: "webinar",
    title: "Webinar",
    description: "Live events with registration, reminders, and multiple attendees.",
    iconBg: "#fce7f3",
    iconColor: "#db2777",
    icon: <IconBroadcast />,
  },
  {
    id: "community",
    title: "Community",
    description: "Free or paid community access, member spaces, forums.",
    iconBg: "#cffafe",
    iconColor: "#0891b2",
    icon: <IconUsers />,
  },
  {
    id: "lead_magnet",
    title: "Lead Magnet",
    description: "Collect emails, offer free giveaways, grow your audience.",
    iconBg: "#fef9c3",
    iconColor: "#ca8a04",
    icon: <IconMagnet />,
  },
  {
    id: "custom",
    title: "Custom Product",
    description: "Anything else — manual fulfillment, physical items, services.",
    iconBg: "#f1f5f9",
    iconColor: "#64748b",
    icon: <IconBox />,
  },
  {
    id: "link",
    title: "Link / URL",
    description: "Affiliate links, YouTube, Spotify, or any external destination.",
    iconBg: "#fee2e2",
    iconColor: "#dc2626",
    icon: <IconLink />,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductTypeSelector() {
  const router = useRouter();
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSelect = async (typeId: string) => {
    setCreating(typeId);
    setError("");
    try {
      const res = await authFetch(API_DIGITAL_PRODUCTS_BASE, {
        method: "POST",
        body: JSON.stringify({
          product_type: typeId,
          title: "Untitled",
          status: "draft",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        product?: { id: string };
        message?: string;
      };
      if (!res.ok) throw new Error(data.message || "Could not create product.");
      const newId = data.product?.id;
      if (!newId) throw new Error("No product ID returned.");
      router.push(`/dashboard/products/${newId}`);
    } catch (e) {
      setError(networkErrorMessage(e));
      setCreating(null);
    }
  };

  return (
    <div className="mt-2">
      {/* Back link */}
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to products
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
        What are you selling?
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
        Choose a product type. A new draft will be created and you can fill in the details.
      </p>

      {error ? (
        <p className="mt-4 text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_TYPES.map((pt) => {
          const isCreating = creating === pt.id;
          const isDisabled = creating !== null;

          return (
            <button
              key={pt.id}
              type="button"
              disabled={isDisabled}
              onClick={() => void handleSelect(pt.id)}
              className={`group relative flex flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                isCreating
                  ? "border-violet-400 ring-2 ring-violet-100"
                  : isDisabled
                  ? "cursor-not-allowed opacity-60"
                  : "border-slate-100 hover:border-violet-200 hover:shadow-md"
              }`}
            >
              {/* Icon */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                style={{ backgroundColor: pt.iconBg, color: pt.iconColor }}
              >
                {isCreating ? (
                  <div
                    className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                    style={{ borderColor: pt.iconColor, borderTopColor: "transparent" }}
                  />
                ) : (
                  pt.icon
                )}
              </div>

              {/* Text */}
              <p className="mt-4 text-[15px] font-bold text-slate-900">{pt.title}</p>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
                {pt.description}
              </p>

              {/* Arrow */}
              <span
                className="mt-4 inline-flex items-center text-sm font-semibold transition group-hover:translate-x-0.5"
                style={{ color: "#6b46ff" }}
              >
                {isCreating ? "Creating…" : "Choose"}
                <svg
                  className="ml-1"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
