"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardShell from "./DashboardShell";
import { API_AUTH_BASE } from "../../lib/api";
import { networkErrorMessage } from "../../lib/networkError";

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  username?: string;
  full_name?: string;
  country_code?: string;
  phone?: string;
  street_address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  address_country?: string;
};

const TAB_IDS = [
  "profile",
  "integrations",
  "billing",
  "payments",
  "email",
  "security",
] as const;
type TabId = (typeof TAB_IDS)[number];

/** India-only in the UI; always stored with address updates. */
const FIXED_COUNTRY = "India";

/** Profile phone is always India (+91). */
const PROFILE_DIAL_CODE = "+91";

/** Indian mobile: 10 digits, first digit 6–9. Handles pasted +91 / leading 0. */
function sanitizeIndianMobileInput(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("91")) {
    d = d.slice(2);
  }
  if (d.startsWith("0")) {
    d = d.slice(1);
  }
  const m = d.match(/^([6-9]\d{0,9})/);
  return m ? m[1].slice(0, 10) : "";
}

function sanitizePostalInput(raw: string): string {
  return raw.replace(/[^A-Za-z0-9\s-]/g, "").slice(0, 16);
}

/** Mirrors `updateProfileRules` in store-backend auth validators. */
function validateProfileForm(
  fullName: string,
  emailRaw: string,
  phoneDigits: string,
  usernameStored: string,
): {
  fieldErrors: Partial<Record<"full_name" | "email" | "phone", string>>;
  usernameError: string | null;
} {
  const fieldErrors: Partial<Record<"full_name" | "email" | "phone", string>> = {};
  const fn = fullName.trim();
  if (!fn) {
    fieldErrors.full_name = "Full name is required.";
  } else if (!/^[\p{L}\s]+$/u.test(fn)) {
    fieldErrors.full_name =
      "Full name can only contain letters and spaces (no numbers or special characters).";
  }

  const emailTrim = emailRaw.trim();
  if (!emailTrim) {
    fieldErrors.email = "Email is required.";
  } else if (/\s/.test(emailTrim)) {
    fieldErrors.email = "Email cannot contain spaces.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  const mobile = phoneDigits.trim();
  if (!mobile) {
    fieldErrors.phone = "Phone number is required.";
  } else if (!/^[6-9]\d{9}$/.test(mobile)) {
    fieldErrors.phone =
      "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
  }

  const u = usernameStored.trim().toLowerCase();
  let usernameError: string | null = null;
  if (!u) {
    usernameError = "Username is missing from your account.";
  } else if (u.length < 3 || u.length > 32) {
    usernameError = "Username must be between 3 and 32 characters.";
  } else if (/\s/.test(u)) {
    usernameError = "Username cannot contain spaces.";
  }

  return { fieldErrors, usernameError };
}

/** Mirrors `newPasswordRule` in store-backend auth validators. */
function validateNewPasswordStrength(newPassword: string, currentPassword: string): string | null {
  const p = String(newPassword);
  if (!p.trim()) return "New password is required.";
  if (/\s/.test(p)) return "Password cannot contain spaces.";
  if (p.length < 8) return "Password must be at least 8 characters.";
  if (p.length > 64) return "Password must be at most 64 characters.";
  if (!/[a-z]/.test(p)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(p)) return "Password must include an uppercase letter.";
  if (!/\d/.test(p)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(p)) return "Password must include a special character.";
  if (currentPassword && p === currentPassword) {
    return "New password must be different from your current password.";
  }
  return null;
}

/** Mirrors `updateAddressRules` in store-backend auth validators. */
function validateAddressForm(
  street: string,
  city: string,
  stateProv: string,
  postal: string,
): Partial<Record<"street_address" | "city" | "state_province" | "postal_code", string>> {
  const e: Partial<Record<"street_address" | "city" | "state_province" | "postal_code", string>> =
    {};
  const st = street.trim();
  if (!st) {
    e.street_address = "Street address is required.";
  } else if (st.length > 500) {
    e.street_address = "Street address is too long.";
  }

  const c = city.trim();
  if (!c) {
    e.city = "City is required.";
  } else if (c.length > 120) {
    e.city = "City is too long.";
  }

  const sp = stateProv.trim();
  if (!sp) {
    e.state_province = "State or province is required.";
  } else if (sp.length > 120) {
    e.state_province = "State or province is too long.";
  }

  const pc = postal.trim();
  if (!pc) {
    e.postal_code = "Postal code is required.";
  } else if (pc.length < 2 || pc.length > 16) {
    e.postal_code = "Postal code must be between 2 and 16 characters.";
  } else if (!/^[A-Za-z0-9\s-]+$/.test(pc)) {
    e.postal_code = "Postal code can only include letters, numbers, spaces, and hyphens.";
  }

  return e;
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs font-medium text-rose-600" role="alert">
      {message}
    </p>
  );
}

