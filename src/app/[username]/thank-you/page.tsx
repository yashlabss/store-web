import { Suspense } from "react";
import ThankYouPage from "../../../components/store/ThankYouPage";

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  );
}

export default function ThankYouRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <ThankYouPage />
    </Suspense>
  );
}
