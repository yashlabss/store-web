import Link from "next/link";
import MarketingSiteChrome from "@/components/marketing/MarketingSiteChrome";
import { MARKETING_SITE_NAME } from "@/components/marketing/constants";

export default function HomePage() {
  return (
    <MarketingSiteChrome>
      <div className="mx-auto max-w-3xl text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          The simple way to sell digital work online
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1f2a44] sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          Turn your expertise into income—one beautiful store link
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          {MARKETING_SITE_NAME} is your branded storefront: share a single link, showcase ebooks, guides, PDFs,
          video courses, and audio—set your prices, and let checkout handle the rest. Buyers get what they paid for
          automatically, so you spend less time chasing payments and more time creating.
        </p>
        <p className="mt-3 text-base font-medium text-[#1f2a44]/90">
          Built for coaches, authors, educators, and creators who sell digital goods—not physical shipping (yet).
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start">
          <Link
            href="/signup"
            className="rounded-full bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500"
          >
            Launch your store
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-[#e7dcc9] bg-white px-6 py-3 text-center text-sm font-semibold text-[#1f2a44] shadow-sm transition hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "A store that feels like you",
              desc: "Your logo, your story, your URL—fans land on a polished page that looks like your brand, not a generic checkout.",
            },
            {
              title: "Every format your audience loves",
              desc: "Ship PDFs and ebooks, host video lessons, drop audio guides, or bundle files—everything stays tied to the sale.",
            },
            {
              title: "From “DM me for payment” to done",
              desc: "Collect payment, deliver access, and send receipts in one flow—so launch day feels exciting, not exhausting.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#e7dcc9] bg-white p-5 text-left shadow-sm transition hover:border-indigo-200/80 hover:shadow-md"
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
