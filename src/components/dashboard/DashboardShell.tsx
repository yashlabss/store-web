"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  IconArrowUpRight,
  IconBag,
  IconChart,
  IconClose,
  IconCopy,
  IconGear,
  IconHeart,
  IconHome,
  IconMenu,
  IconPlane,
  IconPlusSm,
  IconSparkle,
  IconStoreTab,
  IconWallet,
} from "./dashboardIcons";

const PURPLE = "#6b46ff";
export const SIDEBAR_BG = "#f3f4fd";

export type NavContext = "store-home" | "add-product" | "income";

type NavItem = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  href: string;
  active?: boolean;
  useLink?: boolean;
};

function navItems(ctx: NavContext): NavItem[] {
  const storeActive = ctx === "store-home" || ctx === "add-product";
  const incomeActive = ctx === "income";
  return [
    { id: "home", label: "Home", Icon: IconHome, href: "/", useLink: true },
    {
      id: "store",
      label: "My Store",
      Icon: IconBag,
      href: "/dashboard",
      active: storeActive,
      useLink: true,
    },
    {
      id: "income",
      label: "Income",
      Icon: IconWallet,
      href: "/dashboard/income",
      active: incomeActive,
      useLink: true,
    },
    { id: "analytics", label: "Analytics", Icon: IconChart, href: "#" },
    { id: "customers", label: "Customers", Icon: IconHeart, href: "#" },
    { id: "autodm", label: "AutoDM", Icon: IconPlane, href: "#" },
    { id: "more", label: "More", Icon: IconPlusSm, href: "#" },
  ];
}

function LogoMark() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-sm"
      style={{ backgroundColor: PURPLE }}
    >
      $
    </div>
  );
}

type DashboardShellProps = {
  displayName: string;
  handle: string;
  showName: string;
  onSignOut: () => void;
  /** Top-left header area (title, breadcrumbs). */
  topLeft: React.ReactNode;
  /** Main scrollable column below the header row. */
  children: React.ReactNode;
  /** Optional right column (store phone preview or product live preview). */
  preview?: React.ReactNode;
  navContext: NavContext;
};

export default function DashboardShell({
  displayName,
  handle,
  showName,
  onSignOut,
  topLeft,
  children,
  preview,
  navContext,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const storeUrl = `yash.store/${handle}`;
  const fullUrl = `https://${storeUrl}`;

  const copyStoreUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [fullUrl]);

  const closeMobileNav = () => setMobileNavOpen(false);

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
      active
        ? "bg-white text-[#1e1648] shadow-sm"
        : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
    }`;

  const NAV = navItems(navContext);

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2.5 px-3 pt-2 lg:pt-0">
        <LogoMark />
        <span className="text-[1.35rem] font-bold tracking-tight text-[#1e1648]">Yash</span>
      </div>

      <nav className="mt-6 flex flex-col gap-0.5 px-2 lg:mt-8" aria-label="Main">
        {NAV.map((item) => {
          const active = Boolean(item.active);
          const content = (
            <>
              <item.Icon
                className={`shrink-0 ${active ? "text-[#6b46ff]" : "text-slate-500"}`}
              />
              {item.label}
            </>
          );
          const className = navLinkClass(active);
          return item.useLink ? (
            <Link key={item.id} href={item.href} className={className} onClick={closeMobileNav}>
              {content}
            </Link>
          ) : (
            <a key={item.id} href={item.href} className={className} onClick={closeMobileNav}>
              {content}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-slate-200/80 pt-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium text-slate-600 hover:bg-white/60"
          onClick={closeMobileNav}
        >
          <IconGear className="shrink-0 text-slate-500" />
          Settings
        </a>
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[#5b8ac4]"
            style={{ backgroundColor: "#dbeafe" }}
            aria-hidden
          >
            {showName.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <span className="truncate text-[15px] font-semibold text-[#1e1648]">{showName}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            closeMobileNav();
            onSignOut();
          }}
          className="px-3 pb-2 text-left text-[13px] font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white">
      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 lg:hidden"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-50"
          aria-label="Open menu"
        >
          <IconMenu />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <LogoMark />
          <span className="text-lg font-bold text-[#1e1648]">Yash</span>
        </div>
        <div className="w-11 shrink-0" aria-hidden />
      </header>

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close menu"
          onClick={closeMobileNav}
        />
      ) : null}

      <div className="flex min-h-[calc(100dvh-57px)] flex-col lg:min-h-screen lg:flex-row">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(280px,88vw)] flex-col overflow-y-auto border-r border-slate-100/80 px-3 pb-6 pt-3 transition-transform duration-200 ease-out lg:static lg:z-auto lg:min-h-screen lg:w-[248px] lg:shrink-0 lg:translate-x-0 lg:overflow-visible lg:px-4 lg:pb-8 lg:pt-8 lg:shadow-none ${
            mobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
          style={{ backgroundColor: SIDEBAR_BG }}
        >
          <div className="mb-3 flex shrink-0 items-center justify-end lg:hidden">
            <button
              type="button"
              onClick={closeMobileNav}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-white/70"
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          </div>
          {sidebarContent}
        </aside>

        <div className="flex min-h-0 flex-1 flex-col lg:min-w-0 lg:flex-row">
          <main
            className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8 [scrollbar-gutter:stable]"
          >
            <div className="mx-auto max-w-[720px]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">{topLeft}</div>
                <div className="flex min-w-0 items-center gap-2 sm:max-w-[50%] sm:justify-end sm:pt-1">
                  <span className="truncate text-sm font-medium text-slate-600">{storeUrl}</span>
                  <button
                    type="button"
                    onClick={() => void copyStoreUrl()}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <IconCopy className="text-slate-500" />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {children}
            </div>
          </main>

          {preview ? (
            <aside
              className="shrink-0 border-t border-slate-100 bg-[#fafbff] px-4 py-8 lg:w-[min(380px,38vw)] lg:border-l lg:border-t-0 lg:bg-white lg:py-10 lg:pl-6 lg:pr-8"
              aria-label="Preview"
            >
              {preview}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { LogoMark, PURPLE };
export { IconArrowUpRight, IconSparkle, IconStoreTab };
