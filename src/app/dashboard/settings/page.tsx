"use client";

import { Suspense } from "react";
import AccountSettingsClient from "../../../components/dashboard/AccountSettingsClient";

function SettingsFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-white"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" aria-hidden />
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <AccountSettingsClient />
    </Suspense>
  );
}