function TabIconProfile({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.8-4 12.2-4 14 0" />
    </svg>
  );
}
function TabIconPlug({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 22v-5M9 8V2M15 8V2M5 11h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-5z" />
    </svg>
  );
}
function TabIconBilling({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 10h6M9 14h4" />
    </svg>
  );
}
function TabIconPayments({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function TabIconMail({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 6h16v12H4V6z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
function TabIconShield({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const TAB_META: Record<TabId, { label: string; Icon: ComponentType<{ className?: string }> }> = {
  profile: { label: "Profile", Icon: TabIconProfile },
  integrations: { label: "Integrations", Icon: TabIconPlug },
  billing: { label: "Billing", Icon: TabIconBilling },
  payments: { label: "Payments", Icon: TabIconPayments },
  email: { label: "Email Notifications", Icon: TabIconMail },
  security: { label: "Security", Icon: TabIconShield },
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
  autoComplete,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const invalid = Boolean(error);
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete ?? "off"}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className={`w-full rounded-lg border bg-white py-2.5 pl-3 pr-11 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 disabled:opacity-50 ${
            invalid
              ? "border-rose-500 ring-2 ring-rose-500/25 focus:border-rose-500 focus:ring-rose-500/30"
              : "border-slate-200 ring-violet-500/30 focus:border-violet-400 focus:ring-2"
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <path d="m1 1 22 22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function inputClass(disabled?: boolean, invalid?: boolean) {
  const ring = invalid
    ? "border-rose-500 ring-2 ring-rose-500/25 focus:border-rose-500 focus:ring-rose-500/30"
    : "border-slate-200 ring-violet-500/30 focus:border-violet-400 focus:ring-2";
  return `w-full rounded-lg border bg-white px-3 py-2.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 ${ring} ${disabled ? "opacity-50" : ""}`;
}

function pillUpdateButton(disabled?: boolean) {
  return `rounded-full px-8 py-2.5 text-sm font-semibold transition ${
    disabled
      ? "cursor-not-allowed bg-slate-200/90 text-slate-500"
      : "bg-slate-200/90 text-slate-700 hover:bg-slate-300/90"
  }`;
}

function formatApiErrorBody(data: unknown, status: number): string {
  const d = data as { message?: string; errors?: Array<{ msg?: string }> };
  if (Array.isArray(d.errors) && d.errors.length) {
    return (
      d.errors
        .map((e) => e.msg)
        .filter(Boolean)
        .join(" ") ||
      d.message ||
      `Request failed (${status}).`
    );
  }
  return d.message || `Request failed (${status}).`;
}

export default function AccountSettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") || "";
  const activeTab: TabId = TAB_IDS.includes(rawTab as TabId) ? (rawTab as TabId) : "profile";

  const setTab = useCallback(
    (id: TabId) => {
      router.replace(`/dashboard/settings?tab=${encodeURIComponent(id)}`, { scroll: false });
    },
    [router],
  );

  const [user, setUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileFieldErrors, setProfileFieldErrors] = useState<
    Partial<Record<"full_name" | "email" | "phone", string>>
  >({});

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwFieldErrors, setPwFieldErrors] = useState<
    Partial<Record<"current_password" | "new_password" | "confirm_password", string>>
  >({});

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateProv, setStateProv] = useState("");
  const [postal, setPostal] = useState("");
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMsg, setAddrMsg] = useState("");
  const [addrErr, setAddrErr] = useState("");
  const [addrFieldErrors, setAddrFieldErrors] = useState<
    Partial<Record<"street_address" | "city" | "state_province" | "postal_code", string>>
  >({});

  const [zoomConnected, setZoomConnected] = useState(false);
  const [zoomEmail, setZoomEmail] = useState<string | null>(null);
  const [zoomLoading, setZoomLoading] = useState(false);
  const [zoomDisconnecting, setZoomDisconnecting] = useState(false);
  const [zoomIntegrationMsg, setZoomIntegrationMsg] = useState("");

  const signOut = useCallback(() => {
    localStorage.removeItem("auth_token");
    router.push("/auth/login");
  }, [router]);

  const shellHandle = (user?.username || "creator").trim() || "creator";
  const shellDisplayName =
    user?.full_name?.trim() || shellHandle.charAt(0).toUpperCase() + shellHandle.slice(1);
  const shellShowName = shellHandle.charAt(0).toUpperCase() + shellHandle.slice(1);

  const loadUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace("/auth/login?redirectTo=/dashboard/settings");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`${API_AUTH_BASE}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as { user?: UserRow; message?: string };
      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        router.replace("/auth/login?redirectTo=/dashboard/settings");
        return;
      }
      if (!res.ok) throw new Error(data.message || "Could not load profile.");
      if (!data.user) throw new Error("No profile data.");
      const u = data.user;
      setUser(u);
      setFullName(u.full_name?.trim() || "");
      setUsername(u.username?.trim() || "");
      setEmail(u.email?.trim() || "");
      setPhoneDigits(sanitizeIndianMobileInput(String(u.phone || "")));
      setStreet(u.street_address?.trim() || "");
      setCity(u.city?.trim() || "");
      setStateProv(u.state_province?.trim() || "");
      setPostal(u.postal_code?.trim() || "");
    } catch (e) {
      setLoadError(networkErrorMessage(e));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (activeTab !== "integrations") return;
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;
    setZoomLoading(true);
    setZoomIntegrationMsg("");
    void fetch(`${API_AUTH_BASE}/zoom/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          connected?: boolean;
          zoomEmail?: string;
        };
        setZoomConnected(Boolean(data.connected));
        setZoomEmail(typeof data.zoomEmail === "string" ? data.zoomEmail : null);
      })
      .catch(() => {
        setZoomConnected(false);
        setZoomEmail(null);
      })
      .finally(() => setZoomLoading(false));
  }, [activeTab]);

  const connectZoom = useCallback(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("auth_token");
    if (!t) {
      router.push("/auth/login?redirectTo=/dashboard/settings?tab=integrations");
      return;
    }
    const returnTo = `/dashboard/settings?tab=integrations`;
    window.location.href = `${API_AUTH_BASE}/zoom/connect?token=${encodeURIComponent(t)}&returnTo=${encodeURIComponent(returnTo)}`;
  }, [router]);

  const disconnectZoom = useCallback(async () => {
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!t) return;
    setZoomDisconnecting(true);
    setZoomIntegrationMsg("");
    try {
      const res = await fetch(`${API_AUTH_BASE}/zoom/disconnect`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        setZoomConnected(false);
        setZoomEmail(null);
        setZoomIntegrationMsg("Zoom account disconnected.");
      } else {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setZoomIntegrationMsg(data.message || "Could not disconnect Zoom.");
      }
    } catch {
      setZoomIntegrationMsg("Could not disconnect Zoom.");
    } finally {
      setZoomDisconnecting(false);
    }
  }, []);

  const saveProfile = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;
    setProfileSaving(true);
    setProfileMsg("");
    setProfileErr("");
    const { fieldErrors, usernameError } = validateProfileForm(
      fullName,
      email,
      phoneDigits,
      username,
    );
    setProfileFieldErrors(fieldErrors);
    setProfileErr(usernameError || "");
    if (usernameError || Object.keys(fieldErrors).length > 0) {
      setProfileSaving(false);
      return;
    }
    const mobile = phoneDigits.trim();
    try {
      const res = await fetch(`${API_AUTH_BASE}/user/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim(),
          country_code: PROFILE_DIAL_CODE,
          phone: mobile,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { user?: UserRow; message?: string };
      if (!res.ok) throw new Error(formatApiErrorBody(data, res.status));
      if (data.user) setUser(data.user);
      setProfileFieldErrors({});
      setProfileMsg("Profile updated.");
      window.setTimeout(() => setProfileMsg(""), 4000);
    } catch (e) {
      setProfileErr(networkErrorMessage(e));
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;
    setPwErr("");
    setPwMsg("");
    const pe: Partial<Record<"current_password" | "new_password" | "confirm_password", string>> =
      {};
    if (!currentPassword.trim()) {
      pe.current_password = "Current password is required.";
    }
    const strengthErr = validateNewPasswordStrength(newPassword, currentPassword);
    if (strengthErr) {
      pe.new_password = strengthErr;
    }
    if (!confirmPassword.trim()) {
      pe.confirm_password = "Confirm your new password.";
    } else if (confirmPassword !== newPassword) {
      pe.confirm_password = "New password and confirmation do not match.";
    }
    setPwFieldErrors(pe);
    if (Object.keys(pe).length > 0) {
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(`${API_AUTH_BASE}/user/password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const errBody = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(formatApiErrorBody(errBody, res.status));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwFieldErrors({});
      setPwMsg("Password updated.");
      window.setTimeout(() => setPwMsg(""), 4000);
    } catch (e) {
      setPwErr(networkErrorMessage(e));
    } finally {
      setPwSaving(false);
    }
  };

  const saveAddress = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;
    setAddrSaving(true);
    setAddrMsg("");
    setAddrErr("");
    const ae = validateAddressForm(street, city, stateProv, postal);
    setAddrFieldErrors(ae);
    if (Object.keys(ae).length > 0) {
      setAddrSaving(false);
      return;
    }
    try {
      const res = await fetch(`${API_AUTH_BASE}/user/address`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          street_address: street.trim(),
          city: city.trim(),
          state_province: stateProv.trim(),
          postal_code: postal.trim(),
          address_country: FIXED_COUNTRY,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { user?: UserRow };
      if (!res.ok) throw new Error(formatApiErrorBody(data, res.status));
      if (data.user) setUser(data.user);
      setAddrFieldErrors({});
      setAddrMsg("Address updated.");
      window.setTimeout(() => setAddrMsg(""), 4000);
    } catch (e) {
      setAddrErr(networkErrorMessage(e));
    } finally {
      setAddrSaving(false);
    }
  };

  const placeholderTab = useMemo(
    () => (
      <div className="py-16 text-center">
        <p className="text-base font-medium text-slate-500">This section is coming soon.</p>
      </div>
    ),
    [],
  );

  if (loading && !user) {
    return (
      <DashboardShell
        displayName={shellDisplayName}
        handle={shellHandle}
        showName={shellShowName}
        onSignOut={signOut}
        navContext="settings"
        topLeft={<h1 className="text-2xl font-bold tracking-tight text-[#1f2a44] sm:text-[1.65rem]">My Account Settings</h1>}
      >
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        </div>
      </DashboardShell>
    );
  }

  if (loadError || !user) {
    return (
      <DashboardShell
        displayName={shellDisplayName}
        handle={shellHandle}
        showName={shellShowName}
        onSignOut={signOut}
        navContext="settings"
        topLeft={<h1 className="text-2xl font-bold tracking-tight text-[#1f2a44] sm:text-[1.65rem]">My Account Settings</h1>}
      >
        <p className="text-center text-rose-600" role="alert">
          {loadError || "Could not load settings."}
        </p>
        <button
          type="button"
          onClick={() => void loadUser()}
          className="mt-6 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Retry
        </button>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      displayName={shellDisplayName}
      handle={shellHandle}
      showName={shellShowName}
      onSignOut={signOut}
      navContext="settings"
      topLeft={<h1 className="text-2xl font-bold tracking-tight text-[#1f2a44] sm:text-[1.65rem]">My Account Settings</h1>}
    >
      <div className="w-full">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-950 sm:px-6">
          Heads up, customers can&apos;t purchase from you yet! Please{" "}
          <Link href="/dashboard/income" className="font-semibold underline underline-offset-2 hover:text-amber-900">
            set up your Direct Deposit
          </Link>{" "}
          to start selling
        </div>

        <div className="mt-6 flex flex-wrap gap-1 border-b border-slate-200">
          {TAB_IDS.map((id) => {
            const { label, Icon } = TAB_META[id];
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 rounded-t-lg border px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
                  active
                    ? "relative z-[1] border-violet-500 border-b-white bg-sky-50 text-violet-800"
                    : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={active ? "text-violet-700" : "text-slate-500"} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {activeTab === "profile" ? (
            <div className="divide-y divide-slate-200/90">
              <section className="pb-12 pt-0">
                <h2 className="text-lg font-bold text-[#1f2a44]">My Profile</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:gap-x-10 xl:gap-x-12">
                  <div className="sm:col-span-1">
                    <label htmlFor="acc-name" className="mb-1.5 block text-sm font-medium text-slate-600">
                      Name
                    </label>
                    <input
                      id="acc-name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setProfileFieldErrors((p) => {
                          const n = { ...p };
                          delete n.full_name;
                          return n;
                        });
                        setProfileErr("");
                      }}
                      aria-invalid={Boolean(profileFieldErrors.full_name)}
                      aria-describedby={profileFieldErrors.full_name ? "acc-name-error" : undefined}
                      className={inputClass(profileSaving, Boolean(profileFieldErrors.full_name))}
                      disabled={profileSaving}
                      autoComplete="name"
                    />
                    <FieldError id="acc-name-error" message={profileFieldErrors.full_name} />
                  </div>
                  <div className="sm:col-span-1">
                    <label htmlFor="acc-email" className="mb-1.5 block text-sm font-medium text-slate-600">
                      Email
                    </label>
                    <input
                      id="acc-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setProfileFieldErrors((p) => {
                          const n = { ...p };
                          delete n.email;
                          return n;
                        });
                        setProfileErr("");
                      }}
                      aria-invalid={Boolean(profileFieldErrors.email)}
                      aria-describedby={profileFieldErrors.email ? "acc-email-error" : undefined}
                      className={inputClass(profileSaving, Boolean(profileFieldErrors.email))}
                      disabled={profileSaving}
                      autoComplete="email"
                    />
                    <FieldError id="acc-email-error" message={profileFieldErrors.email} />
                  </div>
                  <div className="sm:col-span-2 max-w-xl">
                    <span className="mb-1.5 block text-sm font-medium text-slate-600" id="acc-phone-label">
                      Phone Number
                    </span>
                    <div className="flex gap-2">
                      <div
                        className={`flex max-w-[8.5rem] shrink-0 cursor-default items-center rounded-lg border bg-slate-50 px-3 py-2.5 text-[15px] font-medium text-slate-800 ${
                          profileFieldErrors.phone ? "border-rose-500" : "border-slate-200"
                        }`}
                        aria-label="Country code India plus nine one"
                      >
                        IN {PROFILE_DIAL_CODE}
                      </div>
                      <input
                        id="acc-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        maxLength={10}
                        value={phoneDigits}
                        onChange={(e) => {
                          setPhoneDigits(sanitizeIndianMobileInput(e.target.value));
                          setProfileFieldErrors((p) => {
                            const n = { ...p };
                            delete n.phone;
                            return n;
                          });
                          setProfileErr("");
                        }}
                        aria-labelledby="acc-phone-label"
                        aria-invalid={Boolean(profileFieldErrors.phone)}
                        aria-describedby={profileFieldErrors.phone ? "acc-phone-error" : undefined}
                        className={`${inputClass(profileSaving, Boolean(profileFieldErrors.phone))} min-w-0 flex-1`}
                        disabled={profileSaving}
                        placeholder="10-digit mobile"
                      />
                    </div>
                    <FieldError id="acc-phone-error" message={profileFieldErrors.phone} />
                  </div>
                </div>
                {profileErr ? (
                  <p className="mt-4 text-sm font-medium text-rose-600" role="alert">
                    {profileErr}
                  </p>
                ) : null}
                {profileMsg ? (
                  <p className="mt-4 text-sm font-medium text-emerald-700" role="status">
                    {profileMsg}
                  </p>
                ) : null}
                <div className="mt-6">
                  <button
                    type="button"
                    disabled={profileSaving}
                    onClick={() => void saveProfile()}
                    className={pillUpdateButton(profileSaving)}
                  >
                    Update
                  </button>
                </div>
              </section>

              <section className="pb-12 pt-12">
                <h2 className="text-lg font-bold text-[#1f2a44]">Password</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-600">
                  New password must be 8–64 characters and include uppercase, lowercase, a number, and a special
                  character. Spaces are not allowed.
                </p>
                <div className="mt-6 space-y-5">
                  <PasswordField
                    id="acc-cur-pw"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(v) => {
                      setCurrentPassword(v);
                      setPwFieldErrors((p) => {
                        const n = { ...p };
                        delete n.current_password;
                        return n;
                      });
                      setPwErr("");
                    }}
                    disabled={pwSaving}
                    error={pwFieldErrors.current_password}
                    autoComplete="current-password"
                    className="w-full"
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <PasswordField
                      id="acc-new-pw"
                      label="New Password"
                      value={newPassword}
                      onChange={(v) => {
                        setNewPassword(v);
                        setPwFieldErrors((p) => {
                          const n = { ...p };
                          delete n.new_password;
                          return n;
                        });
                        setPwErr("");
                      }}
                      disabled={pwSaving}
                      error={pwFieldErrors.new_password}
                      autoComplete="new-password"
                      className="min-w-0"
                    />
                    <PasswordField
                      id="acc-confirm-pw"
                      label="Confirm Password"
                      value={confirmPassword}
                      onChange={(v) => {
                        setConfirmPassword(v);
                        setPwFieldErrors((p) => {
                          const n = { ...p };
                          delete n.confirm_password;
                          return n;
                        });
                        setPwErr("");
                      }}
                      disabled={pwSaving}
                      error={pwFieldErrors.confirm_password}
                      autoComplete="new-password"
                      className="min-w-0"
                    />
                  </div>
                </div>
                {pwErr ? (
                  <p className="mt-4 text-sm font-medium text-rose-600" role="alert">
                    {pwErr}
                  </p>
                ) : null}
                {pwMsg ? (
                  <p className="mt-4 text-sm font-medium text-emerald-700" role="status">
                    {pwMsg}
                  </p>
                ) : null}
                <div className="mt-6">
                  <button
                    type="button"
                    disabled={pwSaving}
                    onClick={() => void savePassword()}
                    className={pillUpdateButton(pwSaving)}
                  >
                    Update
                  </button>
                </div>
              </section>

              <section className="pb-12 pt-12">
                <h2 className="text-lg font-bold text-[#1f2a44]">Address</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:gap-x-10 xl:gap-x-12">
                  <div className="sm:col-span-1">
                    <label htmlFor="acc-street" className="mb-1.5 block text-sm font-medium text-slate-600">
                      Street Address
                    </label>
                    <input
                      id="acc-street"
                      value={street}
                      onChange={(e) => {
                        setStreet(e.target.value);
                        setAddrFieldErrors((p) => {
                          const n = { ...p };
                          delete n.street_address;
                          return n;
                        });
                        setAddrErr("");
                      }}
                      placeholder="Start typing your address..."
                      aria-invalid={Boolean(addrFieldErrors.street_address)}
                      aria-describedby={addrFieldErrors.street_address ? "acc-street-error" : undefined}
                      className={inputClass(addrSaving, Boolean(addrFieldErrors.street_address))}
                      disabled={addrSaving}
                      autoComplete="street-address"
                    />
                    <FieldError id="acc-street-error" message={addrFieldErrors.street_address} />
                  </div>
                  <div className="sm:col-span-1">
                    <label htmlFor="acc-city" className="mb-1.5 block text-sm font-medium text-slate-600">
                      City
                    </label>
                    <input
                      id="acc-city"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setAddrFieldErrors((p) => {
                          const n = { ...p };
                          delete n.city;
                          return n;
                        });
                        setAddrErr("");
                      }}
                      aria-invalid={Boolean(addrFieldErrors.city)}
                      aria-describedby={addrFieldErrors.city ? "acc-city-error" : undefined}
                      className={inputClass(addrSaving, Boolean(addrFieldErrors.city))}
                      disabled={addrSaving}
                      autoComplete="address-level2"
                    />
                    <FieldError id="acc-city-error" message={addrFieldErrors.city} />
                  </div>
                  <div className="sm:col-span-1">
                    <label htmlFor="acc-state" className="mb-1.5 block text-sm font-medium text-slate-600">
                      State/Province
                    </label>
                    <input
                      id="acc-state"
                      value={stateProv}
                      onChange={(e) => {
                        setStateProv(e.target.value);
                        setAddrFieldErrors((p) => {
                          const n = { ...p };
                          delete n.state_province;
                          return n;
                        });
                        setAddrErr("");
                      }}
                      aria-invalid={Boolean(addrFieldErrors.state_province)}
                      aria-describedby={addrFieldErrors.state_province ? "acc-state-error" : undefined}
                      className={inputClass(addrSaving, Boolean(addrFieldErrors.state_province))}
                      disabled={addrSaving}
                      autoComplete="address-level1"
                    />
                    <FieldError id="acc-state-error" message={addrFieldErrors.state_province} />
                  </div>
                  <div className="sm:col-span-1">
                    <label htmlFor="acc-postal" className="mb-1.5 block text-sm font-medium text-slate-600">
                      Postal Code
                    </label>
                    <input
                      id="acc-postal"
                      value={postal}
                      onChange={(e) => {
                        setPostal(sanitizePostalInput(e.target.value));
                        setAddrFieldErrors((p) => {
                          const n = { ...p };
                          delete n.postal_code;
                          return n;
                        });
                        setAddrErr("");
                      }}
                      aria-invalid={Boolean(addrFieldErrors.postal_code)}
                      aria-describedby={addrFieldErrors.postal_code ? "acc-postal-error" : undefined}
                      className={inputClass(addrSaving, Boolean(addrFieldErrors.postal_code))}
                      disabled={addrSaving}
                      autoComplete="postal-code"
                    />
                    <FieldError id="acc-postal-error" message={addrFieldErrors.postal_code} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="acc-country" className="mb-1.5 block text-sm font-medium text-slate-600">
                      Country
                    </label>
                    <input
                      id="acc-country"
                      type="text"
                      value={FIXED_COUNTRY}
                      readOnly
                      disabled
                      tabIndex={-1}
                      className={inputClass(true)}
                      aria-readonly="true"
                      autoComplete="country-name"
                    />
                  </div>
                </div>
                {addrErr ? (
                  <p className="mt-4 text-sm font-medium text-rose-600" role="alert">
                    {addrErr}
                  </p>
                ) : null}
                {addrMsg ? (
                  <p className="mt-4 text-sm font-medium text-emerald-700" role="status">
                    {addrMsg}
                  </p>
                ) : null}
                <div className="mt-6">
                  <button
                    type="button"
                    disabled={addrSaving}
                    onClick={() => void saveAddress()}
                    className={pillUpdateButton(addrSaving)}
                  >
                    Update
                  </button>
                </div>
              </section>
            </div>
          ) : activeTab === "integrations" ? (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#1f2a44]">Zoom</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Connect your Zoom account so webinar purchases create meetings on your host account and cloud
                  recordings can be delivered to buyers.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                {zoomLoading ? (
                  <p className="text-sm text-slate-500">Loading connection status…</p>
                ) : zoomConnected ? (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-emerald-800">
                      Connected
                      {zoomEmail ? (
                        <span className="mt-1 block font-normal text-slate-700">
                          Zoom account: {zoomEmail}
                        </span>
                      ) : null}
                    </p>
                    <button
                      type="button"
                      disabled={zoomDisconnecting}
                      onClick={() => void disconnectZoom()}
                      className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                    >
                      {zoomDisconnecting ? "Disconnecting…" : "Disconnect Zoom"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">No Zoom account linked.</p>
                    <button
                      type="button"
                      onClick={connectZoom}
                      className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      Connect Zoom account
                    </button>
                  </div>
                )}
                {zoomIntegrationMsg ? (
                  <p className="mt-4 text-sm text-slate-700" role="status">
                    {zoomIntegrationMsg}
                  </p>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">
                OAuth tokens are stored encrypted on the server and are never exposed to the browser.
              </p>
            </div>
          ) : activeTab === "security" ? (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">
                Change your password in the <strong>Profile</strong> tab under &quot;Password&quot;.
              </p>
              {placeholderTab}
            </div>
          ) : (
            placeholderTab
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
