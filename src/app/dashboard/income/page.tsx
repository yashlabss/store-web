"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import { API_AUTH_BASE, API_PRODUCTS_BASE, API_WEBINAR_HOST_BASE } from "../../../lib/api";
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

type WebinarRow = {
  webinar_id: string;
  title: string;
  status: string;
  created_at: string;
  host_started_at: string | null;
  host_ended_at: string | null;
  first_user_joined_at: string | null;
  last_user_left_at: string | null;
  planned_duration_mins: number;
  actual_duration_mins: number | null;
  duration_verdict: "reached_or_exceeded" | "ended_early" | "in_progress_or_missing_times";
  feedback?: {
    total_submissions: number;
    average_rating: number | null;
    latest?: {
      rating: number | null;
      comment: string | null;
      submitted_at: string | null;
    } | null;
  };
  summary: {
    users_joined_total: number;
    users_left_total: number;
    active_sessions_now: number;
    completed_attendance_total: number;
    partial_attendance_total: number;
    missed_attendance_total: number;
  };
};

type WebinarReportsPayload = {
  webinars: WebinarRow[];
};

type WebinarFeedbackPayload = {
  webinar_id: string;
  summary: {
    total_reviews: number;
    average_rating: number | null;
  };
  reviews: Array<{
    id: string;
    submitted_at: string;
    buyer_id: string | null;
    reviewer_name: string | null;
    reviewer_email: string | null;
    rating: number | null;
    comment: string | null;
  }>;
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

function fmtDateTime(value: string | null) {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString();
}

export default function IncomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<OrdersPayload | null>(null);
  const [listError, setListError] = useState("");
  const [sessionsData, setSessionsData] = useState<WebinarReportsPayload | null>(null);
  const [sessionsError, setSessionsError] = useState("");
  const [selectedFeedbackWebinar, setSelectedFeedbackWebinar] = useState<WebinarRow | null>(null);
  const [feedbackData, setFeedbackData] = useState<WebinarFeedbackPayload | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

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

  const loadSessions = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;
    setSessionsError("");
    try {
      const res = await fetch(`${API_WEBINAR_HOST_BASE}/reports/recent?limit=25`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message || "Could not load webinar sessions.");
      setSessionsData(json as WebinarReportsPayload);
    } catch (e) {
      setSessionsError(networkErrorMessage(e));
      setSessionsData({ webinars: [] });
    }
  }, []);

  const openFeedbackDetails = useCallback(async (webinar: WebinarRow) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    setSelectedFeedbackWebinar(webinar);
    setFeedbackLoading(true);
    setFeedbackError("");
    setFeedbackData(null);
    if (!token) {
      setFeedbackError("Please log in again.");
      setFeedbackLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${API_WEBINAR_HOST_BASE}/${encodeURIComponent(webinar.webinar_id)}/feedback?limit=200`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((json as { message?: string }).message || "Could not load webinar feedback details.");
      }
      setFeedbackData(json as WebinarFeedbackPayload);
    } catch (e) {
      setFeedbackError(networkErrorMessage(e));
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) void loadOrders();
  }, [user, loadOrders]);

  useEffect(() => {
    if (user) void loadSessions();
  }, [user, loadSessions]);

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
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Sessions</h2>
        {sessionsError ? (
          <p className="mb-3 text-sm text-rose-600" role="alert">
            {sessionsError}
            <button type="button" className="ml-2 font-semibold underline" onClick={() => void loadSessions()}>
              Retry
            </button>
          </p>
        ) : null}
        {!sessionsData ? (
          <div className="mb-6 flex justify-center py-8">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : sessionsData.webinars.length === 0 ? (
          <p className="mb-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-8 text-center text-sm text-slate-500">
            No webinar sessions yet. Start a webinar and join once to populate this section.
          </p>
        ) : (
          <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Webinar</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Host start</th>
                  <th className="px-4 py-3">Host end</th>
                  <th className="px-4 py-3">User first join</th>
                  <th className="px-4 py-3">User last left</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {sessionsData.webinars.map((w) => (
                  <tr key={w.webinar_id} className="border-b border-slate-50 last:border-0">
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate font-medium text-slate-900">{w.title || "Webinar"}</p>
                      <p className="truncate text-xs text-slate-500">{w.webinar_id}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{w.status}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDateTime(w.host_started_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDateTime(w.host_ended_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDateTime(w.first_user_joined_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDateTime(w.last_user_left_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {w.actual_duration_mins == null ? "—" : `${w.actual_duration_mins}m`} / {w.planned_duration_mins}m
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{w.duration_verdict}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      J:{w.summary.users_joined_total} · L:{w.summary.users_left_total} · A:{w.summary.active_sessions_now}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      C:{w.summary.completed_attendance_total} · P:{w.summary.partial_attendance_total} · M:{w.summary.missed_attendance_total}
                    </td>
                    <td className="min-w-[220px] px-4 py-3 text-slate-700">
                      <p>
                        Avg: {w.feedback?.average_rating != null ? `${w.feedback.average_rating}/5` : "—"} · Count:{" "}
                        {w.feedback?.total_submissions || 0}
                      </p>
                      {w.feedback?.latest?.comment ? (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          Latest: {w.feedback.latest.comment}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        className="mt-1 text-xs font-semibold text-violet-700 underline"
                        onClick={() => void openFeedbackDetails(w)}
                      >
                        View feedback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedFeedbackWebinar ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Feedback details: {selectedFeedbackWebinar.title || "Webinar"}
                </h3>
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 underline"
                  onClick={() => {
                    setSelectedFeedbackWebinar(null);
                    setFeedbackData(null);
                    setFeedbackError("");
                  }}
                >
                  Close
                </button>
              </div>
              <div className="max-h-[calc(85vh-52px)] overflow-auto p-4">
                {feedbackLoading ? (
                  <p className="text-sm text-slate-500">Loading feedback...</p>
                ) : feedbackError ? (
                  <p className="text-sm text-rose-600">{feedbackError}</p>
                ) : !feedbackData || feedbackData.reviews.length === 0 ? (
                  <p className="text-sm text-slate-500">No reviews submitted for this session yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-2">Reviewer</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Rating</th>
                          <th className="px-3 py-2">Comment</th>
                          <th className="px-3 py-2">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feedbackData.reviews.map((r) => (
                          <tr key={r.id} className="border-b border-slate-50 last:border-0">
                            <td className="px-3 py-2 text-slate-800">{r.reviewer_name || "Buyer"}</td>
                            <td className="px-3 py-2 text-slate-600">{r.reviewer_email || "—"}</td>
                            <td className="px-3 py-2 text-slate-700">{r.rating != null ? `${r.rating}/5` : "—"}</td>
                            <td className="max-w-[320px] truncate px-3 py-2 text-slate-700">{r.comment || "—"}</td>
                            <td className="px-3 py-2 text-slate-600">{fmtDateTime(r.submitted_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

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
