import Link from "next/link";


export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f5f7] px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex justify-center gap-2">
          <span className="inline-block h-10 w-10 rounded-full bg-indigo-600" />
          <span className="text-3xl font-bold text-slate-900">Creator Store</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1f1b4b] sm:text-3xl">
          Store
        </h1>
        <p className="mt-3 text-slate-600">
        Build your brand, sell your expertise, and grow your audience.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className="rounded-full bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Sign up
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
