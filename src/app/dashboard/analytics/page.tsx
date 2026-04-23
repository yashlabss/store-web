"use client";

import { useCallback, useEffect, useState } from "react";
import { API_ANALYTICS_BASE, authFetch } from "../../../lib/api";
import { networkErrorMessage } from "../../../lib/networkError";

// ─── Types ────────────────────────────────────────────────────────────────────

type DailyRevenue = { date: string; revenue: number; orders: number };

type TopProduct = {
  product_id: string;
  title: string;
  type: string;
  views: number;
  orders: number;
  revenue: number;
};

type AnalyticsDashboard = {
  total_revenue: number;
  total_orders: number;
  page_views: number;
  conversion_rate: number;
  daily: DailyRevenue[];
  top_products: TopProduct[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtINR(n: number) {
  return `₹${Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function shortDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function LineChart({ data }: { data: DailyRevenue[] }) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    d: DailyRevenue;
  } | null>(null);

  const W = 600;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 40, left: 60 };

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">
        No data for this period
      </div>
    );
  }

  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const xScale = (i: number) =>
    PAD.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = (v: number) =>
    PAD.top + chartH - (v / maxRev) * chartH;

  const points = data.map((d, i) => ({
    x: xScale(i),
    y: yScale(d.revenue),
    d,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = [
    `M ${points[0].x} ${PAD.top + chartH}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${PAD.top + chartH}`,
    "Z",
  ].join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.top + chartH * (1 - f),
    label: fmtINR(f * maxRev),
  }));

  const xLabelIndices =
    data.length <= 7
      ? data.map((_, i) => i)
      : [
          0,
          Math.floor(data.length / 4),
          Math.floor(data.length / 2),
          Math.floor((3 * data.length) / 4),
          data.length - 1,
        ];

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 280 }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b46ff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6b46ff" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <line
            key={t.y}
            x1={PAD.left}
            y1={t.y}
            x2={W - PAD.right}
            y2={t.y}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}

        <path d={areaPath} fill="url(#chartGrad)" />
        <polyline
          points={polyline}
          fill="none"
          stroke="#6b46ff"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {yTicks.map((t) => (
          <text
            key={t.y}
            x={PAD.left - 6}
            y={t.y + 4}
            textAnchor="end"
            fontSize={10}
            fill="#94a3b8"
          >
            {t.label}
          </text>
        ))}

        {xLabelIndices.map((i) => (
          <text
            key={i}
            x={xScale(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#94a3b8"
          >
            {shortDate(data[i].date)}
          </text>
        ))}

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={18}
            fill="transparent"
            onMouseEnter={() => setTooltip({ x: p.x, y: p.y, d: p.d })}
          />
        ))}

        {tooltip && (
          <circle
            cx={tooltip.x}
            cy={tooltip.y}
            r={5}
            fill="#6b46ff"
            stroke="white"
            strokeWidth={2}
          />
        )}
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none absolute rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg"
          style={{
            left: `calc(${(tooltip.x / W) * 100}% - 60px)`,
            top: `${(tooltip.y / H) * 100}%`,
            transform: "translateY(-110%)",
          }}
        >
          <p className="font-semibold text-slate-900">
            {shortDate(tooltip.d.date)}
          </p>
          <p className="text-violet-600">{fmtINR(tooltip.d.revenue)}</p>
          <p className="text-slate-500">{tooltip.d.orders} orders</p>
        </div>
      )}
    </div>
  );
}

// ─── Date range helpers ───────────────────────────────────────────────────────

type RangeTab = "7d" | "30d" | "90d";

function getRange(tab: RangeTab) {
  const end = new Date();
  const days = tab === "7d" ? 7 : tab === "30d" ? 30 : 90;
  const start = addDays(end, -days + 1);
  return { start: isoDate(start), end: isoDate(end) };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [rangeTab, setRangeTab] = useState<RangeTab>("30d");
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  const loadAnalytics = useCallback(async (tab: RangeTab) => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    const { start, end } = getRange(tab);
    try {
      const res = await authFetch(
        `${API_ANALYTICS_BASE}/dashboard?from=${start}&to=${end}`
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (json as { message?: string }).message || "Failed to load analytics."
        );
      setAnalytics(json as AnalyticsDashboard);
    } catch (e) {
      setAnalyticsError(networkErrorMessage(e));
      setAnalytics({
        total_revenue: 0,
        total_orders: 0,
        page_views: 0,
        conversion_rate: 0,
        daily: [],
        top_products: [],
      });
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics(rangeTab);
  }, [rangeTab, loadAnalytics]);

  const a = analytics;
  const { start, end } = getRange(rangeTab);

  return (
    <div>
      {/* Date range tabs */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
          {(["7d", "30d", "90d"] as RangeTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRangeTab(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                rangeTab === t
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "7d" ? "7 days" : t === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          {start} → {end}
        </span>
      </div>

      {analyticsError && (
        <p className="mb-4 text-sm text-rose-600">{analyticsError}</p>
      )}

      {analyticsLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Revenue", value: fmtINR(a?.total_revenue ?? 0) },
              { label: "Total Orders", value: String(a?.total_orders ?? 0) },
              {
                label: "Page Views",
                value: String(a?.page_views ?? 0),
              },
              {
                label: "Conversion Rate",
                value: `${((a?.conversion_rate ?? 0) * 100).toFixed(1)}%`,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {s.label}
                </p>
                <p className="mt-1.5 text-2xl font-bold text-slate-900">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              Revenue over time
            </h2>
            <LineChart data={a?.daily ?? []} />
          </div>

          {/* Top Products Table */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-700">
                Top Products
              </h2>
            </div>
            {!a?.top_products?.length ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                No product data yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3 text-right">Views</th>
                      <th className="px-5 py-3 text-right">Orders</th>
                      <th className="px-5 py-3 text-right">Revenue</th>
                      <th className="px-5 py-3 text-right">CVR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...a.top_products]
                      .sort((x, y) => y.revenue - x.revenue)
                      .map((p) => (
                        <tr
                          key={p.product_id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40"
                        >
                          <td className="max-w-[200px] truncate px-5 py-3 font-medium text-slate-900">
                            {p.title}
                          </td>
                          <td className="px-5 py-3 capitalize text-slate-500">
                            {p.type}
                          </td>
                          <td className="px-5 py-3 text-right text-slate-600">
                            {p.views.toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-right text-slate-600">
                            {p.orders}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-slate-900">
                            {fmtINR(p.revenue)}
                          </td>
                          <td className="px-5 py-3 text-right text-slate-600">
                            {p.views > 0
                              ? `${((p.orders / p.views) * 100).toFixed(1)}%`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Traffic Sources
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Traffic source tracking coming soon
            </p>
          </div>
        </>
      )}
    </div>
  );
}
