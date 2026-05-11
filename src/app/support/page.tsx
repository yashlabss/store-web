import type { Metadata } from "next";
import MarketingSiteChrome from "@/components/marketing/MarketingSiteChrome";
import SupportContactForm from "@/components/marketing/SupportContactForm";
import { MARKETING_SITE_NAME, SUPPORT_EMAIL } from "@/components/marketing/constants";

export const metadata: Metadata = {
  title: `Support — ${MARKETING_SITE_NAME}`,
  description: `Get help with your ${MARKETING_SITE_NAME} creator storefront and digital products.`,
};

const faqs = [
  {
    q: `What is ${MARKETING_SITE_NAME} for?`,
    a: `${MARKETING_SITE_NAME} is a creator storefront: you list digital products, share your store link, and buyers check out in one place. Today we’re focused on digital goods—downloads, access, and similar offers—rather than physical shipping.`,
  },
  {
    q: "How do I set up my first product?",
    a: `Sign in to the dashboard, open the flow to add a product, and fill in title, price, and what the buyer receives (files, access, or session details). Publish when you’re ready, then test a purchase or preview the buyer experience.`,
  },
  {
    q: "How do payments and payouts work?",
    a: "Checkout runs through our payments partner (typically Stripe). You’ll connect or verify payout details in settings where available. For a specific charge or payout question, email us with the order or transaction context.",
  },
  {
    q: "Can I host live sessions or webinars?",
    a: `Yes, when your product type supports it. You can connect optional tools (such as Zoom or Google Meet) from Account settings or the product editor so join links and scheduling stay with the purchase. Not every product requires a meeting integration.`,
  },
  {
    q: "How do I disconnect an integration or delete my data?",
    a: `Open Account settings, disconnect any linked provider there, and email ${SUPPORT_EMAIL} for broader account or data deletion requests. See our Privacy Policy for retention details.`,
  },
] as const;

export default function SupportPage() {
  return (
    <MarketingSiteChrome>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#1f2a44] sm:text-4xl">Support</h1>
        <p className="mt-4 text-lg text-slate-600">
          We’re here to help with your {MARKETING_SITE_NAME} storefront, digital products, checkout, and optional
          integrations.
        </p>

        <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1f2a44]">Contact us</h2>
          <p className="mt-2 text-slate-700">
            Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-indigo-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            anytime, or use the form below to open a draft in your mail app.
          </p>
          <p className="mt-4 text-sm font-medium text-slate-800">
            Response time: we aim to reply to most inquiries within{" "}
            <strong className="font-semibold">one business day</strong> (Monday–Friday, excluding U.S.
            holidays). Complex issues may take longer; we’ll keep you updated.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-[#1f2a44]">Send a message</h2>
          <p className="mt-2 text-slate-600">
            Include as much detail as you can (store URL, product name, screenshots) so we can resolve your request
            faster.
          </p>
          <div className="mt-6">
            <SupportContactForm />
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-xl font-bold text-[#1f2a44]">Frequently asked questions</h2>
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
