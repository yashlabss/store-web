"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import DashboardShell, { PURPLE } from "../dashboard/DashboardShell";
import { IconChevronLeft } from "../dashboard/dashboardIcons";

type Props = {
  displayName: string;
  handle: string;
  showName: string;
  onSignOut: () => void;
  mode?: "product" | "landing";
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
/** Landing-page editor lives at its own URL, kept separate from the store product editor. */
const NEW_LANDING = "/dashboard/store/landing/create?kind=landing";

const PRODUCT_CARDS: ProductTypeCard[] = [
  // {
  //   id: "emails",
  //   title: "Email Collections",
  //   description: "Grow your audience by collecting leads, signups, and applications.",
  //   href: "/dashboard/store/product/emails",
  //   iconBg: "#fef3c7",
  //   iconColor: "#d97706",
  //   icon: <IconEmail />,
  // },
  {
    id: "digital",
    title: "Product Hub",
    description: "Sell ebooks, templates, files, and downloads delivered instantly.",
    href: NEW,
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    icon: <IconDigital />,
  },
  // {
  //   id: "coaching",
  //   title: "Coaching",
  //   description: "Sell 1:1 sessions with built-in scheduling and reminders.",
  //   href: `${NEW}?kind=coaching`,
  //   iconBg: "#fce7f3",
  //   iconColor: "#db2777",
  //   icon: <IconCoaching />,
  // },
  // {
  //   id: "custom",
  //   title: "Custom Product",
  //   description: "Create a one-of-a-kind offer tailored to your audience.",
  //   href: `${NEW}?kind=custom`,
  //   iconBg: "#fdf4ff",
  //   iconColor: "#9333ea",
  //   icon: <IconCustom />,
  // },
  // {
  //   id: "course",
  //   title: "eCourse",
  //   description: "Create, Host, and Sell your Course with Stan.",
  //   href: `${NEW}?kind=course`,
  //   iconBg: "#e0e7ff",
  //   iconColor: "#4f46e5",
  //   icon: <IconCourse />,
  // },
  // {
  //   id: "membership",
  //   title: "Recurring Membership",
  //   description: "Charge recurring subscriptions.",
  //   href: `${NEW}?kind=membership`,
  //   iconBg: "#d1fae5",
  //   iconColor: "#059669",
  //   icon: <IconMembership />,
  // },
  // {
  //   id: "webinar",
  //   title: "Webinar",
  //   description: "Host exclusive coaching sessions or online events with multiple customers.",
  //   href: `${NEW}?kind=webinar`,
  //   iconBg: "#fff7ed",
  //   iconColor: "#ea580c",
  //   icon: <IconWebinar />,
  // },
  // {
  //   id: "community",
  //   title: "Community",
  //   description: "Host a free or paid community.",
  //   href: `${NEW}?kind=community`,
  //   iconBg: "#ecfdf5",
  //   iconColor: "#10b981",
  //   icon: <IconCommunity />,
  // },
  // {
  //   id: "url",
  //   title: "URL / Media",
  //   description: "Link to website, affiliate links, or embed media like YouTube and Spotify.",
  //   href: `${NEW}?kind=url-media`,
  //   iconBg: "#f0f9ff",
  //   iconColor: "#0284c7",
  //   icon: <IconUrl />,
  // },
  // {
  //   id: "affiliate",
  //   title: "Stan Affiliate Link",
  //   description: "Refer a friend and receive a percentage of their Stan subscription each month.",
  //   href: `${NEW}?kind=affiliate`,
  //   iconBg: "#fff1f2",
  //   iconColor: "#e11d48",
  //   icon: <IconAffiliate />,
  // },
];

/** Landing pages: Product Hub only (same destination as store Product Hub). */
const LANDING_CARDS: ProductTypeCard[] = [
  {
    id: "product-hub",
    title: "Product Hub",
    description: "PDFs, Guides, Templates, Exclusive Content, eBooks, etc.",
    href: NEW_LANDING,
    iconBg: "#ecfeff",
    iconColor: "#0e7490",
    icon: <IconDigital />,
  },
];

export default function ChooseProductTypeClient({
  displayName,
  handle,
  showName,
  onSignOut,
  mode = "product",
}: Props) {
  const isLanding = mode === "landing";
  const cards = isLanding ? LANDING_CARDS : PRODUCT_CARDS;

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
            href="/dashboard"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
            aria-label="Back to My Store"
          >
            <IconChevronLeft />
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-[15px]">
            <Link href="/dashboard" className="font-medium text-slate-500 hover:text-slate-800">
              My Store
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-slate-900">
              {isLanding ? "Add a landing page" : "Add a new product"}
            </span>
          </nav>
        </div>
      }
    >
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {isLanding ? "Product Hub" : "Choose Product type"}
        </h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
          {isLanding
            ? "Sell guides, templates, and digital downloads from your landing page."
            : "Pick the format that best fits what you&apos;re selling - guides, courses, coaching, or more!"}
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

        <ul
          className={`mt-8 grid w-full gap-4 ${
            isLanding && cards.length === 1 ? "grid-cols-1 sm:max-w-md" : "grid-cols-2"
          }`}
        >
          {cards.map((c) => (
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
    </DashboardShell>
  );
}
