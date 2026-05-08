"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardShell from "./DashboardShell";
import { API_AUTH_BASE } from "../../lib/api";
import { networkErrorMessage } from "../../lib/networkError";
import {
  sanitizeEmailInput,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
  validateUsername,
} from "../../lib/signupValidation";

const COUNTRIES = [
  { flag: "🇮🇳", dial: "+91", label: "India" },
  { flag: "🇺🇸", dial: "+1", label: "United States" },
  { flag: "🇬🇧", dial: "+44", label: "United Kingdom" },
  { flag: "🇦🇺", dial: "+61", label: "Australia" },
  { flag: "🇩🇪", dial: "+49", label: "Germany" },
  { flag: "🇫🇷", dial: "+33", label: "France" },
  { flag: "🇯🇵", dial: "+81", label: "Japan" },
  { flag: "🇧🇷", dial: "+55", label: "Brazil" },
  { flag: "🇲🇽", dial: "+52", label: "Mexico" },
] as const;

export type SettingsUser = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  country_code?: string;
  phone?: string;
  street_address?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  address_country?: string | null;
  show_stan_referral_banner?: boolean | null;
};

type Props = {
  displayName: string;
  handle: string;
  showName: string;
  user: SettingsUser;
  token: string;
  onSignOut: () => void;
  onUserUpdated: (u: SettingsUser) => void;
};

type TabId = "profile" | "integrations" | "billing" | "payments" | "email" | "security";

function inputErrClass(hasError: boolean) {
  return hasError
    ? "border-rose-500 ring-1 ring-rose-100 focus:border-rose-500 focus:ring-rose-100"
    : "border-[#e7dcc9] focus:border-[#b08d57] focus:ring-[#f7f1e6]";
}

function TabIconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.8-4 12.2-4 14 0" />
    </svg>
  );
}

function TabIconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function TabIconDollar({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5c-.5-1-1.6-1.5-2.7-1.5-1.5 0-2.8.9-2.8 2.2 0 1.2 1 1.8 2.8 2 1.8.2 2.8.8 2.8 2.1 0 1.3-1.3 2.2-2.8 2.2-1.2 0-2.4-.6-2.8-1.6M12 6v2M12 16v2" />
    </svg>
  );
}

function TabIconCard({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <path d="M2 11h20M6 15h3" />
    </svg>
  );
}

