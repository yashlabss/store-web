import type { Metadata } from "next";
import MarketingSiteChrome from "@/components/marketing/MarketingSiteChrome";
import { MARKETING_SITE_NAME, SITE_DOMAIN, SUPPORT_EMAIL } from "@/components/marketing/constants";

export const metadata: Metadata = {
  title: `Privacy Policy — ${MARKETING_SITE_NAME}`,
  description: `How ${MARKETING_SITE_NAME} collects, uses, and protects your data.`,
};

const LAST_UPDATED = "May 11, 2026";

export default function PrivacyPage() {
  return (
    <MarketingSiteChrome>
      <article className="mx-auto max-w-3xl">
        <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2a44] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-slate-600">
          This Privacy Policy describes how {MARKETING_SITE_NAME} (“we,” “us,” or “our”) collects, uses,
          discloses, and safeguards information when you use our service at{" "}
          <a href={`https://${SITE_DOMAIN}`} className="text-indigo-600 hover:underline">
            {SITE_DOMAIN}
          </a>{" "}
          (the “Service”). By using the Service, you agree to this policy.
        </p>

        <Section title="1. Information we collect">
          <p>We collect information that you provide directly and information generated when you use the Service.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="font-semibold text-slate-800">Account and profile data:</strong> name, email
              address, and other details you provide when you register or update your account.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Store and commerce data:</strong> product
              listings, descriptions, pricing, digital assets or links you upload, storefront settings, and
              records of orders, buyers, and fulfillment status needed to operate your shop.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Connected integrations:</strong> when you
              connect third-party services (for example Zoom or Google for meetings and calendar), we receive
              and store identifiers, metadata, and OAuth tokens for those providers (tokens stored in encrypted
              form where applicable), and data needed to run the features you turn on—such as creating meetings,
              sharing join links, or syncing events—subject to each provider’s terms and your settings.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Payment information:</strong> payments are
              processed by our payment provider (Stripe). We do not store full payment card numbers on our
              servers; Stripe provides us with limited billing metadata (such as transaction status and the
              last four digits of a card where applicable) as needed to operate subscriptions and purchases.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Usage and technical data:</strong> IP address,
              device/browser type, log data, cookies (see below), and similar data used for security,
              analytics, and Service improvement.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Communications:</strong> content of messages you
              send to support or that we send to you (for example, order confirmations, delivery or session
              updates, and account notices).
            </li>
          </ul>
        </Section>

        <Section title="2. How we use information">
          <p>We use personal data to provide and improve the Service, including to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Operate your storefront: display products, process orders, and deliver digital goods or access you configure.</li>
            <li>Create or coordinate meetings or sessions when you use integrated providers (for example Zoom or Google), including join links and related buyer communications where enabled.</li>
            <li>Send transactional and service emails (for example, receipts, download or access details, session reminders, and account notices).</li>
            <li>Process payments, prevent fraud, and manage billing.</li>
            <li>Maintain security, troubleshoot issues, and comply with legal obligations.</li>
            <li>Analyze aggregated or de-identified usage to improve the product.</li>
          </ul>
        </Section>

        <Section title="3. Third-party services">
          <p>
            We rely on subprocessors that process data on our behalf. Key providers include:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="font-semibold text-slate-800">Meeting and calendar providers (e.g. Zoom,
              Google):</strong> when you connect them, meeting creation, event data, attendance-related signals,
              or recordings, according to the permissions you grant and each provider’s terms.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Supabase:</strong> authentication, database, and
              related infrastructure for storing application data securely.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Stripe:</strong> payment processing and billing.
            </li>
          </ul>
          <p className="mt-3">
            Each provider has its own privacy practices. We encourage you to review their policies.
          </p>
        </Section>

        <Section title="4. Legal bases (where applicable)">
          <p>
            If the GDPR or similar laws apply, we process personal data on bases such as: performance of a
            contract with you, legitimate interests (for example, securing the Service and improving features,
            balanced against your rights), consent where required (such as certain cookies or marketing, if
            offered), and legal obligation.
          </p>
        </Section>

        <Section title="5. Your privacy rights and choices">
          <p>
            Depending on your location, you may have rights under applicable privacy laws—including, where the
            GDPR, UK GDPR, or similar frameworks apply—the right to access, rectify, erase, restrict, or object
            to certain processing of your personal data, the right to data portability, and the right to
            withdraw consent where processing is consent-based. You may also have the right to lodge a complaint
            with a supervisory authority.
          </p>
          <p className="mt-3">
            To exercise these rights, or to ask questions about how we handle personal data, contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-indigo-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>
            . We will respond within a reasonable timeframe and in accordance with applicable law. We may need
            to verify your identity before fulfilling certain requests.
          </p>
        </Section>

        <Section title="6. Data deletion requests">
          <p>
            You may request deletion of your personal data by emailing{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-indigo-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            with the subject line “Data deletion request.” We will process verifiable requests as required by
            law. Some information may be retained where necessary for legal compliance, dispute resolution, or
            legitimate business purposes (for example, aggregated analytics or backup archives for a limited
            period), after which it is deleted or de-identified where feasible.
          </p>
        </Section>

        <Section title="7. Data retention">
          <p>
            We retain personal data only as long as needed for the purposes described in this policy, unless a
            longer period is required or permitted by law. Account data is generally kept for the life of your
            account and a reasonable period afterward. Tokens and metadata for connected integrations (such as
            Zoom or Google) are retained while each integration is active and for a limited period after
            disconnection for security and audit purposes, then removed or anonymized according to our retention
            schedule.
            Transaction records may be retained longer where required for tax, accounting, or regulatory
            compliance.
          </p>
        </Section>

        <Section title="8. Cookies and similar technologies">
          <p>
            We use cookies and similar technologies to operate the Service (for example, session and
            authentication cookies), remember preferences, measure performance, and improve security. You can
            control cookies through your browser settings; disabling certain cookies may limit functionality.
            Where required, we will obtain consent before using non-essential cookies.
          </p>
        </Section>

        <Section title="9. Security">
          <p>
            We implement technical and organizational measures designed to protect personal data, including
            encryption of sensitive tokens at rest where appropriate, access controls, and secure
            infrastructure. No method of transmission over the Internet is 100% secure.
          </p>
        </Section>

        <Section title="10. International transfers">
          <p>
            We may process and store data in the United States and other countries where we or our service
            providers operate. Where required, we use appropriate safeguards (such as standard contractual
            clauses) for cross-border transfers.
          </p>
        </Section>

        <Section title="11. Children’s privacy">
          <p>
            The Service is not directed to children under 16, and we do not knowingly collect personal
            information from children. Contact us if you believe we have collected a child’s information
            in error.
          </p>
        </Section>

        <Section title="12. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. We will post the updated version on this page
            and revise the “Last updated” date. Continued use of the Service after changes constitutes acceptance
            of the updated policy where permitted by law.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about this Privacy Policy:{" "}
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
