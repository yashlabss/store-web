"use client";

import Link from "next/link";
import DashboardShell, { PURPLE } from "../dashboard/DashboardShell";
import { IconChevronLeft } from "../dashboard/dashboardIcons";

export type PlaceholderSlug = "coaching" | "course" | "community";

const COPY: Record<
  PlaceholderSlug,
  { title: string; tagline: string; bullets: string[] }
> = {
  coaching: {
    title: "Coaching Call",
    tagline: "This product type isn’t wired up yet—here’s what it could look like.",
    bullets: [
      "Calendar sync and buffer times",
      "Automated reminders before the call",
      "Stripe checkout with your hourly rate",
    ],
  },
  course: {
    title: "Online Course",
    tagline: "Placeholder dashboard for a future course builder.",
    bullets: ["Structured modules", "Video hosting hooks", "Student progress"],
  },
  community: {
    title: "Community",
    tagline: "Preview-only stats until memberships go live.",
    bullets: ["Member forums", "Tiered access", "Recurring billing"],
  },
};

type Props = {
  slug: PlaceholderSlug;
  displayName: string;
  handle: string;
  showName: string;
  onSignOut: () => void;
};

function DummyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function PlaceholderProductTypeClient({
  slug,
  displayName,
  handle,
  showName,
  onSignOut,
}: Props) {
  const meta = COPY[slug];

  return (
    <DashboardShell
      displayName={displayName}
      handle={handle}
      showName={showName}
      onSignOut={onSignOut}
      navContext="add-product"
      topLeft={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/store/product/add"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
            aria-label="Back to product types"
          >
            <IconChevronLeft />
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-[15px]">
            <Link href="/dashboard" className="font-medium text-slate-500 hover:text-slate-800">
              My Store
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-slate-900">{meta.title}</span>
          </nav>
        </div>
      }
    >
      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Preview · not live</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{meta.title}</h2>
        <p className="mt-2 text-[15px] text-slate-600">{meta.tagline}</p>

        <ul className="mt-6 space-y-2 text-sm text-slate-600">
          {meta.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-0.5 text-[#6b46ff]" aria-hidden>
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DummyStat label="Revenue (30d)" value="$0.00" />
          <DummyStat label="Bookings" value="0" />
          <DummyStat label="Leads" value="0" />
          <DummyStat label="Conversion" value="—" />
        </div>

        <p className="mt-8 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Dummy data only. When this product type launches, you&apos;ll configure it here like digital products.
        </p>

        <Link
          href="/dashboard/store/product/add"
          className="mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
          style={{ backgroundColor: PURPLE }}
        >
          ← Choose another type
        </Link>
      </div>
    </DashboardShell>
  );
}
