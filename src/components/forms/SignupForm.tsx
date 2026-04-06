"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSignup, { SignupPayload } from "../../hooks/useSignup";

type FormErrors = Partial<Record<keyof SignupPayload | "terms", string>>;

const COUNTRY_CODES = [
  { value: "+1", label: "US (+1)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+61", label: "AU (+61)" },
  { value: "+91", label: "IN (+91)" },
];

const getInitialForm = (): SignupPayload => {
  if (typeof window === "undefined") {
    return {
      username: "",
      fullName: "",
      email: "",
      countryCode: "+91",
      phoneNumber: "",
      password: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    username: params.get("username") ?? "",
    fullName:
      params.get("fullName") ??
      params.get("full_name") ??
      params.get("name") ??
      "",
    email: params.get("email") ?? "",
    countryCode: "+91",
    phoneNumber: params.get("phoneNumber") ?? params.get("phone_number") ?? "",
    password: params.get("password") ?? "",
  };
};

export default function SignupForm() {
  const [form, setForm] = useState<SignupPayload>(getInitialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const { signup, loading, error, successMessage, checkUsernameAvailability, checkingUsername } =
    useSignup();

  const setField = <K extends keyof SignupPayload>(key: K, value: SignupPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const displayUsername = useMemo(
    () => form.username.trim() || "Username",
    [form.username]
  );

  const usernameHint = useMemo(() => {
    const username = form.username.trim();
    if (!username) return "";
    if (username.length < 5) return "Username must be at least 5 characters.";
    if (checkingUsername) return "Checking username...";
    if (usernameAvailable === true) return "Username is available.";
    if (usernameAvailable === false) return "This username is taken.";
    return "";
  }, [form.username, checkingUsername, usernameAvailable]);

  useEffect(() => {
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) {
      sessionStorage.setItem("redirectTo", redirectTo);
    }
  }, [searchParams]);

  useEffect(() => {
    const username = form.username.trim();
    if (!username || username.length < 5) return;

    const timeout = setTimeout(async () => {
      const result = await checkUsernameAvailability(username, form.email);
      setUsernameAvailable(result.available);
    }, 350);

    return () => clearTimeout(timeout);
  }, [form.username, form.email, checkUsernameAvailability]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.username.trim()) {
      nextErrors.username = "Please enter a username.";
    } else if (form.username.trim().length < 5) {
      nextErrors.username = "Username must be at least 5 characters.";
    } else if (!/^[A-Za-z0-9-_]+$/.test(form.username.trim())) {
      nextErrors.username =
        "Username can only contain letters, numbers, dashes & underscores.";
    }

    if (usernameAvailable === false) {
      nextErrors.username = "This username is already taken.";
    }

    if (!form.fullName.trim()) nextErrors.fullName = "Please enter your name.";
    if (!form.email.trim()) {
      nextErrors.email = "Please enter your email.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!form.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Please enter a valid phone number.";
    } else if (!/^\d{7,14}$/.test(form.phoneNumber)) {
      nextErrors.phoneNumber = "Phone number should contain 7 to 14 digits.";
    }
    if (!form.password.trim()) {
      nextErrors.password = "Please enter a password.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    } else if (form.password.length > 48) {
      nextErrors.password = "Password must be less than 48 characters.";
    }
    if (!acceptedTerms) nextErrors.terms = "Please accept the terms to continue.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await signup(form, {
      searchParams: new URLSearchParams(searchParams.toString()),
    });
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-8 sm:py-10">
      <section className="mx-auto w-full max-w-md py-4 sm:py-8">
        <div className="mx-auto mb-8 h-1.5 w-44 rounded-full bg-slate-200">
          <div className="h-full w-1/4 rounded-full bg-indigo-500" />
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-[#1f1b4b] sm:text-3xl">
          Hey @{displayUsername} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-2 text-center text-lg leading-7 text-slate-500 sm:text-xl">
          Let&apos;s monetize your following!
        </p>

        <form className="mt-8 space-y-3.5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white px-4 py-3">
              <span className="mr-2 text-xl leading-none text-slate-400">@</span>
              <span className="text-lg font-semibold text-slate-800 sm:text-xl">stan.store/</span>
              <input
                id="username"
                name="username"
                placeholder="username"
                autoComplete="username"
                className="ml-1 w-full bg-transparent text-lg text-slate-600 outline-none placeholder:text-slate-400 sm:text-xl"
                value={form.username}
                onChange={(e) => {
                  setUsernameAvailable(null);
                  setField("username", e.target.value.replace(/[^A-Za-z0-9-_]/g, ""));
                }}
              />
            </div>
            {errors.username ? (
              <p role="alert" className="text-xs font-medium text-rose-600">
                {errors.username}
              </p>
            ) : usernameHint ? (
              <p
                className={`text-xs font-medium ${
                  usernameAvailable === true ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                {usernameHint}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fullName" className="sr-only">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              placeholder="Full Name"
              autoComplete="name"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:text-xl"
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
            />
            {errors.fullName ? (
              <p role="alert" className="text-xs font-medium text-rose-600">
                {errors.fullName}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:text-xl"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
            {errors.email ? (
              <p role="alert" className="text-xs font-medium text-rose-600">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" className="sr-only">
              Phone Number
            </label>
            <div className="flex items-stretch rounded-xl border border-slate-300 bg-white">
              <select
                name="countryCode"
                aria-label="Country code"
                className="rounded-l-xl border-r border-slate-300 bg-white px-3 text-base text-slate-700 outline-none sm:text-lg"
                value={form.countryCode}
                onChange={(e) => setField("countryCode", e.target.value)}
              >
                {COUNTRY_CODES.map((code) => (
                  <option key={code.value} value={code.value}>
                    {code.value}
                  </option>
                ))}
              </select>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Phone Number"
                autoComplete="tel-national"
                className="w-full rounded-r-xl px-4 py-3 text-lg text-slate-800 outline-none placeholder:text-slate-400 sm:text-xl"
                value={form.phoneNumber}
                onChange={(e) =>
                  setField("phoneNumber", e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
            {errors.phoneNumber ? (
              <p role="alert" className="text-xs font-medium text-rose-600">
                {errors.phoneNumber}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-16 text-lg text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:text-xl"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password ? (
              <p role="alert" className="text-xs font-medium text-rose-600">
                {errors.password}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-300"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                By continuing, you agree to our{" "}
                <a className="font-medium text-indigo-600 underline" href="#">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="font-medium text-indigo-600 underline" href="#">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {errors.terms ? (
              <p role="alert" className="text-xs font-medium text-rose-600">
                {errors.terms}
              </p>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          {successMessage ? (
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || checkingUsername || usernameAvailable === false}
            className="mt-1 w-full rounded-full bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400 sm:text-xl"
          >
            {loading ? "Creating..." : "Next"}
          </button>
        </form>

        <p className="mt-7 text-center text-lg text-slate-600 sm:text-xl">
          Have an account?{" "}
          <a href="/login" className="font-semibold text-indigo-600 underline">
            Login
          </a>
        </p>
      </section>
    </main>
  );
}