function TabIconBell({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function TabIconLock({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1 4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function validatePostal(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return "Postal code is required.";
  if (t.length < 2 || t.length > 16) return "Postal code must be between 2 and 16 characters.";
  if (!/^[A-Za-z0-9\s-]+$/.test(t)) return "Use only letters, numbers, spaces, and hyphens.";
  return undefined;
}

function validateAddressLine(raw: string, label: string, maxLen = 120): string | undefined {
  const t = raw.trim();
  if (!t) return `${label} is required.`;
  if (t.length > maxLen) return `${label} is too long.`;
  if (label === "Street address" && t.length < 3) return "Enter a complete street address.";
  return undefined;
}

export default function AccountSettingsClient({
  displayName,
  handle,
  showName,
  user,
  token,
  onSignOut,
  onUserUpdated,
}: Props) {
  const [tab, setTab] = useState<TabId>("profile");

  /** —— Profile —— */
  const [fullName, setFullName] = useState(user.full_name || "");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [countryCode, setCountryCode] = useState(user.country_code || "+91");
  const [phoneNational, setPhoneNational] = useState(() =>
    String(user.phone || "").replace(/\D/g, "")
  );

  /** —— Address —— */
  const [street, setStreet] = useState(user.street_address || "");
  const [city, setCity] = useState(user.city || "");
  const [stateProv, setStateProv] = useState(user.state_province || "");
  const [postal, setPostal] = useState(user.postal_code || "");
  const [addrCountry, setAddrCountry] = useState(user.address_country || "");

  useEffect(() => {
    setFullName(user.full_name || "");
    setUsername(user.username || "");
    setEmail(user.email || "");
    setCountryCode(user.country_code || "+91");
    setPhoneNational(String(user.phone || "").replace(/\D/g, ""));
  }, [user.full_name, user.username, user.email, user.country_code, user.phone]);

  useEffect(() => {
    setStreet(user.street_address || "");
    setCity(user.city || "");
    setStateProv(user.state_province || "");
    setPostal(user.postal_code || "");
    setAddrCountry(user.address_country || "");
  }, [user.street_address, user.city, user.state_province, user.postal_code, user.address_country]);

  const profileSnap = useMemo(
    () => ({
      full_name: (user.full_name || "").trim(),
      username: (user.username || "").trim(),
      email: sanitizeEmailInput(user.email || ""),
      country_code: user.country_code || "+91",
      phone: String(user.phone || "").replace(/\D/g, ""),
    }),
    [user]
  );

  const profileDirty = useMemo(() => {
    return (
      fullName.trim() !== profileSnap.full_name ||
      username.trim().toLowerCase() !== profileSnap.username.toLowerCase() ||
      sanitizeEmailInput(email) !== profileSnap.email ||
      countryCode !== profileSnap.country_code ||
      phoneNational.replace(/\D/g, "") !== profileSnap.phone
    );
  }, [fullName, username, email, countryCode, phoneNational, profileSnap]);

  const [profileErrors, setProfileErrors] = useState<Partial<Record<"fullName" | "username" | "email" | "phone", string>>>(
    {}
  );
  const [usernameLookup, setUsernameLookup] = useState<"idle" | "pending" | "available" | "taken" | "error">("idle");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileBanner, setProfileBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const u = username.trim();
    const initial = (user.username || "").trim().toLowerCase();
    const err = validateUsername(u);
    if (err || !u || u.trim().toLowerCase() === initial) {
      setUsernameLookup("idle");
      return;
    }
    setUsernameLookup("pending");
    const tid = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_AUTH_BASE}/username-available?username=${encodeURIComponent(u.trim())}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = (await res.json().catch(() => ({}))) as { available?: boolean };
        if (!res.ok) {
          setUsernameLookup("error");
          return;
        }
        setUsernameLookup(data.available ? "available" : "taken");
      } catch {
        setUsernameLookup("error");
      }
    }, 420);
    return () => window.clearTimeout(tid);
  }, [username, user.username, token]);

  const validateProfileFields = useCallback(() => {
    const next: typeof profileErrors = {};
    const fn = validateFullName(fullName);
    if (fn) next.fullName = fn;
    const un = validateUsername(username);
    if (un) next.username = un;
    else if (usernameLookup === "taken") next.username = "This username is already taken.";
    else if (usernameLookup === "pending") next.username = "Checking username…";
    else if (usernameLookup === "error") next.username = "Could not verify username. Retry.";
    const em = validateEmail(email);
    if (em) next.email = em;
    const ph = validatePhone(phoneNational, countryCode);
    if (ph) next.phone = ph;
    setProfileErrors(next);
    return Object.keys(next).length === 0 && usernameLookup !== "pending";
  }, [fullName, username, email, phoneNational, countryCode, usernameLookup]);

  const saveProfile = async () => {
    setProfileBanner(null);
    if (!validateProfileFields()) return;
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_AUTH_BASE}/user/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          username: username.trim(),
          email: sanitizeEmailInput(email),
          country_code: countryCode,
          phone: phoneNational.replace(/\D/g, ""),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { user?: SettingsUser; message?: string };
      if (!res.ok) {
        throw new Error(data.message || "Could not update profile.");
      }
      if (data.user) onUserUpdated(data.user);
      setProfileBanner({ type: "ok", text: "Profile updated." });
      window.setTimeout(() => setProfileBanner(null), 4000);
    } catch (e) {
      setProfileBanner({ type: "err", text: networkErrorMessage(e) });
    } finally {
      setProfileSaving(false);
    }
  };

  /** —— Password —— */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [pwErrors, setPwErrors] = useState<Partial<Record<"current" | "new" | "confirm", string>>>({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwBanner, setPwBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const validatePasswordForm = useCallback(() => {
    const next: typeof pwErrors = {};
    if (!currentPw) next.current = "Current password is required.";
    const np = validatePassword(newPw);
    if (np) next.new = np;
    if (!confirmPw) next.confirm = "Confirm your new password.";
    else if (newPw !== confirmPw) next.confirm = "Passwords do not match.";
    setPwErrors(next);
    return Object.keys(next).length === 0;
  }, [currentPw, newPw, confirmPw]);

  const savePassword = async () => {
    setPwBanner(null);
    if (!validatePasswordForm()) return;
    setPwSaving(true);
    try {
      const res = await fetch(`${API_AUTH_BASE}/user/password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPw,
          new_password: newPw,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Could not update password.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwErrors({});
      setPwBanner({ type: "ok", text: data.message || "Password updated." });
      window.setTimeout(() => setPwBanner(null), 4000);
    } catch (e) {
      setPwBanner({ type: "err", text: networkErrorMessage(e) });
    } finally {
      setPwSaving(false);
    }
  };

  const addrSnap = useMemo(
    () => ({
      street_address: (user.street_address || "").trim(),
      city: (user.city || "").trim(),
      state_province: (user.state_province || "").trim(),
      postal_code: (user.postal_code || "").trim(),
      address_country: (user.address_country || "").trim(),
    }),
    [user]
  );

  const addressDirty = useMemo(() => {
    return (
      street.trim() !== addrSnap.street_address ||
      city.trim() !== addrSnap.city ||
      stateProv.trim() !== addrSnap.state_province ||
      postal.trim() !== addrSnap.postal_code ||
      addrCountry.trim() !== addrSnap.address_country
    );
  }, [street, city, stateProv, postal, addrCountry, addrSnap]);

  const [addrErrors, setAddrErrors] = useState<
    Partial<Record<"street" | "city" | "state" | "postal" | "country", string>>
  >({});
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrBanner, setAddrBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const validateAddressForm = useCallback(() => {
    const next: typeof addrErrors = {};
    const s = validateAddressLine(street, "Street address", 500);
    if (s) next.street = s;
    const c = validateAddressLine(city, "City");
    if (c) next.city = c;
    const st = validateAddressLine(stateProv, "State or province");
    if (st) next.state = st;
    const p = validatePostal(postal);
    if (p) next.postal = p;
    const ct = validateAddressLine(addrCountry, "Country");
    if (ct) next.country = ct;
    setAddrErrors(next);
    return Object.keys(next).length === 0;
  }, [street, city, stateProv, postal, addrCountry]);

  const saveAddress = async () => {
    setAddrBanner(null);
    if (!validateAddressForm()) return;
    setAddrSaving(true);
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
          address_country: addrCountry.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { user?: SettingsUser; message?: string };
      if (!res.ok) throw new Error(data.message || "Could not save address.");
      if (data.user) onUserUpdated(data.user);
      setAddrBanner({ type: "ok", text: "Address updated." });
      window.setTimeout(() => setAddrBanner(null), 4000);
    } catch (e) {
      setAddrBanner({ type: "err", text: networkErrorMessage(e) });
    } finally {
      setAddrSaving(false);
    }
  };

  const tabs: { id: TabId; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "profile", label: "Profile", Icon: TabIconUser },
    { id: "integrations", label: "Integrations", Icon: TabIconPlus },
    { id: "billing", label: "Billing", Icon: TabIconDollar },
    { id: "payments", label: "Payments", Icon: TabIconCard },
    { id: "email", label: "Email Notifications", Icon: TabIconBell },
    { id: "security", label: "Security", Icon: TabIconLock },
  ];

  const profileBtnDisabled =
    !profileDirty ||
    profileSaving ||
    usernameLookup === "pending" ||
    usernameLookup === "taken" ||
    usernameLookup === "error";

  return (
    <DashboardShell
      displayName={displayName}
      handle={handle}
      showName={showName}
      onSignOut={onSignOut}
      navContext="settings"
      topLeft={
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">My Account Settings</h1>
      }
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900">
          Heads up, customers can&apos;t purchase from you yet! Please{" "}
          <span className="font-semibold underline underline-offset-2">set up your Direct Deposit</span>{" "}
          to start selling
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors sm:px-4 sm:py-2.5 ${
                  active
                    ? "border-[#c8b8ff] bg-[#eee9ff] text-[#6b46ff] shadow-sm"
                    : "border-transparent bg-transparent text-[#6b46ff] hover:bg-[#f5f1ff]"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                    active ? "border-[#6b46ff] bg-white text-[#6b46ff]" : "border-[#dcd0f7] bg-white text-[#6b46ff]"
                  }`}
                >
                  <t.Icon className="text-[#6b46ff]" />
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 h-px w-full bg-[#e7dcc9]" />

        {tab !== "profile" ? (
          <div className="mt-12 px-6 py-16 text-center">
            <p className="text-base font-semibold text-[#1f2a44]">{tabs.find((x) => x.id === tab)?.label}</p>
            <p className="mt-2 text-sm text-slate-600">This section is not available in this build yet.</p>
            <Link href="/dashboard" className="mt-6 inline-block text-sm font-semibold text-[#6b46ff] underline">
              Back to My Store
            </Link>
          </div>
        ) : (
          <div className="mt-8 divide-y divide-[#e7dcc9]/70 [&>section]:py-8 [&>section:first-child]:pt-2 [&>section:last-child]:pb-2">
            {/* My Profile */}
            <section className="bg-transparent">
              <h2 className="text-lg font-bold text-[#1f2a44]">My Profile</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="settings-name" className="mb-1 block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    id="settings-name"
                    autoComplete="name"
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] text-slate-900 outline-none ring-0 transition ${inputErrClass(
                      Boolean(profileErrors.fullName)
                    )}`}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setProfileErrors((p) => ({ ...p, fullName: undefined }));
                    }}
                    onBlur={() => setProfileErrors((p) => ({ ...p, fullName: validateFullName(fullName) }))}
                  />
                  {profileErrors.fullName ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {profileErrors.fullName}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="settings-username" className="mb-1 block text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <input
                    id="settings-username"
                    autoComplete="username"
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] text-slate-900 outline-none ${inputErrClass(
                      Boolean(profileErrors.username)
                    )}`}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setProfileErrors((p) => ({ ...p, username: undefined }));
                    }}
                    onBlur={() => setProfileErrors((p) => ({ ...p, username: validateUsername(username) }))}
                  />
                  {profileErrors.username ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {profileErrors.username}
                    </p>
                  ) : usernameLookup === "available" && username.trim().toLowerCase() !== profileSnap.username.toLowerCase() ? (
                    <p className="mt-1 text-xs font-medium text-emerald-700">Username is available.</p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="settings-email" className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    autoComplete="email"
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] text-slate-900 outline-none ${inputErrClass(
                      Boolean(profileErrors.email)
                    )}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setProfileErrors((p) => ({ ...p, email: undefined }));
                    }}
                    onBlur={() => setProfileErrors((p) => ({ ...p, email: validateEmail(email) }))}
                  />
                  {profileErrors.email ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {profileErrors.email}
                    </p>
                  ) : null}
                </div>
                <div>
                  <span className="mb-1 block text-sm font-medium text-slate-700">Phone Number</span>
                  <div className="flex gap-2">
                    <select
                      aria-label="Country calling code"
                      className={`shrink-0 rounded-xl border bg-white px-2 py-2.5 text-[15px] outline-none ${inputErrClass(false)}`}
                      value={countryCode}
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        setProfileErrors((p) => ({ ...p, phone: undefined }));
                      }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.dial} value={c.dial}>
                          {c.flag} {c.dial}
                        </option>
                      ))}
                    </select>
                    <input
                      id="settings-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="Phone Number"
                      className={`min-w-0 flex-1 rounded-xl border bg-white px-3 py-2.5 text-[15px] text-slate-900 outline-none ${inputErrClass(
                        Boolean(profileErrors.phone)
                      )}`}
                      value={phoneNational}
                      onChange={(e) => {
                        setPhoneNational(e.target.value.replace(/[^\d\s]/g, ""));
                        setProfileErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      onBlur={() =>
                        setProfileErrors((p) => ({
                          ...p,
                          phone: validatePhone(phoneNational, countryCode),
                        }))
                      }
                    />
                  </div>
                  {profileErrors.phone ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {profileErrors.phone}
                    </p>
                  ) : null}
                </div>
              </div>
              {profileBanner ? (
                <p
                  className={`mt-4 text-sm font-medium ${profileBanner.type === "ok" ? "text-emerald-700" : "text-rose-600"}`}
                  role={profileBanner.type === "err" ? "alert" : "status"}
                >
                  {profileBanner.text}
                </p>
              ) : null}
              <button
                type="button"
                disabled={profileBtnDisabled}
                onClick={() => void saveProfile()}
                className="mt-6 rounded-full border border-[#e7dcc9] bg-[#f3f0ea] px-6 py-2.5 text-sm font-semibold text-slate-700 transition enabled:hover:bg-[#e7dcc9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {profileSaving ? "Updating…" : "Update"}
              </button>
            </section>

            {/* Password */}
            <section className="bg-transparent">
              <h2 className="text-lg font-bold text-[#1f2a44]">Password</h2>
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="settings-cur-pw" className="mb-1 block text-sm font-medium text-slate-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="settings-cur-pw"
                      type={showCur ? "text" : "password"}
                      autoComplete="current-password"
                      className={`w-full rounded-xl border bg-white px-3 py-2.5 pr-11 text-[15px] outline-none ${inputErrClass(Boolean(pwErrors.current))}`}
                      value={currentPw}
                      onChange={(e) => {
                        setCurrentPw(e.target.value);
                        setPwErrors((p) => ({ ...p, current: undefined }));
                      }}
                      onBlur={() =>
                        setPwErrors((p) => ({
                          ...p,
                          current: currentPw ? undefined : "Current password is required.",
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                      onClick={() => setShowCur((s) => !s)}
                      aria-label={showCur ? "Hide password" : "Show password"}
                    >
                      {showCur ? <IconEyeOff className="text-slate-600" /> : <IconEye className="text-slate-400" />}
                    </button>
                  </div>
                  {pwErrors.current ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {pwErrors.current}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="settings-new-pw" className="mb-1 block text-sm font-medium text-slate-700">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="settings-new-pw"
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        className={`w-full rounded-xl border bg-white px-3 py-2.5 pr-11 text-[15px] outline-none ${inputErrClass(Boolean(pwErrors.new))}`}
                        value={newPw}
                        onChange={(e) => {
                          setNewPw(e.target.value.replace(/\s/g, ""));
                          setPwErrors((p) => ({ ...p, new: undefined, confirm: undefined }));
                        }}
                        onBlur={() => {
                          const np = validatePassword(newPw);
                          setPwErrors((p) => ({
                            ...p,
                            new: np,
                            confirm:
                              confirmPw && newPw && confirmPw !== newPw
                                ? "Passwords do not match."
                                : p.confirm,
                          }));
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        onClick={() => setShowNew((s) => !s)}
                        aria-label={showNew ? "Hide password" : "Show password"}
                      >
                        {showNew ? <IconEyeOff className="text-slate-600" /> : <IconEye className="text-slate-400" />}
                      </button>
                    </div>
                    {pwErrors.new ? (
                      <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                        {pwErrors.new}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        At least 8 characters with upper, lower, number, and special character.
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="settings-cf-pw" className="mb-1 block text-sm font-medium text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="settings-cf-pw"
                        type={showCf ? "text" : "password"}
                        autoComplete="new-password"
                        className={`w-full rounded-xl border bg-white px-3 py-2.5 pr-11 text-[15px] outline-none ${inputErrClass(Boolean(pwErrors.confirm))}`}
                        value={confirmPw}
                        onChange={(e) => {
                          setConfirmPw(e.target.value.replace(/\s/g, ""));
                          setPwErrors((p) => ({ ...p, confirm: undefined }));
                        }}
                        onBlur={() =>
                          setPwErrors((p) => ({
                            ...p,
                            confirm: !confirmPw
                              ? "Confirm your new password."
                              : confirmPw !== newPw
                                ? "Passwords do not match."
                                : undefined,
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        onClick={() => setShowCf((s) => !s)}
                        aria-label={showCf ? "Hide password" : "Show password"}
                      >
                        {showCf ? <IconEyeOff className="text-slate-600" /> : <IconEye className="text-slate-400" />}
                      </button>
                    </div>
                    {pwErrors.confirm ? (
                      <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                        {pwErrors.confirm}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              {pwBanner ? (
                <p
                  className={`mt-4 text-sm font-medium ${pwBanner.type === "ok" ? "text-emerald-700" : "text-rose-600"}`}
                  role={pwBanner.type === "err" ? "alert" : "status"}
                >
                  {pwBanner.text}
                </p>
              ) : null}
              <button
                type="button"
                disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                onClick={() => void savePassword()}
                className="mt-6 rounded-full border border-[#e7dcc9] bg-[#f3f0ea] px-6 py-2.5 text-sm font-semibold text-slate-700 transition enabled:hover:bg-[#e7dcc9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pwSaving ? "Updating…" : "Update"}
              </button>
            </section>

            {/* Address */}
            <section className="bg-transparent">
              <h2 className="text-lg font-bold text-[#1f2a44]">Address</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="settings-street" className="mb-1 block text-sm font-medium text-slate-700">
                    Street Address
                  </label>
                  <input
                    id="settings-street"
                    autoComplete="street-address"
                    placeholder="Start typing your address..."
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] outline-none ${inputErrClass(Boolean(addrErrors.street))}`}
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      setAddrErrors((p) => ({ ...p, street: undefined }));
                    }}
                    onBlur={() =>
                      setAddrErrors((p) => ({ ...p, street: validateAddressLine(street, "Street address", 500) }))
                    }
                  />
                  {addrErrors.street ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {addrErrors.street}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="settings-city" className="mb-1 block text-sm font-medium text-slate-700">
                    City
                  </label>
                  <input
                    id="settings-city"
                    autoComplete="address-level2"
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] outline-none ${inputErrClass(Boolean(addrErrors.city))}`}
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setAddrErrors((p) => ({ ...p, city: undefined }));
                    }}
                    onBlur={() =>
                      setAddrErrors((p) => ({ ...p, city: validateAddressLine(city, "City") }))
                    }
                  />
                  {addrErrors.city ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {addrErrors.city}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="settings-state" className="mb-1 block text-sm font-medium text-slate-700">
                    State/Province
                  </label>
                  <input
                    id="settings-state"
                    autoComplete="address-level1"
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] outline-none ${inputErrClass(Boolean(addrErrors.state))}`}
                    value={stateProv}
                    onChange={(e) => {
                      setStateProv(e.target.value);
                      setAddrErrors((p) => ({ ...p, state: undefined }));
                    }}
                    onBlur={() =>
                      setAddrErrors((p) => ({
                        ...p,
                        state: validateAddressLine(stateProv, "State or province"),
                      }))
                    }
                  />
                  {addrErrors.state ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {addrErrors.state}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="settings-postal" className="mb-1 block text-sm font-medium text-slate-700">
                    Postal Code
                  </label>
                  <input
                    id="settings-postal"
                    autoComplete="postal-code"
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] outline-none ${inputErrClass(Boolean(addrErrors.postal))}`}
                    value={postal}
                    onChange={(e) => {
                      setPostal(e.target.value);
                      setAddrErrors((p) => ({ ...p, postal: undefined }));
                    }}
                    onBlur={() => setAddrErrors((p) => ({ ...p, postal: validatePostal(postal) }))}
                  />
                  {addrErrors.postal ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {addrErrors.postal}
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="settings-addr-country" className="mb-1 block text-sm font-medium text-slate-700">
                    Country
                  </label>
                  <input
                    id="settings-addr-country"
                    autoComplete="country-name"
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] outline-none ${inputErrClass(Boolean(addrErrors.country))}`}
                    value={addrCountry}
                    onChange={(e) => {
                      setAddrCountry(e.target.value);
                      setAddrErrors((p) => ({ ...p, country: undefined }));
                    }}
                    onBlur={() =>
                      setAddrErrors((p) => ({ ...p, country: validateAddressLine(addrCountry, "Country") }))
                    }
                  />
                  {addrErrors.country ? (
                    <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                      {addrErrors.country}
                    </p>
                  ) : null}
                </div>
              </div>
              {addrBanner ? (
                <p
                  className={`mt-4 text-sm font-medium ${addrBanner.type === "ok" ? "text-emerald-700" : "text-rose-600"}`}
                  role={addrBanner.type === "err" ? "alert" : "status"}
                >
                  {addrBanner.text}
                </p>
              ) : null}
              <button
                type="button"
                disabled={!addressDirty || addrSaving}
                onClick={() => void saveAddress()}
                className="mt-6 rounded-full border border-[#e7dcc9] bg-[#f3f0ea] px-6 py-2.5 text-sm font-semibold text-slate-700 transition enabled:hover:bg-[#e7dcc9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addrSaving ? "Updating…" : "Update"}
              </button>
            </section>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
