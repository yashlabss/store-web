"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { API_AUTH_BASE, API_DIGITAL_PRODUCTS_BASE, authFetch } from "../../lib/api";
import { networkErrorMessage } from "../../lib/networkError";
import { DISPLAY_STORE_DOMAIN } from "../../lib/publicStorePath";
import DigitalFilesSection from "./editors/DigitalFilesSection";

// ─── Types ───────────────────────────────────────────────────────────────────

type DiscountCode = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses?: number | null;
  use_count?: number;
  expires_at?: string | null;
};

type DigitalProduct = {
  id: string;
  product_type: string;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  price_numeric: number;
  currency: string;
  sale_enabled: boolean;
  sale_price: number | null;
  inventory_enabled: boolean;
  inventory_count: number | null;
  delivery_type: string;
  redirect_url: string | null;
  thumbnail_url: string | null;
  slug: string;
  checkout_json: Record<string, unknown>;
  options_json: Record<string, unknown>;
  thank_you_message: string | null;
  status: string;
  updated_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PURPLE = "#6b46ff";

function inputCls(extra = "") {
  return `w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 ${extra}`;
}

function labelCls() {
  return "block text-sm font-semibold text-slate-800 mb-1";
}

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
        checked ? "bg-violet-500" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// ─── Product type badge ───────────────────────────────────────────────────────

function typeMeta(t: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    digital_download: { label: "Digital Download", color: "#2563eb", bg: "#dbeafe" },
    digital: { label: "Digital Download", color: "#2563eb", bg: "#dbeafe" },
    course: { label: "Online Course", color: "#7c3aed", bg: "#ede9fe" },
    membership: { label: "Membership", color: "#059669", bg: "#d1fae5" },
    booking: { label: "Booking / Call", color: "#d97706", bg: "#fef3c7" },
    webinar: { label: "Webinar", color: "#db2777", bg: "#fce7f3" },
    community: { label: "Community", color: "#0891b2", bg: "#cffafe" },
    lead_magnet: { label: "Lead Magnet", color: "#ca8a04", bg: "#fef9c3" },
    custom: { label: "Custom Product", color: "#64748b", bg: "#f1f5f9" },
    link: { label: "Link / URL", color: "#dc2626", bg: "#fee2e2" },
  };
  return map[t] ?? { label: t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), color: "#64748b", bg: "#f1f5f9" };
}

// ─── Live preview card ────────────────────────────────────────────────────────

