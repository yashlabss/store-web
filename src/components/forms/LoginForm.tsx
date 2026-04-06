"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useLogin from "../../hooks/useLogin";

type LoginFormState = {
  emailOrUsername: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginFormState, string>>;

const getInitialForm = (): LoginFormState => {
  if (typeof window === "undefined") {
    return {
      emailOrUsername: "",
      password: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    emailOrUsername: params.get("email") ?? params.get("username") ?? "",
    password: "",
  };
};

export default function LoginForm() {
  const [form, setForm] = useState<LoginFormState>(getInitialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error, successMessage } = useLogin();

  const setField = <K extends keyof LoginFormState>(
    key: K,
    value: LoginFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const nextErrors: LoginErrors = {};

    if (!form.emailOrUsername.trim()) {
      nextErrors.emailOrUsername = "Please enter your email or username.";
    } else if (
      form.emailOrUsername.includes("@") &&
      !/^\S+@\S+\.\S+$/.test(form.emailOrUsername)
    ) {
      nextErrors.emailOrUsername = "Please enter a valid email address.";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Please enter your password.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    } else if (form.password.length > 48) {
      nextErrors.password = "Password must be less than 48 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form);
    if (result.success) {
      const redirectTo =
        sessionStorage.getItem("redirectTo") || searchParams.get("redirectTo");
      router.push(redirectTo || "/dashboard");
    }
  };

  useEffect(() => {
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) {
      sessionStorage.setItem("redirectTo", redirectTo);
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-8 sm:py-10">
      <section className="mx-auto w-full max-w-md py-4 sm:py-8">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="inline-block h-8 w-8 rounded-full bg-indigo-600" />
            <span className="text-3xl font-bold text-slate-900">Stan</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1f1b4b] sm:text-4xl">
            Get your bag <span aria-hidden="true">💰💸😤</span>
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="emailOrUsername" className="sr-only">
              Email or Username
            </label>
            <input
              id="emailOrUsername"
              name="emailOrUsername"
              type="text"
              autoComplete="username"
              placeholder="Email or Username"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              value={form.emailOrUsername}
              onChange={(e) => setField("emailOrUsername", e.target.value)}
            />
            {errors.emailOrUsername ? (
              <p role="alert" className="text-xs font-medium text-rose-600">
                {errors.emailOrUsername}
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
                autoComplete="current-password"
                placeholder="Password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-16 text-lg text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
            disabled={loading}
            className="w-full rounded-full bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-indigo-600 underline">
            <a href="/forgot-password">Forgot your password?</a>
          </p>
        </form>

        <p className="mt-8 text-center text-lg text-slate-600">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="font-semibold text-indigo-600 underline">
            Sign Up
          </a>
        </p>
      </section>
    </main>
  );
}
