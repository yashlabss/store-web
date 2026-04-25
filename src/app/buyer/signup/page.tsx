import { Suspense } from "react";
import BuyerSignupForm from "../../../components/forms/BuyerSignupForm";

export default function BuyerSignupPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading...</div>}>
      <BuyerSignupForm />
    </Suspense>
  );
}
