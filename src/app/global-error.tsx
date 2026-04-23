"use client";

import Link from "next/link";

export default function RootGlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body>
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-900">Unexpected issue</p>
            <p className="mt-2 text-sm text-slate-600">
              {error.message || "A runtime error occurred."}
            </p>
            <Link
              href="/dashboard/settings"
              className="mt-5 inline-flex rounded-full bg-[#6b46ff] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Click here to setup/fix
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
