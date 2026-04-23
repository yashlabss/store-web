"use client";

import Link from "next/link";

type Props = {
  title?: string;
  message: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
};

export default function SetupRequiredCard({
  title = "Feature setup required",
  message,
  actionUrl,
  actionLabel,
}: Props) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
      <p className="text-sm font-bold text-amber-800">{title}</p>
      <p className="mt-1.5 text-sm text-amber-700">{message}</p>
      <div className="mt-4">
        <Link
          href={actionUrl || "/dashboard/settings"}
          className="inline-flex rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
        >
          {actionLabel || "Click here to setup/fix"}
        </Link>
      </div>
    </div>
  );
}
