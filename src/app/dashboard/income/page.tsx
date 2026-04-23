"use client";

import { useCallback, useEffect, useState } from "react";
import { API_PAYMENTS_BASE, API_PRODUCTS_BASE, authFetch } from "../../../lib/api";
import { networkErrorMessage } from "../../../lib/networkError";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderRow = {
  id: string;
  created_at: string;
  amount: number;
  currency: string | null;
  buyer_email: string | null;
  buyer_name: string | null;
  payment_method: string | null;
  product_title: string | null;
  product_type?: string | null;
  product_id: string;
  status?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  discount_amount?: number | null;
  delivery_status?: string | null;
};

type OrdersPayload = {
  orders: OrderRow[];
  summary: {
    total_revenue: number;
    order_count: number;
    unique_customers: number;
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtINR(n: number) {
  return `₹${Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtPayment(m: string | null) {
  if (!m) return "—";
  if (m === "demo_instant") return "Demo";
  if (m.toLowerCase().includes("upi")) return "UPI";
  if (m.toLowerCase().includes("razorpay")) return "Razorpay";
  return m;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  refunded: "bg-slate-100 text-slate-600",
  failed: "bg-rose-100 text-rose-700",
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = (status || "pending").toLowerCase();
  const cls = STATUS_COLORS[s] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}
    >
      {s}
    </span>
  );
}

function thisMonthRevenue(orders: OrderRow[]) {
  const now = new Date();
  return orders
    .filter((o) => {
      const d = new Date(o.created_at);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, o) => sum + Number(o.amount), 0);
}

function exportCSV(orders: OrderRow[]) {
  const header = [
    "Order #",
    "Date",
    "Buyer Name",
    "Buyer Email",
    "Product",
    "Amount",
    "Payment Method",
    "Status",
  ];
  const rows = orders.map((o) => [
    o.id.slice(0, 8),
    fmtDate(o.created_at),
    o.buyer_name ?? "",
    o.buyer_email ?? "",
    o.product_title ?? "",
    String(o.amount),
    fmtPayment(o.payment_method),
    o.status ?? "pending",
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
}: {
  order: OrderRow;
  onClose: () => void;
}) {
  const [refundAmount, setRefundAmount] = useState(String(order.amount));
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundMsg, setRefundMsg] = useState("");

  const initiateRefund = async () => {
    setRefundLoading(true);
    setRefundMsg("");
    try {
      const res = await authFetch(`${API_PAYMENTS_BASE}/refund/${order.id}`, {
        method: "POST",
        body: JSON.stringify({ amount: parseFloat(refundAmount) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (json as { message?: string }).message || "Refund failed"
        );
      setRefundMsg("Refund initiated successfully.");
    } catch (e) {
      setRefundMsg(networkErrorMessage(e));
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-4 text-lg font-bold text-slate-900">Order Details</h2>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Order ID
              </p>
              <p className="mt-0.5 font-mono text-xs text-slate-700">{order.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Date
              </p>
              <p className="mt-0.5 text-slate-700">{fmtDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </p>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Amount
              </p>
              <p className="mt-0.5 font-semibold text-slate-900">
                {fmtINR(order.amount)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Buyer
            </p>
            <p className="font-medium text-slate-900">{order.buyer_name || "—"}</p>
            <p className="text-slate-500">{order.buyer_email || "—"}</p>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Product
            </p>
            <p className="font-medium text-slate-900">{order.product_title || "—"}</p>
            {order.product_type && (
              <p className="capitalize text-slate-500">{order.product_type}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Payment
            </p>
            <p className="text-slate-700">
              Method: {fmtPayment(order.payment_method)}
            </p>
            {order.razorpay_order_id && (
              <p className="mt-1 font-mono text-xs text-slate-500">
                Order: {order.razorpay_order_id}
              </p>
            )}
            {order.razorpay_payment_id && (
              <p className="font-mono text-xs text-slate-500">
                Payment: {order.razorpay_payment_id}
              </p>
            )}
            {order.discount_amount != null && order.discount_amount > 0 && (
              <p className="mt-1 text-emerald-600">
                Discount: -{fmtINR(order.discount_amount)}
              </p>
            )}
          </div>

          {order.delivery_status && (
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Delivery
              </p>
              <StatusBadge status={order.delivery_status} />
            </div>
          )}

          {(order.status || "").toLowerCase() === "paid" && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                Initiate Refund
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  placeholder="Amount"
                />
                <button
                  type="button"
                  onClick={() => void initiateRefund()}
                  disabled={refundLoading}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {refundLoading ? "…" : "Refund"}
                </button>
              </div>
              {refundMsg && (
                <p
                  className={`mt-2 text-xs ${
                    refundMsg.includes("success")
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {refundMsg}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const DATE_RANGES = [
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Last 3 months",
  "Custom",
] as const;
const STATUS_FILTERS = ["All", "Paid", "Pending", "Refunded", "Failed"] as const;

export default function IncomePage() {
  const [data, setData] = useState<OrdersPayload | null>(null);
  const [listError, setListError] = useState("");
  const [dateRange, setDateRange] =
    useState<(typeof DATE_RANGES)[number]>("Last 30 days");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [resendMsg, setResendMsg] = useState<Record<string, string>>({});

  const loadOrders = useCallback(async () => {
    setListError("");
    try {
      const res = await authFetch(`${API_PRODUCTS_BASE}/orders`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (json as { message?: string }).message || "Could not load orders."
        );
      setData(json as OrdersPayload);
    } catch (e) {
      setListError(networkErrorMessage(e));
      setData({
        orders: [],
        summary: { total_revenue: 0, order_count: 0, unique_customers: 0 },
      });
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleResendDelivery = async (orderId: string) => {
    setResendMsg((prev) => ({ ...prev, [orderId]: "Sending…" }));
    try {
      const res = await authFetch(
        `${API_PAYMENTS_BASE}/resend-delivery/${orderId}`,
        { method: "POST" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error((json as { message?: string }).message || "Failed");
      setResendMsg((prev) => ({ ...prev, [orderId]: "Sent!" }));
    } catch (e) {
      setResendMsg((prev) => ({
        ...prev,
        [orderId]: networkErrorMessage(e).slice(0, 20),
      }));
    }
    setTimeout(
      () =>
        setResendMsg((prev) => {
          const n = { ...prev };
          delete n[orderId];
          return n;
        }),
      3000
    );
  };

  const allOrders = data?.orders ?? [];

  // ─── Filter logic ───
  const filtered = allOrders.filter((o) => {
    const created = new Date(o.created_at);
    const now = new Date();
    if (dateRange === "Today") {
      if (created.toDateString() !== now.toDateString()) return false;
    } else if (dateRange === "Last 7 days") {
      if (now.getTime() - created.getTime() > 7 * 86400000) return false;
    } else if (dateRange === "Last 30 days") {
      if (now.getTime() - created.getTime() > 30 * 86400000) return false;
    } else if (dateRange === "Last 3 months") {
      if (now.getTime() - created.getTime() > 90 * 86400000) return false;
    }
    if (
      statusFilter !== "All" &&
      (o.status || "pending").toLowerCase() !== statusFilter.toLowerCase()
    )
      return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !(o.buyer_email ?? "").toLowerCase().includes(q) &&
        !(o.buyer_name ?? "").toLowerCase().includes(q) &&
        !o.id.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const totalRevenue = allOrders.reduce((s, o) => s + Number(o.amount), 0);
  const monthRevenue = thisMonthRevenue(allOrders);
  const pendingCount = allOrders.filter(
    (o) => (o.status || "").toLowerCase() === "pending"
  ).length;

  return (
    <div>
      {listError && (
        <p className="mb-4 text-sm text-rose-600">
          {listError}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void loadOrders()}
          >
            Retry
          </button>
        </p>
      )}

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: fmtINR(totalRevenue) },
          { label: "Total Orders", value: String(allOrders.length) },
          { label: "This Month", value: fmtINR(monthRevenue) },
          { label: "Pending Refunds", value: String(pendingCount) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {s.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDateRange(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                dateRange === r
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search buyer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
        <button
          type="button"
          onClick={() => exportCSV(filtered)}
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </button>
      </div>

      {/* Orders Table */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm text-slate-500">
            {allOrders.length === 0
              ? "No orders yet. Share your store link and complete a purchase."
              : "No orders match your filters."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {o.id.slice(0, 8)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {fmtDate(o.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {o.buyer_name || "—"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {o.buyer_email || ""}
                      </p>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-slate-700">
                      {o.product_title || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                      {fmtINR(o.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {fmtPayment(o.payment_method)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleResendDelivery(o.id)}
                          className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                        >
                          {resendMsg[o.id] ?? "Resend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
