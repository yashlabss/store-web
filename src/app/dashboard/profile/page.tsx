"use client";

import SetupRequiredCard from "../../../components/common/SetupRequiredCard";

export default function ProfilePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Profile</h1>
      <p className="text-sm text-slate-600">
        Public creator profile, links, and personal branding.
      </p>
      <SetupRequiredCard
        message="Profile sync and social verification are not fully configured yet."
        actionUrl="/dashboard/settings"
        actionLabel="Click here to setup/fix"
      />
    </div>
  );
}
