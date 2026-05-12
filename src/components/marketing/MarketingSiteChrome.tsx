import Link from "next/link";
import MarketingNav from "./MarketingNav";
import { MARKETING_SITE_NAME, SITE_DOMAIN, SUPPORT_EMAIL } from "./constants";

const PURPLE = "#1f2a44";
export { MARKETING_SITE_NAME, SUPPORT_EMAIL, SITE_DOMAIN } from "./constants";

function LogoMark() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-sm"
      style={{ backgroundColor: PURPLE }}
      aria-hidden
    >
      M
    </div>
  );
}

export default function MarketingSiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#faf8f4] via-white to-white text-slate-800">
      <header
        className="sticky top-0 z-30 border-b border-[#e7dcc9] bg-white/95 backdrop-blur"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline">
            <LogoMark />
            <span className="text-[1.35rem] font-bold tracking-tight text-[#1f2a44]">
              {MARKETING_SITE_NAME}
            </span>
          </Link>
          <MarketingNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-12">{children}</main>

      <footer className="border-t border-[#e7dcc9] bg-white/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="text-lg font-bold text-[#1f2a44]">{MARKETING_SITE_NAME}</span>
            </div>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              Help your audience go from fan to customer in one click. {MARKETING_SITE_NAME} is the creator-friendly
              way to sell PDFs, ebooks, video, and audio—with checkout and delivery that just work.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-[#1f2a44]">Contact</span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-indigo-600 hover:text-indigo-500 hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            <a
              href={`https://${SITE_DOMAIN}`}
              className="text-slate-600 hover:text-[#1f2a44] hover:underline"
            >
              {SITE_DOMAIN}
            </a>
          </div>
          <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
            <Link href="/docs" className="text-slate-600 hover:text-[#1f2a44] hover:underline">
              Guide
            </Link>
            <Link href="/support" className="text-slate-600 hover:text-[#1f2a44] hover:underline">
              Support
            </Link>
            <Link href="/privacy" className="text-slate-600 hover:text-[#1f2a44] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-600 hover:text-[#1f2a44] hover:underline">
              Terms of Use
            </Link>
          </nav>
        </div>
        <div className="border-t border-[#e7dcc9]/80 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {MARKETING_SITE_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
