import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "../../../components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Mintln",
  description: "Access your Mintln creator dashboard and digital storefront.",
};

export default function AuthLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] text-slate-600">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
