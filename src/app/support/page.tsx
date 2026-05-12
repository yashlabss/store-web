import type { Metadata } from "next";
import MarketingSiteChrome from "@/components/marketing/MarketingSiteChrome";
import SupportContactForm from "@/components/marketing/SupportContactForm";
import { MARKETING_SITE_NAME, SUPPORT_EMAIL } from "@/components/marketing/constants";

export const metadata: Metadata = {
  title: `Support — ${MARKETING_SITE_NAME}`,
  description: `Real help for ${MARKETING_SITE_NAME} creators—storefront, checkout, and digital delivery.`,
};

const faqs = [
  {
    q: `Why do creators choose ${MARKETING_SITE_NAME}?`,
    a: `You get your own storefront—not a buried listing on someone else’s marketplace. Sell PDFs, ebooks, video, and audio, share one link with your audience, and let checkout + delivery handle the busywork while you focus on what you make best.`,
  },
  {
    q: "How fast can I go live with my first product?",
    a: `Sign in, open the dashboard, and add a product in minutes: name it, price it, attach or link your files, and hit publish. We always recommend a quick test purchase so you see exactly what your buyers will experience.`,
  },
  {
    q: "How do I get paid?",
    a: "Checkout runs through a trusted payments partner (typically Stripe). Complete your payout details in settings, then you’re ready to accept real orders. For a specific payout or charge question, email us with your order or transaction info.",
  },
  {
    q: "My buyer didn’t get their download—what’s the fastest fix?",
    a: "Open your dashboard to confirm the order went through, double-check delivery links and email toggles on the product, and have them peek at spam. Still stuck? Email us with the order ID—we’ll help you get them unblocked.",
  },
  {
    q: "How do I close my account or delete my data?",
    a: `Email ${SUPPORT_EMAIL} from the email on your account when you can. Our Privacy Policy explains what we keep and why.`,
  },
] as const;

export default function SupportPage() {
  return (
    <MarketingSiteChrome>
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">We’ve got you</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2a44] sm:text-4xl">
          Support that keeps your launch on track
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Questions about your storefront, checkout, or getting files to buyers? Reach out—we love helping creators
          ship with confidence on {MARKETING_SITE_NAME}.
        </p>

        <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 to-white p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1f2a44]">Talk to a human</h2>
          <p className="mt-2 text-slate-700 leading-relaxed">
            Drop us a line at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-indigo-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            or use the form below—we read every message.
          </p>
          <p className="mt-4 text-sm font-medium text-slate-800">
            Most replies land within{" "}
            <strong className="font-semibold text-[#1f2a44]">one business day</strong> (Mon–Fri, U.S. holidays
            excluded). Bigger issues might need a little longer—we’ll always keep you posted.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-[#1f2a44]">Send a message</h2>
          <p className="mt-2 text-slate-600 leading-relaxed">
            The more context you share—your store link, product name, screenshots—the faster we can solve it.
          </p>
          <div className="mt-6">
            <SupportContactForm />
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-xl font-bold text-[#1f2a44]">Questions we hear a lot</h2>
          <ul className="mt-6 space-y-6">
            {faqs.map((item) => (
              <li
                key={item.q}
                className="rounded-2xl border border-[#e7dcc9] bg-white p-5 shadow-sm sm:p-6"
              >
                <h3 className="font-semibold text-[#1f2a44]">{item.q}</h3>
                <p className="mt-2 text-slate-700 leading-relaxed">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MarketingSiteChrome>
  );
}
