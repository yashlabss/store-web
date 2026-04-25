import { Suspense } from "react";
import BuyerLoginForm from "../../../components/forms/BuyerLoginForm";

export default function BuyerLoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading...</div>}>
      <BuyerLoginForm />
    </Suspense>
  );
}
