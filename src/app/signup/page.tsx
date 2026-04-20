import { Suspense } from "react";
import SignupForm from "../../components/forms/SignupForm";

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
