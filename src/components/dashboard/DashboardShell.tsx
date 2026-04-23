"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";

// ---------------------------------------------------------------------------
// Brand colour
// ---------------------------------------------------------------------------
export const BRAND = "#6b46ff";
/** Backwards-compat alias */
export const PURPLE = BRAND;
export const SIDEBAR_BG = "#f3f4fd";

// ---------------------------------------------------------------------------
// Inline SVG icons — no external dependency
// ---------------------------------------------------------------------------
function IconBolt({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
export function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}
export function IconBag({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
export function IconWallet({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 4h12M6 9h12M12 9l-4 11M6 4a5 5 0 0 1 5 5H6" />
    </svg>
  );
}
export function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.85" />
    </svg>
  );
}
function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
export function IconGear({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}
function IconUserCircle({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="3" />
      <path d="M5.5 20c1.8-3.5 11.2-3.5 13 0" />
    </svg>
  );
}
export function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
export function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}
export function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconLogOut({ className }: { className?: string }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
// Backwards-compat icon re-exports used by other modules
export function IconArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
export function IconSparkle({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
      <path d="M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export function IconStoreTab({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
      <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
      <path d="M9 14h6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Types — we support BOTH the old prop interface and new prop interface
// ---------------------------------------------------------------------------

/** New interface: used by the dashboard layout wrapper. */
type NewProps = {
  children: React.ReactNode;
  /** If provided, new-style rendering is used. */
  user: { username: string; email: string; full_name: string } | null;
  title?: string;
};

/** Old interface: used by individual pages that manage their own auth. */
export type LegacyProps = {
  children: React.ReactNode;
  displayName: string;
  handle: string;
  showName: string;
  onSignOut: () => void;
  topLeft: React.ReactNode;
  preview?: React.ReactNode;
  navContext: string;
};

export type DashboardShellProps = NewProps | LegacyProps;

/** Narrow to new vs old */
function isNewProps(p: DashboardShellProps): p is NewProps {
  return "user" in p;
}

// ---------------------------------------------------------------------------
// Navigation definition
// ---------------------------------------------------------------------------
type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};
type NavSection = { heading: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Main",
    items: [
      { id: "home",      label: "Home",      href: "/dashboard",           Icon: IconHome    },
      { id: "store",     label: "Store",     href: "/dashboard/store",     Icon: IconBag     },
      { id: "income",    label: "Income",    href: "/dashboard/income",    Icon: IconWallet  },
      { id: "analytics", label: "Analytics", href: "/dashboard/analytics", Icon: IconChart   },
      { id: "audience",  label: "Audience",  href: "/dashboard/audience",  Icon: IconUsers   },
    ],
  },
  {
    heading: "Features",
    items: [
      { id: "flows",        label: "Flows",        href: "/dashboard/flows",        Icon: IconMail     },
      { id: "appointments", label: "Appointments", href: "/dashboard/appointments", Icon: IconCalendar },
      { id: "affiliates",   label: "Affiliates",   href: "/dashboard/affiliates",   Icon: IconLink     },
    ],
  },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { id: "settings", label: "Settings", href: "/dashboard/settings", Icon: IconGear       },
  { id: "profile",  label: "Profile",  href: "/dashboard/profile",  Icon: IconUserCircle },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function resolveDisplayName(
  user: { username?: string; email?: string; full_name?: string } | null,
): string {
  if (!user) return "Creator";
  return (
    user.full_name?.trim() ||
    (user.username
      ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
      : "Creator")
  );
}

// ---------------------------------------------------------------------------
// UserAvatar
// ---------------------------------------------------------------------------
function UserAvatar({ name, size = 34 }: { name: string; size?: number }) {
  const initials =
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";
  return (
    <div
      className="flex shrink-0 select-none items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #6b46ff 0%, #9333ea 100%)",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LogoMark — backwards-compat export used in some child components
// ---------------------------------------------------------------------------
export function LogoMark() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-sm"
      style={{ backgroundColor: BRAND }}
    >
      <IconBolt />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SidebarContent
// ---------------------------------------------------------------------------
function SidebarContent({
  displayName,
  email,
  storeHandle,
  pathname,
  onLinkClick,
  onSignOut,
}: {
  displayName: string;
  email: string;
  storeHandle: string;
  pathname: string;
  onLinkClick: () => void;
  onSignOut: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const storeUrl = `localhost:3001/${storeHandle}`;
  const fullUrl  = `http://${storeUrl}`;

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [fullUrl]);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const navLinkCls = (href: string) =>
    [
      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
      isActive(href)
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
    ].join(" ");

  const navIconCls = (href: string) =>
    isActive(href)
      ? "text-indigo-600"
      : "text-slate-400 transition-colors group-hover:text-slate-600";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo */}
      <div className="shrink-0 px-4 pt-5 pb-3">
        <Link
          href="/dashboard"
          onClick={onLinkClick}
          className="flex items-center gap-2.5 rounded-lg py-0.5 transition-opacity hover:opacity-80"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
            style={{ backgroundColor: BRAND }}
          >
            <IconBolt />
          </div>
          <span className="text-[1rem] font-bold tracking-tight text-slate-900">
            Creator<span style={{ color: BRAND }}>Store</span>
          </span>
        </Link>
      </div>

      {/* Store URL copy pill */}
      <div className="shrink-0 mx-3 mb-4 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-500">{storeUrl}</span>
        <button
          type="button"
          onClick={() => { void copyUrl(); }}
          title={copied ? "Copied!" : "Copy link"}
          aria-label="Copy store URL"
          className="flex shrink-0 items-center justify-center rounded-md p-1 transition hover:bg-white hover:shadow-sm"
        >
          {copied
            ? <IconCheck className="text-emerald-500" />
            : <IconCopy className="text-slate-400" />}
        </button>
      </div>

      {/* Scrollable nav */}
      <nav
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 pb-3"
        aria-label="Main navigation"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {section.heading}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} onClick={onLinkClick} className={navLinkCls(item.href)}>
                    <item.Icon className={navIconCls(item.href)} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Account — pushed to bottom */}
        <div className="mt-auto">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Account
          </p>
          <ul className="flex flex-col gap-0.5">
            {ACCOUNT_ITEMS.map((item) => (
              <li key={item.id}>
                <Link href={item.href} onClick={onLinkClick} className={navLinkCls(item.href)}>
                  <item.Icon className={navIconCls(item.href)} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
          <UserAvatar name={displayName} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-[11px] text-slate-500">{email}</p>
          </div>
          <button
            type="button"
            onClick={() => { onLinkClick(); onSignOut(); }}
            aria-label="Sign out"
            title="Sign out"
            className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <IconLogOut />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardShell — unified export handling both old & new props
// ---------------------------------------------------------------------------
export default function DashboardShell(props: DashboardShellProps) {
  const pathname    = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  // Resolve unified values from either prop shape
  let displayName: string;
  let email: string;
  let storeHandle: string;
  let signOut: () => void;
  let pageTitle: string;
  let mainContent: React.ReactNode;
  let previewPanel: React.ReactNode | undefined;
  let topLeftNode: React.ReactNode | undefined;

  if (isNewProps(props)) {
    displayName  = resolveDisplayName(props.user);
    email        = props.user?.email ?? "";
    storeHandle  = props.user?.username?.trim() || "creator";
    signOut      = () => {
      if (typeof window !== "undefined") localStorage.removeItem("auth_token");
      window.location.href = "/auth/login";
    };
    pageTitle    =
      props.title ??
      (pathname === "/dashboard"
        ? "Home"
        : pathname
            .split("/")
            .filter(Boolean)
            .pop()
            ?.replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Dashboard");
    mainContent  = props.children;
    previewPanel = undefined;
    topLeftNode  = undefined;
  } else {
    displayName  = props.displayName;
    email        = "";
    storeHandle  = props.handle;
    signOut      = props.onSignOut;
    pageTitle    = typeof props.topLeft === "string" ? props.topLeft : "Dashboard";
    mainContent  = props.children;
    previewPanel = props.preview;
    topLeftNode  = props.topLeft;
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">

      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <SidebarContent
          displayName={displayName}
          email={email}
          storeHandle={storeHandle}
          pathname={pathname}
          onLinkClick={closeMobile}
          onSignOut={signOut}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          aria-label="Close menu overlay"
          onClick={closeMobile}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,88vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Close menu"
          className="absolute right-3 top-3.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <IconClose />
        </button>
        <SidebarContent
          displayName={displayName}
          email={email}
          storeHandle={storeHandle}
          pathname={pathname}
          onLinkClick={closeMobile}
          onSignOut={signOut}
        />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">

        {/* Content + header */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header bar */}
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <IconMenu />
            </button>

            {/* Mobile brand */}
            <div className="flex flex-1 items-center gap-2 lg:hidden">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md text-white"
                style={{ backgroundColor: BRAND }}
              >
                <IconBolt />
              </div>
              <span className="text-sm font-bold text-slate-900">
                Creator<span style={{ color: BRAND }}>Store</span>
              </span>
            </div>

            {/* Breadcrumb — desktop */}
            {topLeftNode ? (
              <div className="hidden flex-1 lg:block">{topLeftNode}</div>
            ) : (
              <div className="hidden flex-1 items-center gap-1.5 lg:flex">
                <span className="text-xs text-slate-400">Dashboard</span>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-[13px] font-semibold text-slate-700">{pageTitle}</span>
              </div>
            )}

            {/* Avatar */}
            <div className="flex items-center gap-2">
              <UserAvatar name={displayName} size={30} />
            </div>
          </header>

          {/* Legacy topLeft shown on mobile when using old props */}
          {topLeftNode && (
            <div className="px-4 pt-4 sm:px-6 lg:hidden">{topLeftNode}</div>
          )}

          {/* Page content */}
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8 [scrollbar-gutter:stable]">
            {mainContent}
          </main>
        </div>

        {/* Optional right preview panel (legacy pages) */}
        {previewPanel && (
          <aside
            className="shrink-0 border-t border-slate-100 bg-[#fafbff] px-4 py-8 lg:w-[min(380px,38vw)] lg:border-l lg:border-t-0 lg:bg-white lg:py-10 lg:pl-6 lg:pr-8"
            aria-label="Preview"
          >
            {previewPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
