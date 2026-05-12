import type { Metadata } from "next";
import Link from "next/link";
import MarketingSiteChrome from "@/components/marketing/MarketingSiteChrome";
import { MARKETING_SITE_NAME, SUPPORT_EMAIL } from "@/components/marketing/constants";

export const metadata: Metadata = {
  title: `Documentation — ${MARKETING_SITE_NAME}`,
  description: `Your playbook for launching on ${MARKETING_SITE_NAME}—storefront, digital products, and happy buyers.`,
};

export default function DocsPage() {
  return (
    <MarketingSiteChrome>
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Creator playbook</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2a44] sm:text-4xl">Documentation</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Ready to welcome your first paying customer? This guide walks you through launching on {MARKETING_SITE_NAME}
          —your own storefront for{" "}
          <strong className="font-semibold text-slate-800">digital products</strong> (PDFs, ebooks, video, and audio),
          smooth checkout, and delivery that makes buyers feel taken care of.
        </p>

        <nav
          className="mt-8 rounded-2xl border border-[#e7dcc9] bg-white p-5 text-sm shadow-sm"
          aria-label="On this page"
        >
          <p className="font-semibold text-[#1f2a44]">On this page</p>
          <ul className="mt-3 space-y-2 text-indigo-600">
            <li>
              <a href="#getting-started" className="hover:underline">
                Getting started
              </a>
            </li>
            <li>
              <a href="#store-products" className="hover:underline">
                Your storefront &amp; product types
              </a>
            </li>
            <li>
              <a href="#payments" className="hover:underline">
                Checkout &amp; payments
              </a>
            </li>
            <li>
              <a href="#delivery" className="hover:underline">
                Delivery &amp; buyer emails
              </a>
            </li>
            <li>
              <a href="#troubleshooting" className="hover:underline">
                Troubleshooting
              </a>
            </li>
          </ul>
        </nav>

        <section id="getting-started" className="mt-12 scroll-mt-24">
          <h2 className="text-xl font-bold text-[#1f2a44]">Getting started</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700 leading-relaxed">
            <li>
              Create an account or{" "}
              <Link href="/auth/login" className="text-indigo-600 hover:underline">
                sign in
              </Link>
              .
            </li>
            <li>
              Open the <strong className="font-semibold text-slate-800">dashboard</strong> to configure your store:
              how buyers find you, branding, and your product catalog.
            </li>
            <li>
              Add a <strong className="font-semibold text-slate-800">digital product</strong>—upload or link the PDF,
              ebook, video, or audio you are selling, set the price, and describe what the buyer receives after
              checkout.
            </li>
            <li>
              Publish when you’re ready, then share your public store or product link.
            </li>
          </ol>
        </section>

        <section id="store-products" className="mt-12 scroll-mt-24">
          <h2 className="text-xl font-bold text-[#1f2a44]">Your storefront &amp; product types</h2>
          <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
            <p>
              Every admin runs their own storefront. Buyers see your products, prices, and checkout on your Mintln
              URL—not a generic marketplace listing someone else controls.
            </p>
            <p>
              Today the product experience is built around{" "}
              <strong className="font-semibold text-slate-800">digital delivery</strong> (files and media you
              provide). We do not sell or ship physical inventory through Mintln.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-semibold text-slate-800">PDFs &amp; ebooks:</strong> attach or link the
                document buyers should download after purchase.
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Video &amp; audio:</strong> follow the product
                editor’s flow for hosted or linked media, and test playback from the buyer thank-you or access page.
              </li>
              <li>
                Preview your public store before you promote it so copy, pricing, and delivery settings look right.
              </li>
            </ul>
          </div>
        </section>

        <section id="payments" className="mt-12 scroll-mt-24">
          <h2 className="text-xl font-bold text-[#1f2a44]">Checkout &amp; payments</h2>
          <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
            <p>
              Purchases are processed through our payments partner (typically{" "}
              <strong className="font-semibold text-slate-800">Stripe</strong>). Buyers complete checkout on your
              store; you handle payout and tax setup according to your agreement with the platform and applicable law.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Complete payout and business details in dashboard settings where offered.</li>
              <li>Run a small test purchase before a major launch.</li>
            </ul>
          </div>
        </section>

        <section id="delivery" className="mt-12 scroll-mt-24">
          <h2 className="text-xl font-bold text-[#1f2a44]">Delivery &amp; buyer emails</h2>
          <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
            <p>
              After payment succeeds, buyers should get confirmation plus whatever access you configured—download
              links, file attachments, or instructions to stream video or audio.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Customize confirmation copy in product or email settings when those controls exist.</li>
              <li>Ask buyers to check spam if nothing arrives within a few minutes.</li>
              <li>For large video files, confirm upload finished and that the buyer device can play the format you used.</li>
            </ul>
          </div>
        </section>

        <section id="troubleshooting" className="mt-12 scroll-mt-24">
          <h2 className="text-xl font-bold text-[#1f2a44]">Troubleshooting</h2>
          <ul className="mt-4 space-y-5">
            <Trouble
              title="Buyers can’t complete checkout"
              body="Confirm the product is published, pricing is set, and your payment connection is active in settings. Retry in a private window; if it persists, contact support with the product URL and approximate time."
            />
            <Trouble
              title="Buyer didn’t receive the PDF, link, or media access"
              body="Verify the order in your dashboard, check spam, and confirm the product’s delivery fields still point to valid files or URLs. Re-upload or refresh links if a host expired a signed URL."
            />
            <Trouble
              title="Video or audio won’t play for the buyer"
              body="Confirm the file finished processing, the format is widely supported (for example MP4 / AAC), and the buyer is on a stable connection. Test the same link in an incognito window."
            />
            <Trouble
              title="Store still shows old content after you edited"
              body="Hard-refresh, clear cache, and make sure you published the latest version. Compare the dashboard preview with your live public URL."
            />
          </ul>
          <p className="mt-8 text-slate-700">
            Still stuck? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-indigo-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            or visit{" "}
            <Link href="/support" className="text-indigo-600 hover:underline">
              Support
            </Link>
            .
          </p>
        </section>
      </div>
    </MarketingSiteChrome>
  );
}

function Trouble({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-[#e7dcc9] bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-[#1f2a44]">{title}</h3>
      <p className="mt-2 text-slate-700 leading-relaxed">{body}</p>
    </li>
  );
}
