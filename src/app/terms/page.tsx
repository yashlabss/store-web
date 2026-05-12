import type { Metadata } from "next";
import MarketingSiteChrome from "@/components/marketing/MarketingSiteChrome";
import { MARKETING_SITE_NAME, SITE_DOMAIN, SUPPORT_EMAIL } from "@/components/marketing/constants";

export const metadata: Metadata = {
  title: `Terms of Use — ${MARKETING_SITE_NAME}`,
  description: `The ground rules for building your business on ${MARKETING_SITE_NAME}.`,
};

const LAST_UPDATED = "May 11, 2026";

export default function TermsPage() {
  return (
    <MarketingSiteChrome>
      <article className="mx-auto max-w-3xl">
        <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2a44] sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          Thanks for building with {MARKETING_SITE_NAME}. These Terms of Use (“Terms”) set clear expectations for
          how you and we work together when you use the Service at{" "}
          <a href={`https://${SITE_DOMAIN}`} className="text-indigo-600 hover:underline">
            {SITE_DOMAIN}
          </a>{" "}
          (including related sites or apps). By using the Service, you agree to these Terms. If you do not agree,
          please don’t use the Service.
        </p>

        <Section title="1. What the Service does">
          <p>
            {MARKETING_SITE_NAME} is built so you can package your knowledge and creativity into products people pay
            for online. It is a creator commerce platform for{" "}
            <strong className="font-semibold text-slate-800">digital product delivery</strong>: you run a storefront,
            list digital goods (for example downloads, templates, or access you define), set pricing, and configure
            how buyers receive what they paid for after checkout. We provide hosting, checkout, and related tools to
            operate that experience.{" "}
            <strong className="font-semibold text-slate-800">
              We do not fulfill physical goods or shipping through the Service today.
            </strong>{" "}
            We may modify, add, or discontinue features with reasonable notice where appropriate.
          </p>
        </Section>

        <Section title="2. Eligibility and accounts">
          <p>
            You must be able to form a binding contract in your jurisdiction to use the Service. You are
            responsible for maintaining the confidentiality of your account credentials and for all activity
            under your account. You must provide accurate registration information and keep it current.
          </p>
        </Section>

        <Section title="3. User responsibilities">
          <p>You agree that you will:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Use the Service only in compliance with these Terms and all applicable laws and regulations.</li>
            <li>
              Comply with the terms, acceptable use policies, and platform rules of any third-party service you
              use with the Service (including payment partners and any optional tools you connect).
            </li>
            <li>
              Not misuse the Service, attempt unauthorized access, interfere with other users, or distribute
              malware or unlawful content.
            </li>
            <li>
              Obtain any required consents from your customers when you collect or process their data in
              connection with your use of the Service.
            </li>
            <li>
              Be solely responsible for the content you publish, the digital products you sell, how you describe
              delivery, and any refunds or support policies you offer your customers.
            </li>
          </ul>
        </Section>

        <Section title="4. Third-party services">
          <p>
            Payments and core infrastructure run through subprocessors (for example payment processors and cloud
            database providers) as described in our Privacy Policy. Optional integrations you enable are subject
            to each provider’s terms and availability. You authorize us to access and use information from connected
            services only as needed for the features you turn on. You can disconnect optional integrations where
            supported; some data may remain as outlined in our Privacy Policy.
          </p>
        </Section>

        <Section title="5. Fees, billing, and refunds">
          <p>
            Paid plans and one-time fees, if any, are described at checkout or in your order. Payments are
            processed by our payment processor (for example, Stripe). You authorize us and our payment
            partners to charge your selected payment method for applicable fees and taxes.
          </p>
          <p className="mt-3">
            <strong className="font-semibold text-slate-800">Refunds:</strong> Unless otherwise required by law
            or expressly stated at purchase, fees are non-refundable. If you believe you were charged in error,
            contact{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-indigo-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            within a reasonable time; we will review good-faith disputes in line with applicable consumer
            protection rules.
          </p>
        </Section>

        <Section title="6. Intellectual property">
          <p>
            The Service, including software, branding, and documentation, is owned by us or our licensors and
            is protected by intellectual property laws. We grant you a limited, non-exclusive,
            non-transferable, revocable license to use the Service for its intended purpose. You retain rights
            to your content; you grant us a license to host, process, and display your content as needed to
            operate the Service.
          </p>
        </Section>

        <Section title="7. Account termination">
          <p>
            You may stop using the Service and, where available, close your account through account settings or
            by contacting support. We may suspend or terminate your access if you materially breach these
            Terms, if we are required to do so by law, or if continued provision would create undue risk. Upon
            termination, your right to use the Service ceases; provisions that by their nature should survive
            (including disclaimers, limitations of liability, and governing law) will survive.
          </p>
        </Section>

        <Section title="8. Disclaimers">
          <p>
            THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS,
            IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR
            ERROR-FREE OR THAT ANY THIRD-PARTY INTEGRATION WILL ALWAYS BE AVAILABLE.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE OR OUR AFFILIATES, OFFICERS, DIRECTORS,
            EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR
            RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO
            THESE TERMS OR THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE
            SERVICE IN THE TWELVE (12) MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS (US$100), EXCEPT
            WHERE LIMITATION IS PROHIBITED BY LAW.
          </p>
        </Section>

        <Section title="10. Indemnity">
          <p>
            You will defend, indemnify, and hold harmless us and our affiliates from claims, damages, and costs
            (including reasonable attorneys’ fees) arising from your use of the Service, your content, your
            violation of these Terms, or your violation of third-party rights.
          </p>
        </Section>

        <Section title="11. Governing law and disputes">
          <p>
            These Terms are governed by the laws of the State of Delaware, without regard to conflict-of-law
            principles, except where mandatory consumer protection laws of your jurisdiction apply. Exclusive
            jurisdiction and venue for disputes will lie in the state and federal courts located in Delaware,
            unless applicable law requires otherwise for consumers.
          </p>
        </Section>

        <Section title="12. General">
          <p>
            These Terms constitute the entire agreement between you and us regarding the Service and supersede
            prior agreements on this subject. If any provision is unenforceable, the remainder remains in
            effect. Our failure to enforce a provision is not a waiver. You may not assign these Terms without our
            consent; we may assign them in connection with a merger or sale of assets.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about these Terms:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-indigo-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </Section>
      </article>
    </MarketingSiteChrome>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-[#e7dcc9]/80 pt-10 first:mt-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-bold text-[#1f2a44]">{title}</h2>
      <div className="mt-4 space-y-3 text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}
