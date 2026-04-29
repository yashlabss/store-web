"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { API_PUBLIC_BASE } from "../../lib/api";

const COUNTRY_CODES = [
  { label: "India (+91)", value: "+91" },
  { label: "United States (+1)", value: "+1" },
  { label: "United Kingdom (+44)", value: "+44" },
  { label: "UAE (+971)", value: "+971" },
  { label: "Singapore (+65)", value: "+65" },
];
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

type FormState = {
  full_name: string;
  email: string;
  country_code: string;
  phone: string;
  address: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function BuyerSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => searchParams.get("redirectTo") || "/",
    [searchParams]
  );
  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    country_code: "+91",
    phone: "",
    address: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (submitError) setSubmitError("");
  };

  const validate = () => {
    const next: FieldErrors = {};
    const name = form.full_name.trim();
    const email = form.email.trim();
    const address = form.address.trim();
    const digitsOnly = form.phone.replace(/\D/g, "");
    const phoneCandidate = `${form.country_code}${digitsOnly}`;

    if (name.length < 2) next.full_name = "Name must be at least 2 characters.";
    if (!GMAIL_REGEX.test(email)) {
      next.email = "Enter a valid Gmail address (example@gmail.com).";
    }
    if (!digitsOnly) {
      next.phone = "Phone number is required.";
    } else if (form.country_code === "+91" && digitsOnly.length !== 10) {
      next.phone = "For India (+91), phone number must be exactly 10 digits.";
    } else {
      const parsed = parsePhoneNumberFromString(phoneCandidate);
      if (!parsed || !parsed.isValid()) {
        next.phone = "Enter a valid phone number for selected country.";
      }
    }
    if (address.length < 5) next.address = "Address must be at least 5 characters.";
    if (/\s/.test(form.password)) {
      next.password = "Password cannot contain spaces.";
    } else if (form.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(form.password)) {
      next.password = "Password must include at least one uppercase letter.";
    } else if (!/[a-z]/.test(form.password)) {
      next.password = "Password must include at least one lowercase letter.";
    } else if (!/\d/.test(form.password)) {
      next.password = "Password must include at least one number.";
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      next.password = "Password must include at least one special character.";
    }

    setErrors(next);
    return {
      ok: Object.keys(next).length === 0,
      phoneCandidate,
    };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const validation = validate();
    if (!validation.ok) return;
    const parsed = parsePhoneNumberFromString(validation.phoneCandidate);
    if (!parsed || !parsed.isValid()) {
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid phone number for selected country.",
      }));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_PUBLIC_BASE}/buyer/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: parsed.number,
          address: form.address.trim(),
          password: form.password,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fallback =
          res.status === 404
            ? "Buyer signup API not found. Restart store-backend server."
            : "Signup failed.";
        throw new Error(json.message || fallback);
      }
      localStorage.setItem("buyer_auth_token", String(json.token || ""));
      router.replace(redirectTo);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-8">
      <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create buyer account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Required fields: email, phone, name, address, password.
        </p>
        <form className="mt-6 space-y-3 sm:space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-400"
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setField("full_name", e.target.value)}
              autoComplete="name"
            />
            {errors.full_name ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.full_name}</p>
            ) : null}
          </div>
          <div>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-400"
              type="email"
              placeholder="Gmail (example@gmail.com)"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              autoComplete="email"
            />
            {errors.email ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>
            ) : null}
          </div>
          <div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={form.country_code}
                onChange={(e) => setField("country_code", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-indigo-400 sm:w-[190px]"
                aria-label="Country code"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value.replace(/[^\d]/g, ""))}
                autoComplete="tel-national"
                inputMode="numeric"
              />
            </div>
            {errors.phone ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.phone}</p>
            ) : null}
          </div>
          <div>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-400"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              autoComplete="street-address"
            />
            {errors.address ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.address}</p>
            ) : null}
          </div>
          <div>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-sm outline-none focus:border-indigo-400"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Use 8+ chars with uppercase, lowercase, number, and special character.
              </p>
            )}
          </div>
          {submitError ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400">
            {busy ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have account?{" "}
          <Link href={`/buyer/login?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-semibold text-indigo-600 underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
