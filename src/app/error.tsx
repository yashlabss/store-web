"use client";

import SetupRequiredCard from "../components/common/SetupRequiredCard";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg space-y-4">
        <SetupRequiredCard
          title="Something needs setup/fix"
          message={error.message || "This feature could not be loaded right now."}
          actionUrl="/dashboard/settings"
          actionLabel="Click here to setup/fix"
        />
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
