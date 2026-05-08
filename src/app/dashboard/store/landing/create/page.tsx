"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AddProductClient from "../../../../../components/store/AddProductClient";
import { API_AUTH_BASE } from "../../../../../lib/api";
import { networkErrorMessage } from "../../../../../lib/networkError";

/**
 * Landing Page → Product Hub editor.
 *
 * This route is intentionally separate from the store product editor
 * (`/dashboard/store/product/new`) so the two flows have distinct URLs and
 * breadcrumbs even when they share the same underlying editor component.
 *
 * The route forces `?kind=landing` in the URL on first load so the editor
 * tags new items with `location: "landing"` (handled inside `AddProductClient`),
 * which makes them appear under the "Landing Pages" tab in My Store.
 */
const REDIRECT_LOGIN = "/auth/login?redirectTo=/dashboard/store/landing/create";

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  username?: string;
  full_name?: string;
  country_code?: string;
  phone?: string;
};

function LoadingShell() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-white"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-[#6b46ff] border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-600">Loading…</p>
      </div>
    </div>
  );
}

function AddLandingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /** Ensure ?kind=landing is present (so AddProductClient applies landing tagging on save). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((searchParams.get("kind") || "").toLowerCase() === "landing") return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("kind", "landing");
    router.replace(`/dashboard/store/landing/create?${next.toString()}`);
  }, [router, searchParams]);

  const loadUser = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace(REDIRECT_LOGIN);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_AUTH_BASE}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        user?: UserRow;
        message?: string;
      };

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("auth_token");
          router.replace(REDIRECT_LOGIN);
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
    return <LoadingShell />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <p className="text-center text-rose-600" role="alert">
          {error}
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

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <p className="text-slate-600">No profile data.</p>
        <button
          type="button"
          onClick={() => void loadUser()}
          className="mt-4 text-sm font-semibold text-[#6b46ff] underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  return <AddProductClient user={user} onSignOut={signOut} />;
}

export default function AddLandingPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <AddLandingPageInner />
    </Suspense>
  );
}
