"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { API_AUTH_BASE } from "../../lib/api";

type UserProfile = {
  username: string;
  email: string;
  full_name: string;
};

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#6b46ff] border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-500">Loading your workspace…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4">
      <p className="text-center text-rose-600" role="alert">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-[#6b46ff] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchUser = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (!token) {
      router.replace("/auth/login?redirectTo=/dashboard");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_AUTH_BASE}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (await res.json().catch(() => ({}))) as {
        user?: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string;
        };
        message?: string;
      };

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("auth_token");
          router.replace("/auth/login?redirectTo=/dashboard");
          return;
        }
        throw new Error(data.message || "Could not load profile.");
      }

      if (data.user) {
        setUser({
          username:  data.user.username  ?? "",
          email:     data.user.email     ?? "",
          full_name: data.user.full_name ?? "",
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} onRetry={() => void fetchUser()} />;

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
