"use client";

import SetupRequiredCard from "../../../components/common/SetupRequiredCard";

export default function FlowsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Email Flows</h1>
      <p className="text-sm text-slate-600">
        Post-purchase automation and onboarding sequence builder.
      </p>
      <SetupRequiredCard
        message="Email provider automation is not fully configured yet in this environment."
        actionUrl="/dashboard/settings"
        actionLabel="Click here to setup/fix"
      />
    </div>
  );
}
