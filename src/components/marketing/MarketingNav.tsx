"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const navLinkClass =
  "text-[15px] font-medium text-slate-600 transition-colors hover:text-[#1f2a44] py-1";

const navItems = [
  { href: "/docs", label: "Docs" },
  { href: "/support", label: "Support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export default function MarketingNav() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-[#e7dcc9] bg-white px-3 py-2 text-slate-700 shadow-sm md:hidden"
        aria-expanded={open}
        aria-controls="marketing-nav-mobile"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <nav
        className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 md:flex"
        aria-label="Site"
      >
        {navItems.map(({ href, label }) => (
          <Link key={href} href={href} className={navLinkClass}>
            {label}
          </Link>
        ))}
        <Link
          href="/auth/login"
          className="rounded-full bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Sign in
        </Link>
      </nav>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            aria-label="Close menu"
            onClick={close}
          />
          <div
            id="marketing-nav-mobile"
            className="fixed right-0 top-0 z-50 flex h-full w-[min(100%,20rem)] flex-col gap-1 border-l border-[#e7dcc9] bg-white p-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-xl md:hidden"
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Menu</div>
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${navLinkClass} rounded-lg px-2`}
                onClick={close}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="mt-3 rounded-full bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500"
              onClick={close}
            >
              Sign in
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}
