"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSignup from "../../hooks/useSignup";
import { API_AUTH_BASE } from "../../lib/api";
import {
  sanitizeEmailInput,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
  validateUsername,
} from "../../lib/signupValidation";

/** India-only signup phone input. */
const COUNTRIES = [
  { flag: "🇮🇳", dial: "+91", label: "India" },
] as const;

type FormState = {
  username: string;
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type UsernameLookup = "idle" | "pending" | "available" | "taken" | "error";

function IconUser({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/** Layout: prior compact scale +5% (≈89% of original full size). */
const fieldClass =
  "flex min-h-[46px] w-full items-center rounded-[10px] border border-slate-200 bg-white px-[11px] outline-none transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100";
/** Same gap after leading icon / @ as email & other fields (icon → text). */
const leadingIconGap = "mr-[6px] flex items-center";
const iconMuted = "shrink-0 text-slate-400";
const inputClass =
  "min-w-0 flex-1 border-0 bg-transparent py-[13px] text-[15px] text-slate-900 outline-none placeholder:text-slate-400";

export default function SignupForm() {
  const [form, setForm] = useState<FormState>({
    username: "",
    fullName: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [usernameLookup, setUsernameLookup] = useState<UsernameLookup>("idle");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, loading, error, successMessage } = useSignup();

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.dial === form.countryCode) ?? COUNTRIES[0],
    [form.countryCode]
  );

  const displayUsername = useMemo(() => {
    const u = form.username.trim();
    return u || "Username";
  }, [form.username]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const next: FieldErrors = {};

    const uErr = validateUsername(form.username);
    if (uErr) next.username = uErr;
    else {
      if (usernameLookup === "taken")
        next.username = "This username is already taken.";
      else if (usernameLookup === "pending")
        next.username =
          "Please wait while we verify username availability.";
      else if (usernameLookup === "error")
        next.username = "Could not verify username. Try again.";
      else if (usernameLookup !== "available")
        next.username = "Please wait for username verification.";
    }

    const nameErr = validateFullName(form.fullName);
    if (nameErr) next.fullName = nameErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) next.email = emailErr;

    const phoneErr = validatePhone(form.phoneNumber, form.countryCode);
    if (phoneErr) next.phoneNumber = phoneErr;

    const passErr = validatePassword(form.password);
    if (passErr) next.password = passErr;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await signup({
      username: form.username.trim(),
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      country_code: form.countryCode,
      phone: form.phoneNumber.replace(/\D/g, ""),
    });
    if (result.success) {
      const redirectTo =
        sessionStorage.getItem("redirectTo") || searchParams.get("redirectTo");
      router.push(redirectTo || "/dashboard");
    }
  };

  useEffect(() => {
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) sessionStorage.setItem("redirectTo", redirectTo);
  }, [searchParams]);

  useEffect(() => {
    const formatErr = validateUsername(form.username);
    if (formatErr) {
      setUsernameLookup("idle");
      return;
    }

    const username = form.username.trim();
    setUsernameLookup("pending");
    const ac = new AbortController();
    const timer = window.setTimeout(() => {
      (async () => {
        try {
          const res = await fetch(
            `${API_AUTH_BASE}/username-available?username=${encodeURIComponent(username)}`,
            { signal: ac.signal }
          );
          const data = (await res.json().catch(() => ({}))) as {
            available?: boolean;
          };
          if (!res.ok) {
            setUsernameLookup("error");
            return;
          }
          setUsernameLookup(data.available ? "available" : "taken");
        } catch (e: unknown) {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setUsernameLookup("error");
        }
      })();
    }, 450);

    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [form.username]);

  const loginHref = form.email.trim()
    ? `/auth/login?email=${encodeURIComponent(form.email.trim())}`
    : "/auth/login";

  return (
    <main className="min-h-screen bg-white px-4 py-[29px] font-sans sm:py-[34px]">
      <section className="mx-auto w-full max-w-[357px] py-2">
        {/* Progress */}
        <div className="mb-[29px] h-[5px] w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 rounded-full bg-violet-600" />
        </div>

        {/* Header — matches reference */}
        <div className="mb-[29px] text-center">
          <h1 className="text-[1.47rem] font-bold leading-tight tracking-tight text-[#1f1b4b] sm:text-[1.68rem]">
            Hey @{displayUsername}{" "}
            <span className="inline-block" aria-hidden>
              👋
            </span>
          </h1>
          <p className="mt-2 text-[1rem] leading-relaxed text-slate-500">
            Launch your store and share one link with your audience.
          </p>
        </div>

        <form className="space-y-[17px]" onSubmit={handleSubmit} noValidate>
          {/* Username: @  mintlin.com/  [username] */}
          <div>
            <div
              className={`${fieldClass} ${
                usernameLookup === "taken" || errors.username
                  ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100"
                  : usernameLookup === "available"
                    ? "border-emerald-300 focus-within:border-emerald-400 focus-within:ring-emerald-100"
                    : ""
              }`}
            >
              <span
                className={`${iconMuted} ${leadingIconGap} select-none text-[1rem] font-normal`}
                aria-hidden
              >
                @
              </span>
              <span className="shrink-0 whitespace-nowrap text-[15px] font-bold text-slate-900">
                mintlin.com/
              </span>
              <input
                id="username"
                name="username"
                type="text"
                suppressHydrationWarning
                autoComplete="username"
                placeholder="username"
                aria-label="Username"
                aria-busy={usernameLookup === "pending"}
                aria-invalid={
                  usernameLookup === "taken" || Boolean(errors.username)
                }
                className={`${inputClass} pr-1`}
                value={form.username}
                onChange={(e) =>
                  setField("username", e.target.value.replace(/\s/g, "").slice(0, 32))
                }
              />
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center"
                aria-live="polite"
              >
                {validateUsername(form.username) ? null : usernameLookup ===
                  "pending" ? (
                  <IconSpinner className="animate-spin text-violet-500" />
                ) : usernameLookup === "available" ? (
                  <span className="text-emerald-600" title="Username available">
                    <IconCheck className="text-emerald-600" />
                  </span>
                ) : null}
              </span>
            </div>
            {errors.username ? (
              <p role="alert" className="mt-1 text-[11.5px] font-medium text-rose-600">
                {errors.username}
              </p>
            ) : usernameLookup === "taken" &&
              !validateUsername(form.username) ? (
              <p role="alert" className="mt-1 text-[11.5px] font-medium text-rose-600">
                This username is already taken.
              </p>
            ) : usernameLookup === "error" &&
              !validateUsername(form.username) ? (
              <p role="alert" className="mt-1 text-[11.5px] font-medium text-rose-600">
                Could not verify username. Try again.
              </p>
            ) : null}
          </div>

          {/* Full name */}
          <div>
            <div className={fieldClass}>
              <span className={`${iconMuted} ${leadingIconGap}`}>
                <IconUser />
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                suppressHydrationWarning
                autoComplete="name"
                placeholder="Full Name"
                aria-label="Full name"
                className={inputClass}
                value={form.fullName}
                onChange={(e) => {
                  const onlyLettersAndSpaces = e.target.value.replace(
                    /[^\p{L}\s]/gu,
                    ""
                  );
                  setField("fullName", onlyLettersAndSpaces.trimStart());
                }}
              />
            </div>
            {errors.fullName ? (
              <p role="alert" className="mt-1 text-[11.5px] font-medium text-rose-600">
                {errors.fullName}
              </p>
            ) : null}
          </div>

          {/* Email */}
          <div>
            <div className={fieldClass}>
              <span className={`${iconMuted} ${leadingIconGap}`}>
                <IconMail />
              </span>
              <input
                id="email"
                name="email"
                type="text"
                suppressHydrationWarning
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="Email"
                aria-label="Email"
                className={inputClass}
                value={form.email}
                onKeyDown={(e) => {
                  if (e.key === " " || e.code === "Space") {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text/plain");
                  const cleaned = sanitizeEmailInput(text);
                  if (text === cleaned) return;
                  e.preventDefault();
                  const el = e.currentTarget;
                  const start = el.selectionStart ?? 0;
                  const end = el.selectionEnd ?? 0;
                  const next = sanitizeEmailInput(
                    `${form.email.slice(0, start)}${cleaned}${form.email.slice(end)}`
                  );
                  setField("email", next);
                  const caret = start + cleaned.length;
                  queueMicrotask(() => {
                    el.setSelectionRange(caret, caret);
                  });
                }}
                onChange={(e) =>
                  setField("email", sanitizeEmailInput(e.target.value))
                }
              />
            </div>
            {errors.email ? (
              <p role="alert" className="mt-1 text-[11.5px] font-medium text-rose-600">
                {errors.email}
              </p>
            ) : null}
          </div>

          {/* Phone: country pill + number */}
          <div>
            <div className={fieldClass}>
              <div className="relative flex shrink-0">
                <div
                  className="flex h-[34px] max-w-[min(100%,6.72rem)] items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 pl-2 pr-1 sm:h-9 sm:max-w-none sm:gap-[5px] sm:pl-2 sm:pr-2"
                  aria-hidden
                >
                  <span className="text-[0.945rem] leading-none sm:text-[1rem]">
                    {selectedCountry.flag}
                  </span>
                  <span className="min-w-0 truncate text-[13.5px] font-semibold tabular-nums text-slate-800">
                    {selectedCountry.dial}
                  </span>
                  <IconChevronDown className="pointer-events-none shrink-0 text-slate-400" />
                </div>
                <select
                  suppressHydrationWarning
                  className="absolute inset-0 cursor-pointer rounded-lg opacity-0"
                  value={form.countryCode}
                  disabled
                  onChange={(e) => {
                    setField("countryCode", e.target.value);
                    setErrors((prev) => {
                      if (prev.phoneNumber === undefined) return prev;
                      const next = { ...prev };
                      delete next.phoneNumber;
                      return next;
                    });
                  }}
                  aria-label="Country and dial code"
                >
                  {COUNTRIES.map((c) => (
                    <option key={`${c.dial}-${c.label}`} value={c.dial}>
                      {c.flag} {c.dial} {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className="mx-2 h-[25px] w-px shrink-0 self-center bg-slate-200 sm:mx-[9px]"
                aria-hidden
              />
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                suppressHydrationWarning
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="Phone Number"
                aria-label="Phone number"
                className={`${inputClass} min-w-0`}
                value={form.phoneNumber}
                onChange={(e) =>
                  setField("phoneNumber", e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
            {errors.phoneNumber ? (
              <p role="alert" className="mt-1 text-[11.5px] font-medium text-rose-600">
                {errors.phoneNumber}
              </p>
            ) : null}
          </div>

          {/* Password */}
          <div>
            <div className={`${fieldClass} pr-2`}>
              <span className={`${iconMuted} ${leadingIconGap}`}>
                <IconLock />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                suppressHydrationWarning
                autoComplete="new-password"
                placeholder="Password"
                aria-label="Password"
                className={`${inputClass} pr-2`}
                value={form.password}
                onChange={(e) =>
                  setField("password", e.target.value.replace(/\s/g, ""))
                }
              />
              <button
                type="button"
                suppressHydrationWarning
                className="flex shrink-0 items-center justify-center rounded-md p-[6px] text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <IconEye className="text-slate-500" />
                ) : (
                  <IconEyeOff className="text-slate-400" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p role="alert" className="mt-1 text-[11.5px] font-medium text-rose-600">
                {errors.password}
              </p>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-md bg-rose-50 px-[11px] py-[9px] text-[13.5px] text-rose-700"
            >
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-md bg-emerald-50 px-[11px] py-[9px] text-[13.5px] text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            suppressHydrationWarning
            disabled={loading}
            className="mt-2 w-full rounded-full bg-violet-600 py-[13px] text-[15px] font-bold text-white shadow-sm transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "…" : "Create account"}
          </button>
        </form>

        {/* <p className="mt-[29px] text-center text-[13.5px] leading-relaxed text-slate-500">
          By continuing, you agree to our{" "}
          <a href="#" className="font-medium text-blue-600 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-blue-600 underline">
            Privacy Policy
          </a>
          .
        </p> */}

        <p className="mt-[21px] text-center text-[15px] text-slate-600">
          Have an account?{" "}
          <a href={loginHref} className="font-medium text-blue-600 underline">
            Login
          </a>
        </p>
      </section>
    </main>
  );
}
