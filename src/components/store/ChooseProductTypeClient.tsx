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
  iconBg: string;
  iconColor: string;
  icon: ReactNode;
};

function IconEmail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCoaching() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      <path d="M16 3l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCourse() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconWebinar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" />
      <path d="M10 10l4-2.5v5L10 10z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconUrl() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDigital() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCustom() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMembership() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M17 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" strokeLinecap="round" />
      <path d="M7 23l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" strokeLinecap="round" />
    </svg>
  );
}

function IconCommunity() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
    </svg>
  );
}

function IconAffiliate() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" />
    </svg>
  );
}

// Ordered so they interleave: left[0], right[0], left[1], right[1]... for 2-column grid
const NEW = "/dashboard/store/product/new";

const CARDS: ProductTypeCard[] = [
  {
    id: "emails",
    title: "Collect Emails / Applications",
    description: "Grow your audience by collecting leads, signups, and applications.",
    href: "/dashboard/store/product/emails",
    iconBg: "#fef3c7",
    iconColor: "#d97706",
    icon: <IconEmail />,
  },
  {
    id: "digital",
    title: "Digital Product",
    description: "Sell ebooks, templates, files, and downloads delivered instantly.",
    href: NEW,
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    icon: <IconDigital />,
  },
  {
    id: "coaching",
    title: "Coaching",
    description: "Sell 1:1 sessions with built-in scheduling and reminders.",
    href: NEW,
    iconBg: "#fce7f3",
    iconColor: "#db2777",
    icon: <IconCoaching />,
  },
  {
    id: "custom",
    title: "Custom Product",
    description: "Create a one-of-a-kind offer tailored to your audience.",
    href: NEW,
    iconBg: "#fdf4ff",
    iconColor: "#9333ea",
    icon: <IconCustom />,
  },
  {
    id: "course",
    title: "eCourse",
    description: "Build structured online courses with modules and lessons.",
    href: NEW,
    iconBg: "#e0e7ff",
    iconColor: "#4f46e5",
    icon: <IconCourse />,
  },
  {
    id: "membership",
    title: "Recurring Membership",
    description: "Charge a recurring subscription for exclusive content or access.",
    href: NEW,
    iconBg: "#d1fae5",
    iconColor: "#059669",
    icon: <IconMembership />,
  },
  {
    id: "webinar",
    title: "Webinar",
    description: "Host live or recorded webinar events for your audience.",
    href: NEW,
    iconBg: "#fff7ed",
    iconColor: "#ea580c",
    icon: <IconWebinar />,
  },
  {
    id: "community",
    title: "Community",
    description: "Build a paid community, forum, or member space.",
    href: NEW,
    iconBg: "#ecfdf5",
    iconColor: "#10b981",
    icon: <IconCommunity />,
  },
  {
    id: "url",
    title: "URL / Media",
    description: "Share a URL, video link, or any external media with buyers.",
    href: NEW,
    iconBg: "#f0f9ff",
    iconColor: "#0284c7",
    icon: <IconUrl />,
  },
  {
    id: "affiliate",
    title: "Stan Affiliate Link",
    description: "Earn commissions by promoting products you love.",
    href: NEW,
    iconBg: "#fff1f2",
    iconColor: "#e11d48",
    icon: <IconAffiliate />,
  },
];

export default function ChooseProductTypeClient({
}: Props) {
  return (
    <div className="mx-auto max-w-[920px]">
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Choose Product type
        </h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
          Pick the format that best fits what you&apos;re selling - guides, courses, coaching, or more!
        </p>
        <div className="mt-4">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: PURPLE }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            Get product ideas
          </a>
        </div>

        <ul className="mt-8 grid w-full grid-cols-2 gap-4">
          {CARDS.map((c) => (
            <li key={c.id} className="flex">
              <Link
                href={c.href}
                className="flex w-full items-start gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 hover:shadow-md"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: c.iconBg, color: c.iconColor }}
                >
                  {c.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-slate-900">{c.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">{c.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