function ProductPreviewCard({
  product,
  handle,
}: {
  product: DigitalProduct;
  handle: string;
}) {
  const meta = typeMeta(product.product_type);
  const price = product.sale_enabled && product.sale_price != null
    ? product.sale_price
    : product.price_numeric;
  const isPublished = product.status === "published";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Thumbnail */}
      <div
        className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: meta.bg }}
      >
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.thumbnail_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="1.5" aria-hidden style={{ opacity: 0.4 }}>
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        )}
      </div>

      <span
        className="mt-3 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
        style={{ backgroundColor: meta.bg, color: meta.color }}
      >
        {meta.label}
      </span>

      <h4 className="mt-2 text-sm font-bold leading-snug text-slate-900 line-clamp-2">
        {product.title || "Untitled product"}
      </h4>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-base font-bold" style={{ color: PURPLE }}>
          {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
        </span>
        {product.sale_enabled && product.sale_price != null && (
          <span className="text-xs text-slate-400 line-through">
            ₹{product.price_numeric.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      <span
        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
          isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {isPublished ? "Live" : "Draft"}
      </span>

      {isPublished && (
        <a
          href={`/${handle}/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View Live
        </a>
      )}
    </div>
  );
}

// ─── Tab: Details ─────────────────────────────────────────────────────────────

function DetailsTab({
  product,
  onChange,
}: {
  product: DigitalProduct;
  onChange: (updates: Partial<DigitalProduct>) => void;
}) {
  const thumbnailRef = useRef<HTMLInputElement>(null);

  const readImageAsDataUrl = (file: File): Promise<string | null> =>
    new Promise((resolve) => {
      if (!file.type.startsWith("image/")) { resolve(null); return; }
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(file);
    });

  const onPickThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    void readImageAsDataUrl(file).then((url) => {
      if (url) onChange({ thumbnail_url: url });
    });
  };

  const isDigital = product.product_type === "digital_download" || product.product_type === "digital";
  const isCourse = product.product_type === "course";
  const isBooking = product.product_type === "booking";
  const isMembership = product.product_type === "membership";

  const optionsJson = product.options_json as Record<string, unknown>;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <label className={labelCls()} htmlFor="ed-title">
          Product Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="ed-title"
          value={product.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Give your product a great name"
          className={inputCls("text-lg font-semibold")}
        />
      </div>

      {/* Subtitle / tagline */}
      <div>
        <label className={labelCls()} htmlFor="ed-subtitle">
          Subtitle / Tagline
        </label>
        <input
          id="ed-subtitle"
          value={product.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Short catchy tagline"
          className={inputCls()}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls()} htmlFor="ed-desc">
          Description
        </label>
        <textarea
          id="ed-desc"
          value={product.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={6}
          placeholder="Describe what customers will get, what they'll learn, or why they need it…"
          className={inputCls("resize-none leading-relaxed")}
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className={labelCls()}>Thumbnail Image</label>
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center">
          <div
            className="relative flex h-[100px] w-[100px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl"
            style={{ backgroundColor: typeMeta(product.product_type).bg }}
            onClick={() => thumbnailRef.current?.click()}
          >
            {product.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.thumbnail_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={typeMeta(product.product_type).color} strokeWidth="1.5" aria-hidden style={{ opacity: 0.4 }}>
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-700">Upload thumbnail</p>
            <p className="mt-0.5 text-sm text-slate-500">Recommended: 800×800px or larger, JPG/PNG</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => thumbnailRef.current?.click()}
                className="rounded-xl border-2 px-4 py-2 text-sm font-bold"
                style={{ borderColor: PURPLE, color: PURPLE }}
              >
                Choose image
              </button>
              {product.thumbnail_url && (
                <button
                  type="button"
                  onClick={() => onChange({ thumbnail_url: null })}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={onPickThumbnail} aria-hidden />
        </div>
      </div>

      {/* Product-type specific fields */}
      {isDigital && (
        <div>
          <label className={labelCls()}>Product Files</label>
          <DigitalFilesSection productId={product.id} />
        </div>
      )}

      {isCourse && (
        <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <p className="text-sm font-semibold text-violet-800">Course Modules</p>
          <p className="mt-1 text-sm text-violet-600">
            Manage your video lessons and course structure in the Modules editor.
          </p>
          <Link
            href={`/dashboard/products/${product.id}/modules`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ backgroundColor: PURPLE }}
          >
            Go to Modules
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {isBooking && (
        <div className="space-y-4">
          <div>
            <label className={labelCls()} htmlFor="ed-duration">Duration (minutes)</label>
            <input
              id="ed-duration"
              type="number"
              min={5}
              step={5}
              value={(optionsJson.duration_minutes as number) ?? 60}
              onChange={(e) =>
                onChange({ options_json: { ...optionsJson, duration_minutes: Number(e.target.value) } })
              }
              className={inputCls("max-w-xs")}
            />
          </div>
          <div>
            <label className={labelCls()} htmlFor="ed-booking-type">Booking Type</label>
            <select
              id="ed-booking-type"
              value={(optionsJson.booking_type as string) ?? "1on1"}
              onChange={(e) =>
                onChange({ options_json: { ...optionsJson, booking_type: e.target.value } })
              }
              className={inputCls("max-w-xs")}
            >
              <option value="1on1">1-on-1 Call</option>
              <option value="group">Group Session</option>
              <option value="webinar">Webinar</option>
            </select>
          </div>
        </div>
      )}

      {isMembership && (
        <div>
          <label className={labelCls()} htmlFor="ed-billing">Billing Interval</label>
          <select
            id="ed-billing"
            value={(optionsJson.billing_interval as string) ?? "monthly"}
            onChange={(e) =>
              onChange({ options_json: { ...optionsJson, billing_interval: e.target.value } })
            }
            className={inputCls("max-w-xs")}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">One-time / Lifetime</option>
          </select>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Pricing ────────────────────────────────────────────────────────────

function PricingTab({
  product,
  discountCodes,
  onChange,
  onAddDiscountCode,
  onDeleteDiscountCode,
  loadingCodes,
}: {
  product: DigitalProduct;
  discountCodes: DiscountCode[];
  onChange: (updates: Partial<DigitalProduct>) => void;
  onAddDiscountCode: (code: Omit<DiscountCode, "id" | "use_count">) => Promise<void>;
  onDeleteDiscountCode: (id: string) => Promise<void>;
  loadingCodes: boolean;
}) {
  const [discountEnabled, setDiscountEnabled] = useState(false);

  // new discount form state
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percent" | "fixed">("percent");
  const [newValue, setNewValue] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [addingCode, setAddingCode] = useState(false);
  const [addCodeError, setAddCodeError] = useState("");

  const handleAddCode = async () => {
    if (!newCode.trim() || !newValue) {
      setAddCodeError("Code and value are required.");
      return;
    }
    setAddingCode(true);
    setAddCodeError("");
    try {
      await onAddDiscountCode({
        code: newCode.trim().toUpperCase(),
        discount_type: newType,
        discount_value: Number(newValue),
        max_uses: newMaxUses ? Number(newMaxUses) : null,
        expires_at: newExpiry || null,
      });
      setNewCode("");
      setNewValue("");
      setNewMaxUses("");
      setNewExpiry("");
    } catch (e) {
      setAddCodeError(networkErrorMessage(e));
    } finally {
      setAddingCode(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Base price */}
      <div>
        <label className={labelCls()} htmlFor="ed-price">
          Price <span className="text-rose-500">*</span>
        </label>
        <div className="relative max-w-xs">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
            ₹
          </span>
          <input
            id="ed-price"
            type="number"
            min={0}
            step={1}
            value={product.price_numeric}
            onChange={(e) => onChange({ price_numeric: Number(e.target.value) })}
            className={inputCls("pl-8")}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">Enter 0 for a free product.</p>
      </div>

      {/* Currency */}
      <div>
        <label className={labelCls()} htmlFor="ed-currency">Currency</label>
        <select
          id="ed-currency"
          value={product.currency}
          onChange={(e) => onChange({ currency: e.target.value })}
          className={inputCls("max-w-xs")}
        >
          <option value="INR">INR — Indian Rupee (₹)</option>
          <option value="USD">USD — US Dollar ($)</option>
          <option value="EUR">EUR — Euro (€)</option>
          <option value="GBP">GBP — British Pound (£)</option>
        </select>
      </div>

      {/* Sale price */}
      <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Sale / Discounted Price</p>
            <p className="mt-0.5 text-xs text-slate-400">Show a strikethrough original price.</p>
          </div>
          <Toggle
            id="sale-toggle"
            checked={product.sale_enabled}
            onChange={(v) => onChange({ sale_enabled: v })}
          />
        </div>
        {product.sale_enabled && (
          <div>
            <label className={labelCls()} htmlFor="ed-sale-price">Sale Price (₹)</label>
            <div className="relative max-w-xs">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">₹</span>
              <input
                id="ed-sale-price"
                type="number"
                min={0}
                step={1}
                value={product.sale_price ?? ""}
                onChange={(e) => onChange({ sale_price: e.target.value ? Number(e.target.value) : null })}
                className={inputCls("pl-8")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Limit Inventory</p>
            <p className="mt-0.5 text-xs text-slate-400">Restrict how many copies can be sold.</p>
          </div>
          <Toggle
            checked={product.inventory_enabled}
            onChange={(v) => onChange({ inventory_enabled: v })}
          />
        </div>
        {product.inventory_enabled && (
          <div>
            <label className={labelCls()} htmlFor="ed-inventory">Inventory Count</label>
            <input
              id="ed-inventory"
              type="number"
              min={0}
              step={1}
              value={product.inventory_count ?? ""}
              onChange={(e) => onChange({ inventory_count: e.target.value ? Number(e.target.value) : null })}
              className={inputCls("max-w-xs")}
            />
          </div>
        )}
      </div>

      {/* Discount codes */}
      <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Discount Codes</p>
            <p className="mt-0.5 text-xs text-slate-400">Let customers apply promo codes at checkout.</p>
          </div>
          <Toggle checked={discountEnabled} onChange={setDiscountEnabled} />
        </div>

        {discountEnabled && (
          <>
            {/* Existing codes */}
            {loadingCodes ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : discountCodes.length === 0 ? (
              <p className="text-xs text-slate-400">No discount codes yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Value</th>
                      <th className="px-3 py-2">Uses</th>
                      <th className="px-3 py-2">Expires</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {discountCodes.map((dc) => (
                      <tr key={dc.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-3 py-2 font-mono font-semibold text-slate-800">{dc.code}</td>
                        <td className="px-3 py-2 capitalize text-slate-600">{dc.discount_type}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {dc.discount_type === "percent" ? `${dc.discount_value}%` : `₹${dc.discount_value}`}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {dc.use_count ?? 0}{dc.max_uses ? ` / ${dc.max_uses}` : ""}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {dc.expires_at ? new Date(dc.expires_at).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => void onDeleteDiscountCode(dc.id)}
                            className="text-rose-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add code form */}
            <div className="space-y-3 rounded-xl border border-violet-100 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">Add Discount Code</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls()} htmlFor="nc-code">Code</label>
                  <input
                    id="nc-code"
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="SAVE20"
                    className={inputCls("font-mono uppercase")}
                  />
                </div>
                <div>
                  <label className={labelCls()} htmlFor="nc-type">Type</label>
                  <select
                    id="nc-type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "percent" | "fixed")}
                    className={inputCls()}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls()} htmlFor="nc-value">
                    Value {newType === "percent" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    id="nc-value"
                    type="number"
                    min={0}
                    step={newType === "percent" ? 1 : 10}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={newType === "percent" ? "20" : "100"}
                    className={inputCls()}
                  />
                </div>
                <div>
                  <label className={labelCls()} htmlFor="nc-maxuses">Max Uses (optional)</label>
                  <input
                    id="nc-maxuses"
                    type="number"
                    min={0}
                    step={1}
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(e.target.value)}
                    placeholder="Unlimited"
                    className={inputCls()}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls()} htmlFor="nc-expiry">Expiry Date (optional)</label>
                  <input
                    id="nc-expiry"
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className={inputCls("max-w-xs")}
                  />
                </div>
              </div>
              {addCodeError && (
                <p className="text-xs font-medium text-rose-600">{addCodeError}</p>
              )}
              <button
                type="button"
                disabled={addingCode}
                onClick={() => void handleAddCode()}
                className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PURPLE }}
              >
                {addingCode ? "Adding…" : "+ Add Code"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Delivery ────────────────────────────────────────────────────────────

function DeliveryTab({
  product,
  onChange,
}: {
  product: DigitalProduct;
  onChange: (updates: Partial<DigitalProduct>) => void;
}) {
  const checkoutJson = product.checkout_json as Record<string, unknown>;

  const deliveryType = product.delivery_type || "file";

  const deliveryOptions = [
    { value: "file", label: "Upload Files", desc: "Files delivered after purchase" },
    { value: "redirect", label: "Redirect to URL", desc: "Send buyer to an external URL" },
    { value: "manual", label: "Manual / I'll handle it", desc: "Fulfill orders yourself" },
  ];

  return (
    <div className="space-y-8">
      {/* Delivery type */}
      <div>
        <p className={labelCls()}>Delivery Method</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {deliveryOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ delivery_type: opt.value })}
              className={`flex flex-col rounded-xl border-2 p-4 text-left transition ${
                deliveryType === opt.value
                  ? "border-violet-400 bg-violet-50/60"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="text-sm font-bold text-slate-800">{opt.label}</span>
              <span className="mt-1 text-xs text-slate-500">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File section */}
      {deliveryType === "file" && (
        <div>
          <p className={labelCls()}>Files to Deliver</p>
          <DigitalFilesSection productId={product.id} />
        </div>
      )}

      {/* Redirect URL */}
      {deliveryType === "redirect" && (
        <div>
          <label className={labelCls()} htmlFor="ed-redir">Redirect URL</label>
          <input
            id="ed-redir"
            type="url"
            value={product.redirect_url ?? ""}
            onChange={(e) => onChange({ redirect_url: e.target.value })}
            placeholder="https://drive.google.com/file/your-file"
            className={inputCls()}
          />
          <p className="mt-1 text-xs text-slate-400">
            Buyer is redirected here immediately after successful payment.
          </p>
        </div>
      )}

      {/* Thank you message */}
      <div>
        <label className={labelCls()} htmlFor="ed-thankyou">Thank You Message</label>
        <textarea
          id="ed-thankyou"
          value={product.thank_you_message ?? ""}
          onChange={(e) => onChange({ thank_you_message: e.target.value })}
          rows={3}
          placeholder="Thanks for your purchase! Here's how to access your product…"
          className={inputCls("resize-none")}
        />
        <p className="mt-1 text-xs text-slate-400">Shown on the thank-you page and in the receipt email.</p>
      </div>

      {/* Checkout note */}
      <div>
        <label className={labelCls()} htmlFor="ed-cknote">Custom Checkout Note</label>
        <textarea
          id="ed-cknote"
          value={(checkoutJson.note as string) ?? ""}
          onChange={(e) =>
            onChange({ checkout_json: { ...checkoutJson, note: e.target.value } })
          }
          rows={2}
          placeholder="Any note shown to the buyer during checkout (optional)."
          className={inputCls("resize-none")}
        />
      </div>
    </div>
  );
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────

function SettingsTab({
  product,
  handle,
  onChange,
  onPublishToggle,
  publishing,
}: {
  product: DigitalProduct;
  handle: string;
  onChange: (updates: Partial<DigitalProduct>) => void;
  onPublishToggle: () => void;
  publishing: boolean;
}) {
  const isPublished = product.status === "published";
  const checkoutJson = product.checkout_json as Record<string, unknown>;

  return (
    <div className="space-y-8">
      {/* Status */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold text-slate-900">
              {isPublished ? "Product is Live" : "Product is a Draft"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isPublished
                ? "Your product is visible in your public store."
                : "Only you can see this product. Publish to make it available."}
            </p>
          </div>
          <button
            type="button"
            disabled={publishing}
            onClick={onPublishToggle}
            className={`relative h-9 w-16 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50 ${
              isPublished ? "bg-emerald-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-transform ${
                isPublished ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <button
          type="button"
          disabled={publishing}
          onClick={onPublishToggle}
          className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white transition disabled:opacity-50 ${
            isPublished ? "bg-amber-500 hover:bg-amber-600" : "hover:opacity-90"
          }`}
          style={!isPublished ? { backgroundColor: PURPLE } : undefined}
        >
          {publishing ? "Updating…" : isPublished ? "Unpublish Product" : "Publish Product"}
        </button>
      </div>

      {/* Slug */}
      <div>
        <label className={labelCls()} htmlFor="ed-slug">Product URL Slug</label>
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-400">
            {DISPLAY_STORE_DOMAIN}/{handle}/
          </span>
          <input
            id="ed-slug"
            type="text"
            value={product.slug}
            onChange={(e) =>
              onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
            }
            className="flex-1 rounded-r-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">Use only lowercase letters, numbers, and hyphens.</p>
      </div>

      {/* Button text */}
      <div>
        <label className={labelCls()} htmlFor="ed-btn-text">Purchase Button Text</label>
        <input
          id="ed-btn-text"
          type="text"
          value={product.button_text}
          onChange={(e) => onChange({ button_text: e.target.value })}
          placeholder="Buy Now"
          className={inputCls("max-w-sm")}
        />
      </div>

      {/* Reviews toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Show Reviews / Testimonials</p>
          <p className="mt-0.5 text-xs text-slate-400">Display customer reviews on the product page.</p>
        </div>
        <Toggle
          checked={Boolean((checkoutJson.reviews_enabled as boolean) ?? false)}
          onChange={(v) =>
            onChange({ checkout_json: { ...checkoutJson, reviews_enabled: v } })
          }
        />
      </div>

      {/* Custom fields for checkout */}
      <div>
        <p className={labelCls()}>Custom Checkout Questions</p>
        <p className="mb-3 text-xs text-slate-400">
          Add extra fields to collect info from buyers at checkout.
        </p>
        <div className="space-y-2">
          {((checkoutJson.custom_fields as string[]) ?? []).map((field, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={field}
                onChange={(e) => {
                  const fields = [...((checkoutJson.custom_fields as string[]) ?? [])];
                  fields[idx] = e.target.value;
                  onChange({ checkout_json: { ...checkoutJson, custom_fields: fields } });
                }}
                placeholder={`Question ${idx + 1}`}
                className={inputCls("flex-1")}
              />
              <button
                type="button"
                onClick={() => {
                  const fields = [...((checkoutJson.custom_fields as string[]) ?? [])];
                  fields.splice(idx, 1);
                  onChange({ checkout_json: { ...checkoutJson, custom_fields: fields } });
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                title="Remove field"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const fields = [...((checkoutJson.custom_fields as string[]) ?? []), ""];
            onChange({ checkout_json: { ...checkoutJson, custom_fields: fields } });
          }}
          className="mt-3 rounded-xl border-2 px-4 py-2 text-sm font-bold"
          style={{ borderColor: PURPLE, color: PURPLE }}
        >
          + Add Question
        </button>
      </div>
    </div>
  );
}

// ─── Main ProductEditor ───────────────────────────────────────────────────────

type Tab = "details" | "pricing" | "delivery" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "pricing", label: "Pricing" },
  { id: "delivery", label: "Delivery" },
  { id: "settings", label: "Settings" },
];

type Props = {
  productId: string;
};

export default function ProductEditor({ productId }: Props) {
  const [product, setProduct] = useState<DigitalProduct | null>(null);
  const [handle, setHandle] = useState("creator");
  const [tab, setTab] = useState<Tab>("details");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch user handle ──────────────────────────────────────────────────────

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${API_AUTH_BASE}/user`, {
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" ? localStorage.getItem("auth_token") ?? "" : ""
            }`,
          },
        });
        const data = (await res.json().catch(() => ({}))) as {
          user?: { username?: string };
        };
        if (data.user?.username) setHandle(data.user.username.trim() || "creator");
      } catch {
        /* non-critical — fallback to "creator" */
      }
    })();
  }, []);

  // ── Fetch product ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/${productId}`);
        const data = (await res.json().catch(() => ({}))) as {
          product?: DigitalProduct;
          message?: string;
        };
        if (!res.ok) throw new Error(data.message || "Could not load product.");
        if (!cancelled && data.product) {
          setProduct(data.product);
        }
      } catch (e) {
        if (!cancelled) setError(networkErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productId]);

  // ── Fetch discount codes when pricing tab is active ────────────────────────

  useEffect(() => {
    if (tab !== "pricing") return;
    let cancelled = false;
    setLoadingCodes(true);
    void (async () => {
      try {
        const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/${productId}/discount-codes`);
        const data = (await res.json().catch(() => ({}))) as {
          discount_codes?: DiscountCode[];
        };
        if (!cancelled) setDiscountCodes(data.discount_codes ?? []);
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoadingCodes(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productId, tab]);

  // ── Save with debounce ─────────────────────────────────────────────────────

  const save = useCallback(
    async (updates: Partial<DigitalProduct>) => {
      setSaving(true);
      setSaveMsg("");
      try {
        const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/${productId}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });
        const data = (await res.json().catch(() => ({}))) as {
          product?: DigitalProduct;
          message?: string;
        };
        if (!res.ok) throw new Error(data.message || "Save failed.");
        if (data.product) {
          setProduct(data.product);
        }
        setLastSaved(new Date());
      } catch (e) {
        setSaveMsg(networkErrorMessage(e));
      } finally {
        setSaving(false);
      }
    },
    [productId]
  );

  const onChange = useCallback(
    (updates: Partial<DigitalProduct>) => {
      setProduct((prev) => (prev ? { ...prev, ...updates } : prev));
      // Debounced auto-save
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void save(updates);
      }, 500);
    },
    [save]
  );

  const handleSaveNow = () => {
    if (!product) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    void save(product);
  };

  // ── Publish / unpublish ────────────────────────────────────────────────────

  const handlePublishToggle = useCallback(async () => {
    if (!product) return;
    setPublishing(true);
    const action = product.status === "published" ? "unpublish" : "publish";
    try {
      const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/${productId}/${action}`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as { product?: { status: string } };
      if (!res.ok) throw new Error("Toggle failed.");
      setProduct((prev) =>
        prev ? { ...prev, status: data.product?.status ?? (action === "publish" ? "published" : "draft") } : prev
      );
    } catch (e) {
      setSaveMsg(networkErrorMessage(e));
    } finally {
      setPublishing(false);
    }
  }, [product, productId]);

  // ── Discount code CRUD ─────────────────────────────────────────────────────

  const handleAddDiscountCode = useCallback(
    async (code: Omit<DiscountCode, "id" | "use_count">) => {
      const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/discount-codes`, {
        method: "POST",
        body: JSON.stringify({ ...code, product_id: productId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        discount_code?: DiscountCode;
        message?: string;
      };
      if (!res.ok) throw new Error(data.message || "Could not add code.");
      if (data.discount_code) setDiscountCodes((prev) => [...prev, data.discount_code!]);
    },
    [productId]
  );

  const handleDeleteDiscountCode = useCallback(async (codeId: string) => {
    const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/discount-codes/${codeId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(d.message || "Delete failed.");
    }
    setDiscountCodes((prev) => prev.filter((c) => c.id !== codeId));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6b46ff] border-t-transparent" aria-hidden />
        <p className="text-sm text-slate-500">Loading product…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center">
        <p className="font-semibold text-rose-700">{error}</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Error / status */}
        {saveMsg ? (
          <p className="mt-3 text-sm font-medium text-rose-600" role="alert">{saveMsg}</p>
        ) : null}

        {/* Tab content */}
        <div className="mt-6">
          {tab === "details" && (
            <DetailsTab product={product} onChange={onChange} />
          )}
          {tab === "pricing" && (
            <PricingTab
              product={product}
              discountCodes={discountCodes}
              onChange={onChange}
              onAddDiscountCode={handleAddDiscountCode}
              onDeleteDiscountCode={handleDeleteDiscountCode}
              loadingCodes={loadingCodes}
            />
          )}
          {tab === "delivery" && (
            <DeliveryTab product={product} onChange={onChange} />
          )}
          {tab === "settings" && (
            <SettingsTab
              product={product}
              handle={handle}
              onChange={onChange}
              onPublishToggle={handlePublishToggle}
              publishing={publishing}
            />
          )}
        </div>
      </div>

      {/* ── Right panel (sticky) ──────────────────────────────────────────── */}
      <aside className="shrink-0 lg:sticky lg:top-24 lg:w-64">
        {/* Preview card */}
        <ProductPreviewCard product={product} handle={handle} />

        {/* Save */}
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveNow}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-60"
          style={{ backgroundColor: PURPLE }}
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
              Saving…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M17 21v-8H7v8M7 3v5h8" />
              </svg>
              Save Changes
            </>
          )}
        </button>

        {lastSaved && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Last saved {lastSaved.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}

        {/* Back to products */}
        <Link
          href="/dashboard/products"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
          All Products
        </Link>
      </aside>
    </div>
  );
}
