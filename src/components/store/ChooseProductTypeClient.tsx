"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PURPLE } from "../dashboard/DashboardShell";

type Props = {
  displayName?: string;
  handle?: string;
  showName?: string;
  onSignOut?: () => void;
};

type ProductTypeCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  /** Softer icon background */
  iconBg: string;
  iconColor: string;
  icon: ReactNode;
};

function CardIconDigital() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardIconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
    </svg>
  );
}

function CardIconCourse() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7h8M8 11h6" strokeLinecap="round" />
    </svg>
  );
}

function CardIconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
    </svg>
  );
}

const CARDS: ProductTypeCard[] = [
  {
    id: "digital",
    title: "Digital Products",
    description: "Templates, ebooks, files, and downloads your customers receive instantly.",
    href: "/dashboard/store/product/new",
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    icon: <CardIconDigital />,
  },
  {
    id: "coaching",
    title: "Coaching Call",
    description: "Sell 1:1 sessions with scheduling and reminders (coming soon).",
    href: "/dashboard/store/product/placeholder/coaching",
    iconBg: "#fce7f3",
    iconColor: "#db2777",
    icon: <CardIconCalendar />,
  },
  {
    id: "course",
    title: "Online Course",
    description: "Modules, lessons, and progress tracking for students (coming soon).",
    href: "/dashboard/store/product/placeholder/course",
    iconBg: "#e0e7ff",
    iconColor: "#4f46e5",
    icon: <CardIconCourse />,
  },
  {
    id: "community",
    title: "Community",
    description: "Paid groups, forums, and member spaces (coming soon).",
    href: "/dashboard/store/product/placeholder/community",
    iconBg: "#d1fae5",
    iconColor: "#059669",
    icon: <CardIconUsers />,
  },
];

export default function ChooseProductTypeClient({
}: Props) {
  return (
    <div className="mx-auto max-w-[920px]">
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          What are you selling?
        </h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
          Pick a product type. Digital products use the full editor; other types open a preview screen until those
          flows ship.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {CARDS.map((c) => {
            const isDigital = c.id === "digital";
            return (
              <li key={c.id}>
                <Link
                  href={c.href}
                  className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md ${
                    isDigital ? "border-[#c4b5fd] ring-1 ring-[#ede9fe]" : "border-slate-100"
                  }`}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: c.iconBg, color: c.iconColor }}
                  >
                    {c.icon}
                  </div>
                  <p className="mt-4 text-[17px] font-bold text-slate-900">{c.title}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{c.description}</p>
                  <span
                    className="mt-4 inline-flex items-center text-sm font-semibold"
                    style={{ color: PURPLE }}
                  >
                    {isDigital ? "Continue" : "View preview"}
                    <span className="ml-1" aria-hidden>
                      →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
