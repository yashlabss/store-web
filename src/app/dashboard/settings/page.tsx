"use client";

import { useCallback, useEffect, useState } from "react";
import {
  API_AUTH_BASE,
  API_INTEGRATIONS_BASE,
  API_PAYMENTS_BASE,
  authFetch,
} from "../../../lib/api";
import { networkErrorMessage } from "../../../lib/networkError";
import SetupRequiredCard from "../../../components/common/SetupRequiredCard";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  username?: string;
  full_name?: string;
};

// UserRow is used by sub-tabs (StoreProfileTab, AccountSecurityTab)

type PaymentSettings = {
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  razorpay_connected?: boolean;
  upi_id?: string;
  upi_display_name?: string;
  bank_account_holder?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_name?: string;
};

type StoreProfile = {
  store_name?: string;
  store_description?: string;
  profile_picture_url?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_youtube?: string;
  social_website?: string;
};

type NotificationSettings = {
  email_new_order?: boolean;
  email_new_subscriber?: boolean;
  email_payout_ready?: boolean;
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium text-white shadow-2xl transition-all ${
        type === "success" ? "bg-emerald-600" : "bg-rose-600"
      }`}
    >
      {type === "success" ? (
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";

// ─── Tab: Payment Setup ───────────────────────────────────────────────────────

function PaymentTab({
  onToast,
}: {
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const [settings, setSettings] = useState<PaymentSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [integrationHint, setIntegrationHint] = useState<{
    message: string;
    action_url?: string;
    action_label?: string;
  } | null>(null);

  useEffect(() => {
    authFetch(`${API_PAYMENTS_BASE}/settings`)
      .then((r) => r.json())
      .then((json) => setSettings(json as PaymentSettings))
      .catch(() => {})
      .finally(() => setLoading(false));

    authFetch(`${API_INTEGRATIONS_BASE}/status`)
      .then((r) => r.json())
      .then((json) => {
        const hint = (json as { integrations?: { payments?: { razorpay?: { configured?: boolean; action_url?: string; action_label?: string } } } }).integrations;
        if (hint?.payments?.razorpay?.configured === false) {
          setIntegrationHint({
            message: "Razorpay is not connected yet. Checkout can still show, but payments will require setup.",
            action_url: hint.payments.razorpay.action_url,
            action_label: hint.payments.razorpay.action_label,
          });
        }
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await authFetch(`${API_PAYMENTS_BASE}/settings`, {
        method: "POST",
        body: JSON.stringify(settings),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (json as { message?: string }).message || "Save failed."
        );
      onToast("Payment settings saved!", "success");
      setSettings((prev) => ({
        ...prev,
        razorpay_connected: Boolean(
          settings.razorpay_key_id && settings.razorpay_key_secret
        ),
      }));
    } catch (e) {
      onToast(networkErrorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {integrationHint ? (
        <SetupRequiredCard
          message={integrationHint.message}
          actionUrl={integrationHint.action_url}
          actionLabel={integrationHint.action_label}
        />
      ) : null}
      {/* Razorpay */}
      <SectionCard
        title="Razorpay"
        subtitle="Accept card, UPI, and netbanking payments"
        icon="💳"
      >
        <div
          className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            settings.razorpay_connected
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              settings.razorpay_connected ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {settings.razorpay_connected ? "Connected" : "Not Connected"}
        </div>

        <div className="space-y-3">
          <Field label="Razorpay Key ID">
            <input
              type="text"
              value={settings.razorpay_key_id ?? ""}
              onChange={(e) =>
                setSettings((p) => ({ ...p, razorpay_key_id: e.target.value }))
              }
              placeholder="rzp_live_xxxxxxxxxxxx"
              className={inputCls}
            />
          </Field>
          <Field label="Razorpay Key Secret">
            <input
              type="password"
              value={settings.razorpay_key_secret ?? ""}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  razorpay_key_secret: e.target.value,
                }))
              }
              placeholder="••••••••••••••••••••"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <a
            href="https://razorpay.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-violet-600 hover:underline"
          >
            Need an account? Create one at razorpay.com →
          </a>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Connecting…" : "Connect Razorpay"}
          </button>
        </div>
      </SectionCard>

      {/* UPI */}
      <SectionCard
        title="UPI Direct Payment"
        subtitle="Accept UPI payments directly to your UPI ID"
        icon="🟣"
      >
        <div className="space-y-3">
          <Field label="Your UPI ID">
            <input
              type="text"
              value={settings.upi_id ?? ""}
              onChange={(e) =>
                setSettings((p) => ({ ...p, upi_id: e.target.value }))
              }
              placeholder="yourname@upi"
              className={inputCls}
            />
          </Field>
          <Field label="Display Name">
            <input
              type="text"
              value={settings.upi_display_name ?? ""}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  upi_display_name: e.target.value,
                }))
              }
              placeholder="Your Name / Business Name"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save UPI Settings"}
          </button>
        </div>
      </SectionCard>

      {/* Bank Account */}
      <SectionCard
        title="Bank Account"
        subtitle="For payouts and settlements"
        icon="🏦"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Account Holder Name">
            <input
              type="text"
              value={settings.bank_account_holder ?? ""}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  bank_account_holder: e.target.value,
                }))
              }
              placeholder="Full name as on account"
              className={inputCls}
            />
          </Field>
          <Field label="Account Number">
            <input
              type="text"
              value={settings.bank_account_number ?? ""}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  bank_account_number: e.target.value,
                }))
              }
              placeholder="XXXXXXXXXXXXXXXX"
              className={inputCls}
            />
          </Field>
          <Field label="IFSC Code">
            <input
              type="text"
              value={settings.bank_ifsc ?? ""}
              onChange={(e) =>
                setSettings((p) => ({ ...p, bank_ifsc: e.target.value }))
              }
              placeholder="SBIN0000123"
              className={inputCls}
            />
          </Field>
          <Field label="Bank Name">
            <input
              type="text"
              value={settings.bank_name ?? ""}
              onChange={(e) =>
                setSettings((p) => ({ ...p, bank_name: e.target.value }))
              }
              placeholder="State Bank of India"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Bank Details"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Store Profile ───────────────────────────────────────────────────────

function StoreProfileTab({
  user,
  onToast,
}: {
  user: UserRow;
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const [profile, setProfile] = useState<StoreProfile>({
    store_name: user.full_name ?? "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authFetch(`${API_AUTH_BASE}/profile`)
      .then((r) => r.json())
      .then((json) => {
        if (json && typeof json === "object") setProfile(json as StoreProfile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await authFetch(`${API_AUTH_BASE}/profile`, {
        method: "POST",
        body: JSON.stringify(profile),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error((json as { message?: string }).message || "Save failed.");
      onToast("Store profile saved!", "success");
    } catch (e) {
      onToast(networkErrorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <Field label="Store Name">
          <input
            type="text"
            value={profile.store_name ?? ""}
            onChange={(e) =>
              setProfile((p) => ({ ...p, store_name: e.target.value }))
            }
            placeholder="My Awesome Store"
            className={inputCls}
          />
        </Field>
        <Field label="Store Description">
          <textarea
            value={profile.store_description ?? ""}
            onChange={(e) =>
              setProfile((p) => ({ ...p, store_description: e.target.value }))
            }
            rows={3}
            placeholder="Tell buyers about your store…"
            className={`${inputCls} resize-none`}
          />
        </Field>
        <Field label="Profile Picture URL">
          <input
            type="url"
            value={profile.profile_picture_url ?? ""}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                profile_picture_url: e.target.value,
              }))
            }
            placeholder="https://…"
            className={inputCls}
          />
        </Field>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Social Links
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                key: "social_instagram" as keyof StoreProfile,
                label: "Instagram",
                placeholder: "https://instagram.com/…",
              },
              {
                key: "social_twitter" as keyof StoreProfile,
                label: "Twitter / X",
                placeholder: "https://x.com/…",
              },
              {
                key: "social_youtube" as keyof StoreProfile,
                label: "YouTube",
                placeholder: "https://youtube.com/…",
              },
              {
                key: "social_website" as keyof StoreProfile,
                label: "Website",
                placeholder: "https://…",
              },
            ].map((f) => (
              <Field key={f.key} label={f.label}>
                <input
                  type="url"
                  value={(profile[f.key] as string) ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  className={inputCls}
                />
              </Field>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Account & Security ──────────────────────────────────────────────────

function AccountSecurityTab({
  user,
  onToast,
}: {
  user: UserRow;
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  const changePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("All fields are required.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    setPwError("");
    setPwSaving(true);
    try {
      const res = await authFetch(`${API_AUTH_BASE}/change-password`, {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPw,
          new_password: newPw,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (json as { message?: string }).message || "Password change failed."
        );
      onToast("Password changed successfully!", "success");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e) {
      setPwError(networkErrorMessage(e));
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Email */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-[15px] font-semibold text-slate-900">
          Email Address
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="email"
            value={user.email}
            readOnly
            className={`${inputCls} cursor-not-allowed bg-slate-50 text-slate-500`}
          />
          <span className="shrink-0 text-xs text-slate-400">
            Contact support to change
          </span>
        </div>
      </div>

      {/* Password */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-semibold text-slate-900">
          Change Password
        </h3>
        <div className="space-y-3">
          <Field label="Current Password">
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
          </Field>
          <Field label="New Password">
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Min. 8 characters"
              className={inputCls}
            />
          </Field>
          <Field label="Confirm New Password">
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Repeat new password"
              className={inputCls}
            />
          </Field>
          {pwError && <p className="text-xs text-rose-600">{pwError}</p>}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void changePassword()}
            disabled={pwSaving}
            className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {pwSaving ? "Changing…" : "Change Password"}
          </button>
        </div>
      </div>

      {/* 2FA Placeholder */}
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
          🔐
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Two-Factor Authentication
        </p>
        <p className="mt-1 text-xs text-slate-400">Coming soon</p>
      </div>
    </div>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────

function NotificationsTab() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_new_order: true,
    email_new_subscriber: true,
    email_payout_ready: true,
  });

  const Toggle = ({
    label,
    description,
    field,
  }: {
    label: string;
    description: string;
    field: keyof NotificationSettings;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() =>
          setSettings((p) => ({ ...p, [field]: !p[field] }))
        }
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          settings[field] ? "bg-violet-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            settings[field] ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-[15px] font-semibold text-slate-900">
        Email Notifications
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Email me when…
      </p>
      <div className="divide-y divide-slate-100">
        <Toggle
          label="New Order"
          description="When a buyer completes a purchase"
          field="email_new_order"
        />
        <Toggle
          label="New Subscriber"
          description="When someone subscribes to your audience"
          field="email_new_subscriber"
        />
        <Toggle
          label="Payout Ready"
          description="When a payout is processed to your bank"
          field="email_payout_ready"
        />
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-xs text-slate-400">
          Advanced notification settings coming soon
        </p>
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

type SettingsTab = "payment" | "profile" | "security" | "notifications";

export default function SettingsPage() {
  const [user, setUser] = useState<UserRow | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("payment");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUser = useCallback(async () => {
    try {
      const res = await authFetch(`${API_AUTH_BASE}/user`);
      const d = (await res.json().catch(() => ({}))) as {
        user?: UserRow;
        message?: string;
      };
      if (res.ok && d.user) setUser(d.user);
    } catch {
      /* layout handles auth redirect */
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "payment", label: "Payment Setup" },
    { id: "profile", label: "Store Profile" },
    { id: "security", label: "Account & Security" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div>
      {/* Tab nav */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === t.id
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "payment" && <PaymentTab onToast={showToast} />}
      {activeTab === "profile" && user && (
        <StoreProfileTab user={user} onToast={showToast} />
      )}
      {activeTab === "security" && user && (
        <AccountSecurityTab user={user} onToast={showToast} />
      )}
      {activeTab === "notifications" && <NotificationsTab />}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
