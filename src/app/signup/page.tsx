import type { Metadata } from "next";
import { Suspense } from "react";
import SignupForm from "../../components/forms/SignupForm";

export const metadata: Metadata = {
  title: "Create your store — Mintln",
  description: "Claim your Mintln link and start selling digital products to your audience.",
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] text-slate-600">
          Loading…
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
