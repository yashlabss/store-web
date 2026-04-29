"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { API_PUBLIC_BASE } from "../../lib/api";

export default function BuyerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => searchParams.get("redirectTo") || "/",
    [searchParams]
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_PUBLIC_BASE}/buyer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Login failed.");
      localStorage.setItem("buyer_auth_token", String(json.token || ""));
      router.replace(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-8">
      <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Buyer login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Login with buyer email/password before purchase or download.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
          />
          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New buyer?{" "}
          <Link
            href={`/buyer/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-indigo-600 underline"
          >
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
