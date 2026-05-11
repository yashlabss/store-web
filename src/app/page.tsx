import Link from "next/link";
import MarketingSiteChrome from "@/components/marketing/MarketingSiteChrome";
import { MARKETING_SITE_NAME } from "@/components/marketing/constants";

export default function HomePage() {
  return (
    <MarketingSiteChrome>
      <div className="mx-auto max-w-3xl text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Your store for digital products
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1f2a44] sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          Sell what you make—without the spreadsheet chaos
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          {MARKETING_SITE_NAME} is a creator storefront—a link-in-bio shop for your brand: one place to
          list digital products, take payments, and deliver files or access to buyers. Today we’re focused on
          digital goods; when you host live sessions, you can also connect tools like Zoom so webinars, attendance,
          and replays stay tied to the same purchase—not ten different tabs.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start">
          <Link
            href="/signup"
            className="rounded-full bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-[#e7dcc9] bg-white px-6 py-3 text-center text-sm font-semibold text-[#1f2a44] shadow-sm hover:bg-slate-50"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-transparent px-6 py-3 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Dashboard
          </Link>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "One storefront, your voice",
              desc: "A single page for your brand—courses, templates, downloads, tickets—so fans know exactly where to buy.",
            },
            {
              title: "Digital products, front and center",
              desc: "We’re built around what most creators ship first: paid digital offers, clean checkout, and delivery that just works.",
            },
            {
              title: "Live sessions when you need them",
              desc: "Hosting webinars or coaching calls? Optional integrations (like Zoom) can create meetings, track who showed up, and help get replays to the right buyers.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#e7dcc9] bg-white p-5 text-left shadow-sm"
            >
              <h2 className="font-bold text-[#1f2a44]">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingSiteChrome>
  );
}
