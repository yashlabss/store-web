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

const PURPLE = "#1f2a44";
export const SIDEBAR_BG = "#f3f0ea";

export type NavContext = "home" | "store-home" | "add-product" | "income";

type NavItem = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  href: string;
  active?: boolean;
  useLink?: boolean;
};

function navItems(ctx: NavContext): NavItem[] {
  const homeActive = ctx === "home";
  const storeActive = ctx === "store-home" || ctx === "add-product";
  const incomeActive = ctx === "income";
  return [
    { id: "home", label: "Home", Icon: IconHome, href: "/dashboard/home", active: homeActive, useLink: true },
    {
      id: "store",
      label: "My Store",
      Icon: IconBag,
      href: "/dashboard",
      active: storeActive,
      useLink: true,
    },
    // {
    //   id: "income",
    //   label: "Income",
    //   Icon: IconWallet,
    //   href: "/dashboard/income",
    //   active: incomeActive,
    //   useLink: true,
    // },
    // { id: "analytics", label: "Analytics", Icon: IconChart, href: "#" },
    // { id: "customers", label: "Customers", Icon: IconHeart, href: "#" },
    // { id: "autodm", label: "AutoDM", Icon: IconPlane, href: "#" },
    // { id: "more", label: "More", Icon: IconPlusSm, href: "#" },
  ];
}

function LogoMark() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-sm"
      style={{ backgroundColor: PURPLE }}
    >
      M
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

  const storeUrl = `mintlin.com/${handle}`;
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
        ? "bg-white text-[#1f2a44] shadow-sm ring-1 ring-[#e7dcc9]"
        : "text-slate-600 hover:bg-white/70 hover:text-[#1f2a44]"
    }`;

  const NAV = navItems(navContext);

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2.5 px-3 pt-2 lg:pt-0">
        <LogoMark />
        <span className="text-[1.35rem] font-bold tracking-tight text-[#1f2a44]">Mintlin</span>
      </div>

      <nav className="mt-6 flex flex-col gap-0.5 px-2 lg:mt-8" aria-label="Main">
        {NAV.map((item) => {
          const active = Boolean(item.active);
          const content = (
            <>
              <item.Icon
                className={`shrink-0 ${active ? "text-[#1f2a44]" : "text-slate-500"}`}
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

      <div className="mt-auto flex flex-col gap-1 border-t border-[#e7dcc9]/80 pt-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium text-slate-600 hover:bg-white/70"
          onClick={closeMobileNav}
        >
          <IconGear className="shrink-0 text-[#b08d57]" />
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
          <span className="truncate text-[15px] font-semibold text-[#1f2a44]">{showName}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            closeMobileNav();
            onSignOut();
          }}
          className="px-3 pb-2 text-left text-[13px] font-medium text-slate-500 underline-offset-2 hover:text-[#1f2a44] hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#faf8f4] via-white to-white">
      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#e7dcc9] bg-white/95 px-4 py-3 backdrop-blur lg:hidden"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-[#f7f1e6]"
          aria-label="Open menu"
        >
          <IconMenu />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <LogoMark />
          <span className="text-lg font-bold text-[#1f2a44]">Mintlin</span>
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
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(280px,88vw)] flex-col overflow-y-auto border-r border-[#e7dcc9]/80 px-3 pb-6 pt-3 transition-transform duration-200 ease-out lg:static lg:z-auto lg:min-h-screen lg:w-[248px] lg:shrink-0 lg:translate-x-0 lg:overflow-visible lg:px-4 lg:pb-8 lg:pt-8 lg:shadow-none ${
            mobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
          style={{ backgroundColor: SIDEBAR_BG }}
        >
          <div className="mb-3 flex shrink-0 items-center justify-end lg:hidden">
            <button
              type="button"
              onClick={closeMobileNav}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-white/80"
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          </div>
          {sidebarContent}
        </aside>

        <div className="flex min-h-0 flex-1 flex-col lg:min-w-0">
          <div className="flex w-full items-center justify-between gap-3 border-b border-[#e7dcc9] px-5 py-3 lg:px-8">
            <div className="min-w-0 flex-1">{topLeft}</div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <span className="text-sm font-medium text-[#1f2a44]">{storeUrl}</span>
              <button
                type="button"
                onClick={() => void copyStoreUrl()}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e7dcc9] bg-white px-2 py-1.5 text-xs font-semibold text-[#1f2a44] hover:bg-[#f7f1e6]"
              >
                <IconCopy className="text-[#b08d57]" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <main
              className={`min-w-0 flex-1 overflow-y-auto px-5 py-6 lg:py-8 [scrollbar-gutter:stable] ${
                preview
                  ? "lg:pr-[calc(20rem+clamp(1.75rem,3.5vw,2.75rem)+clamp(1rem,2.5vw,1.75rem))]"
                  : ""
              }`}
            >
              <div className="w-full">{children}</div>
            </main>

            {preview ? (
              <aside
                className="shrink-0 bg-[#f9f8f6] px-4 py-8 lg:fixed lg:right-[clamp(1rem,2.5vw,1.75rem)] lg:top-[5.25rem] lg:z-20 lg:flex lg:max-h-[calc(100dvh-6rem)] lg:w-80 lg:max-w-[min(20rem,calc(100vw-2rem))] lg:flex-col lg:items-center lg:justify-center lg:overflow-y-auto lg:border-0 lg:bg-[#f9f8f6] lg:px-4 lg:py-6 lg:[-ms-overflow-style:none] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden lg:shadow-none"
                aria-label="Preview"
              >
                {preview}
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export { LogoMark, PURPLE };
export { IconArrowUpRight, IconSparkle, IconStoreTab };
