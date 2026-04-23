"use client";

import SetupRequiredCard from "../../../components/common/SetupRequiredCard";

export default function AffiliatesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Affiliates</h1>
      <p className="text-sm text-slate-600">
        Referral links, commissions, and partner payouts.
      </p>
      <SetupRequiredCard
        message="Affiliate payouts and commission policies are not configured for this workspace yet."
        actionUrl="/dashboard/settings"
        actionLabel="Click here to setup/fix"
      />
    </div>
  );
}
