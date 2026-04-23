"use client";

import Link from "next/link";

const TYPES = [
  {
    key: "link-page",
    title: "Link Page",
    description: "A multi-section landing page with CTA buttons and product highlights.",
  },
  {
    key: "lead-magnet",
    title: "Lead Magnet",
    description: "Collect leads with a focused headline, form, and delivery CTA.",
  },
  {
    key: "webinar",
    title: "Webinar",
    description: "Registration-focused landing page for webinar signups.",
  },
];

export default function LandingPageTypeChooser() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Choose Landing Page Type
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Pick a page type to start building your landing page flow.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TYPES.map((type) => (
          <Link
            key={type.key}
            href={`/dashboard/store/page/${encodeURIComponent(type.key)}/create`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <p className="text-lg font-semibold text-slate-900">{type.title}</p>
            <p className="mt-2 text-sm text-slate-500">{type.description}</p>
            <p className="mt-4 text-sm font-semibold text-violet-600">Continue →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
