import type { Metadata } from "next";
import Link from "next/link";
import MarketingSiteChrome from "@/components/marketing/MarketingSiteChrome";
import { MARKETING_SITE_NAME, SUPPORT_EMAIL } from "@/components/marketing/constants";

export const metadata: Metadata = {
  title: `Documentation — ${MARKETING_SITE_NAME}`,
  description: `How to run your creator storefront and sell digital products on ${MARKETING_SITE_NAME}.`,
};

export default function DocsPage() {
  return (
    <MarketingSiteChrome>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#1f2a44] sm:text-4xl">Documentation</h1>
        <p className="mt-4 text-lg text-slate-600">
          {MARKETING_SITE_NAME} is a creator storefront: one place to list digital products, take payments, and
          deliver what buyers purchased. This guide covers the basics of running your shop—plus optional
          integrations when you host live sessions or meetings.
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
                Storefront &amp; digital products
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
              <a href="#integrations" className="hover:underline">
                Optional integrations (live &amp; meetings)
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
              Open the <strong className="font-semibold text-slate-800">dashboard</strong> to set up your store
              profile, branding, and how buyers find you.
            </li>
            <li>
              Add a <strong className="font-semibold text-slate-800">digital product</strong>—for example a
              download, template pack, course access, or a ticket-style offer for a live session.
            </li>
            <li>
              Publish when you’re ready, then share your store or product link the same way you would with any
              link-in-bio shop.
            </li>
          </ol>
        </section>

        <section id="store-products" className="mt-12 scroll-mt-24">
          <h2 className="text-xl font-bold text-[#1f2a44]">Storefront &amp; digital products</h2>
          <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
            <p>
              Your storefront is the home for what you sell. Today {MARKETING_SITE_NAME} is focused on{" "}
              <strong className="font-semibold text-slate-800">digital products</strong>—paid offers that don’t
              require you to ship physical goods.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Use the product editor to set title, description, price, and what the buyer receives (files,
                access instructions, or flows tied to your product type).
              </li>
              <li>
                For offers that include a <strong className="font-semibold text-slate-800">scheduled session</strong>
                , configure dates, time zones, and how join details are communicated after purchase.
              </li>
              <li>
                Preview your store from the buyer’s perspective before you promote it widely.
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
              store; you manage payouts and tax obligations according to your agreement with the platform and
              applicable law.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Ensure your payout and business details are complete in dashboard settings where offered.</li>
              <li>Test a small purchase in a safe environment before a big launch.</li>
            </ul>
          </div>
        </section>

        <section id="delivery" className="mt-12 scroll-mt-24">
          <h2 className="text-xl font-bold text-[#1f2a44]">Delivery &amp; buyer emails</h2>
          <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
            <p>
              After a successful purchase, buyers should receive confirmation and any delivery details you
              configure—download links, access instructions, or join information for live offers.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Customize confirmation or reminder copy in the product or email settings when available.</li>
              <li>Ask buyers to check spam folders if they don’t see messages within a few minutes.</li>
            </ul>
          </div>
        </section>

        <section id="integrations" className="mt-12 scroll-mt-24">
          <h2 className="text-xl font-bold text-[#1f2a44]">Optional integrations (live &amp; meetings)</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            Not every product needs a meeting link. When your digital offer includes a live session, you can
            connect third-party tools so join links, scheduling, and—where supported—recordings stay tied to the
            purchase.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[#1f2a44]">Zoom (optional)</h3>
          <p className="mt-3 text-slate-700 leading-relaxed">
            If you enable Zoom for a product, connect your host account from{" "}
            <strong className="font-semibold text-slate-800">Account settings</strong> or the product editor,
            then approve access on Zoom’s screen. {MARKETING_SITE_NAME} can then create or attach meetings based
            on your product rules, send join details to buyers, and—where your plan and settings allow—use
            webhooks for attendance or cloud recording completion.
          </p>
          <p className="mt-3 text-slate-700 leading-relaxed">
            <strong className="font-semibold text-slate-800">Permissions:</strong> Zoom shows the exact OAuth
            scopes at connect time. Generally we need access to identify your host account, create or manage
            meetings you’ve opted into, read information needed for join links and order records, and—if you use
            those features—receive event notifications and access recordings you choose to attach to a product.
            Tokens are stored encrypted on our servers, not in the browser.
          </p>
          <p className="mt-3 text-slate-700 leading-relaxed">
            <strong className="font-semibold text-slate-800">Disconnect:</strong> In Account settings, use{" "}
            <strong className="font-semibold text-slate-800">Disconnect Zoom</strong>. You can also revoke the
            app from your Zoom account’s app list for a full removal on Zoom’s side.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[#1f2a44]">Other providers</h3>
          <p className="mt-3 text-slate-700 leading-relaxed">
            Depending on your product type, you may see other meeting or calendar options (for example Google
            Meet). Each has its own connect flow and terms; only connect services you intend to use for that
            product.
          </p>
        </section>

        <section id="troubleshooting" className="mt-12 scroll-mt-24">
          <h2 className="text-xl font-bold text-[#1f2a44]">Troubleshooting</h2>
          <ul className="mt-4 space-y-5">
            <Trouble
              title="Buyers can’t complete checkout"
              body="Confirm the product is published, pricing is set, and your payment connection is active in settings. Retry in a private window; if it persists, contact support with the product URL and approximate time."
            />
            <Trouble
              title="Buyer didn’t receive email or download"
              body="Verify the order succeeded in your dashboard. Check spam, and resend or copy delivery details manually if the product allows. Review email templates and sending toggles for that product."
            />
            <Trouble
              title="Product or store doesn’t look right after editing"
              body="Hard-refresh the page, clear cache, and confirm you saved or published the latest version. Compare dashboard preview vs. public URL."
            />
            <Trouble
              title="Optional: Zoom or meeting integration errors"
              body="Ensure OAuth is configured for your deployment, the redirect URL matches your Zoom app settings, and you’re signed into the correct host account. For meeting-specific issues, confirm the product is set to the right provider (Zoom vs. other) and that automatic creation is enabled where needed."
            />
            <Trouble
              title="Need to change connected meeting accounts"
              body="Disconnect the integration in Account settings, then connect again while signed into the account you want to use. Update any published products that depended on the old connection."
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
