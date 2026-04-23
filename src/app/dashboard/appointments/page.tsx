"use client";

import SetupRequiredCard from "../../../components/common/SetupRequiredCard";

export default function AppointmentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Appointments</h1>
      <p className="text-sm text-slate-600">
        Manage coaching calls, booking slots, and reschedules.
      </p>
      <SetupRequiredCard
        message="Calendar and external meeting integrations still need setup."
        actionUrl="/dashboard/settings"
        actionLabel="Click here to setup/fix"
      />
    </div>
  );
}
