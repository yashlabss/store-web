"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useLogin from "../../hooks/useLogin";

type FormState = {
  email: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function LoginForm() {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error, successMessage } = useLogin();

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: FieldErrors = {};
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!form.password) {
      next.password = "Password is required.";
    } else if (form.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form);
    if (result.success) {
      const redirectTo =
        sessionStorage.getItem("redirectTo") || searchParams.get("redirectTo");
      sessionStorage.removeItem("redirectTo");
      router.replace(redirectTo || "/dashboard");
    }
  };

  useEffect(() => {
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) sessionStorage.setItem("redirectTo", redirectTo);
  }, [searchParams]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setForm((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#faf8f4] via-[#f4f5f7] to-[#f4f5f7] px-4 py-8 sm:py-10">
      <section className="mx-auto w-full max-w-md py-4 sm:py-8">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Mintln</p>
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-base font-bold text-white shadow-md shadow-indigo-600/25">
              M
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1f2a44] sm:text-4xl">
            Welcome back, creator
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-slate-600">
            Sign in to tweak products, check orders, and keep your digital storefront humming.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              suppressHydrationWarning
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="you@example.com"
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
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                suppressHydrationWarning
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-16 text-lg text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
              />
              <button
                type="button"
                suppressHydrationWarning
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password ? (
              <p role="alert" className="text-xs font-medium text-rose-600">
                {errors.password}
              </p>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
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
            suppressHydrationWarning
            disabled={loading}
            className="w-full rounded-full bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
          >
            {loading ? "Opening your dashboard…" : "Go to my store"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm leading-relaxed text-slate-600">
          New to Mintln?{" "}
          <a href="/signup" className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-500">
            Launch your store in minutes
          </a>
        </p>
      </section>
    </main>
  );
}
