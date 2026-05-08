"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { API_AUTH_BASE } from "../../../lib/api";
import { networkErrorMessage } from "../../../lib/networkError";

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  username?: string;
  full_name?: string;
};

export default function DashboardHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace("/auth/login?redirectTo=/dashboard/home");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_AUTH_BASE}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as { user?: UserRow; message?: string };
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("auth_token");
          router.replace("/auth/login?redirectTo=/dashboard/home");
          return;
        }
        throw new Error(data.message || "Could not load profile.");
      }
      if (data.user) setUser(data.user);
    } catch (e) {
      setError(networkErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const signOut = () => {
    localStorage.removeItem("auth_token");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#6b46ff] border-t-transparent" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <p className="text-center text-rose-600" role="alert">
          {error || "No profile data."}
        </p>
        <button
          type="button"
          onClick={() => void loadUser()}
          className="mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#6b46ff" }}
        >
          Try again
        </button>
      </div>
    );
  }

  const handle = (user.username || "creator").trim() || "creator";
  const displayName = user.full_name?.trim() || handle.charAt(0).toUpperCase() + handle.slice(1);
  const showName = handle.charAt(0).toUpperCase() + handle.slice(1);

  return (
    <DashboardShell
      displayName={displayName}
      handle={handle}
      showName={showName}
      onSignOut={signOut}
      navContext="home"
      topLeft={
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
          Home
        </h1>
      }
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold text-[#1f2a44] sm:text-3xl">
          Welcome {showName}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Open your store dashboard from the card below.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 block rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quick access</p>
          <p className="mt-2 text-xl font-semibold text-[#1f2a44]">My Store</p>
          <p className="mt-1 text-sm text-slate-600">Go to products, landing pages, and store settings.</p>
        </Link>
      </div>
    </DashboardShell>
  );
}
