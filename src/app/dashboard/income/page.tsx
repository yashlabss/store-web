"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { API_AUTH_BASE, API_PRODUCTS_BASE } from "../../../lib/api";
import { networkErrorMessage } from "../../../lib/networkError";

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  username?: string;
  full_name?: string;
};

type OrderRow = {
  id: string;
  created_at: string;
  amount: number;
  currency: string | null;
  buyer_email: string | null;
  buyer_name: string | null;
  payment_method: string | null;
  product_title: string | null;
  product_id: string;
};

type OrdersPayload = {
  orders: OrderRow[];
  summary: {
    total_revenue: number;
    order_count: number;
    unique_customers: number;
  };
};

function fmtMoney(n: number, currency: string | null) {
  const c = currency || "USD";
  return `${c} ${Number(n).toFixed(2)}`;
}

function fmtPayment(m: string | null) {
  if (!m) return "—";
  if (m === "demo_instant") return "Instant checkout (demo)";
  return m;
}

export default function IncomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<OrdersPayload | null>(null);
  const [listError, setListError] = useState("");

  const loadUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace("/auth/login?redirectTo=/dashboard/income");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_AUTH_BASE}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = (await res.json().catch(() => ({}))) as { user?: UserRow; message?: string };
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("auth_token");
          router.replace("/auth/login?redirectTo=/dashboard/income");
          return;
        }
        throw new Error(d.message || "Could not load profile.");
      }
      if (d.user) setUser(d.user);
    } catch (e) {
      setError(networkErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadOrders = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;
    setListError("");
    try {
      const res = await fetch(`${API_PRODUCTS_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message || "Could not load orders.");
      setData(json as OrdersPayload);
    } catch (e) {
      setListError(networkErrorMessage(e));
      setData({ orders: [], summary: { total_revenue: 0, order_count: 0, unique_customers: 0 } });
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) void loadOrders();
  }, [user, loadOrders]);

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
  const displayName =
    user.full_name?.trim() || handle.charAt(0).toUpperCase() + handle.slice(1);
  const showName = handle.charAt(0).toUpperCase() + handle.slice(1);

  const summary = data?.summary;

  return (
    <DashboardShell
      displayName={displayName}
      handle={handle}
      showName={showName}
      onSignOut={signOut}
      navContext="income"
      topLeft={
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
          Income
        </h1>
      }
    >
      <p className="mt-2 text-sm text-slate-600">
        Revenue and orders from your public store (demo checkout). When you connect Stripe or PayPal, payouts go to
        your linked account — the platform does not hold funds.
      </p>

      {listError ? (
        <p className="mt-4 text-sm text-rose-600" role="alert">
          {listError}
          <button type="button" className="ml-2 font-semibold underline" onClick={() => void loadOrders()}>
            Retry
          </button>
        </p>
      ) : null}

      {summary ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total revenue</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {fmtMoney(summary.total_revenue, "USD")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Orders</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.order_count}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Leads (unique emails)</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.unique_customers}</p>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      <div className="mt-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Orders</h2>
        {!data || data.orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm text-slate-500">
            No orders yet. Share your store link and complete a test purchase from the public storefront.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 font-medium text-slate-900">
                      {o.product_title || "—"}
                    </td>
                    <td className="max-w-[120px] truncate px-4 py-3 text-slate-700">
                      {o.buyer_name || "—"}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                      {o.buyer_email || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                      {fmtMoney(o.amount, o.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtPayment(o.payment_method)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
