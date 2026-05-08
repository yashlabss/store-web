"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_PUBLIC_BASE } from "../../lib/api";

const PURPLE = "#6b46ff";

type Delivery = {
  type: string;
  file_name: string | null;
  redirect_url: string | null;
  download_links?: Array<{ label: string; url: string }>;
};

type OrderPayload = {
  order: {
    id: string;
    created_at: string;
    amount: number;
    currency: string;
    buyer_email: string | null;
    buyer_name: string | null;
    payment_method: string;
    product_title: string | null;
  };
  delivery: Delivery;
  delivery_status?: {
    email?: { status?: string; provider?: string | null; sent_at?: string | null };
    whatsapp?: { status?: string; provider?: string | null; sent_at?: string | null };
  };
};

function mailSentSimple(status?: string) {
  return String(status || "").toLowerCase() === "sent";
}

/** Treat API success / in-flight WhatsApp as “sent” for a simple buyer-facing line. */
function whatsAppSentSimple(status?: string) {
  const s = String(status || "").toLowerCase();
  return s === "sent" || s === "accepted" || s === "pending";
}

export default function ThankYouPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const username = typeof params?.username === "string" ? params.username : "";
  const orderId = searchParams.get("order");
  const token = searchParams.get("token");
  const meetLink = searchParams.get("meet");
  const bookingError = searchParams.get("booking_error");
  const hasAccessParams = Boolean(orderId && token);

  const [loading, setLoading] = useState(hasAccessParams);
  const [error, setError] = useState(
    hasAccessParams
      ? ""
      : "Missing order access details. Return to the store and complete purchase again."
  );
  const [data, setData] = useState<OrderPayload | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const authToken = localStorage.getItem("buyer_auth_token");
    if (authToken) return;
    const redirectTo = `${window.location.pathname}${window.location.search}`;
    router.replace(`/buyer/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }, [router]);

  useEffect(() => {
    if (!hasAccessParams || !orderId || !token) return;
    let cancelled = false;
    void (async () => {
      try {
        const tokenValue =
          typeof window === "undefined"
            ? ""
            : localStorage.getItem("buyer_auth_token") || "";
        const res = await fetch(
          `${API_PUBLIC_BASE}/order/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`,
          {
            cache: "no-store",
            headers: tokenValue ? { Authorization: `Bearer ${tokenValue}` } : {},
          }
        );
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) {
          if (typeof window !== "undefined") localStorage.removeItem("buyer_auth_token");
          const redirectTo = `${window.location.pathname}${window.location.search}`;
          router.replace(`/buyer/login?redirectTo=${encodeURIComponent(redirectTo)}`);
          return;
        }
        if (res.status === 403) {
          if (!cancelled) {
            setError(
              json.message ||
                "This order was placed with a different buyer email. Log in with the account you used at checkout."
            );
          }
          return;
        }
        if (!res.ok) throw new Error(json.message || "Could not load order.");
        if (!cancelled) setData(json as OrderPayload);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasAccessParams, orderId, token, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-lg font-semibold text-slate-800">{error || "Something went wrong."}</p>
        <Link href={username ? `/${encodeURIComponent(username)}` : "/"} className="mt-6 font-semibold text-violet-600 underline">
          Back to store
        </Link>
      </div>
    );
  }

  const { order, delivery, delivery_status: status } = data;
  const showMailLine = mailSentSimple(status?.email?.status);
  const showWhatsAppLine = whatsAppSentSimple(status?.whatsapp?.status);
  const amount = Number(order.amount) || 0;
  const showRedirect =
    delivery.type === "redirect" && delivery.redirect_url && /^https?:\/\//i.test(delivery.redirect_url);
  const firstDownload = delivery.download_links?.[0];

  const triggerDownload = async () => {
    if (!token) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const res = await fetch(`${API_PUBLIC_BASE}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("buyer_auth_token")
            ? {
                Authorization: `Bearer ${localStorage.getItem("buyer_auth_token")}`,
              }
            : {}),
        },
        body: JSON.stringify({ token }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not generate download.");
      const url = String(json?.url || "");
      const fileName = String(json?.file_name || delivery.file_name || "download");
      if (!url) throw new Error("Download URL is unavailable.");
      const fileRes = await fetch(url);
      if (!fileRes.ok) throw new Error("Could not fetch product file.");
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbff] pb-28">
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,.06)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl" aria-hidden>
            ✓
          </div>
          <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900">
            You&apos;re in — thank you!
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Your purchase is confirmed. Access your digital product below.
          </p>

          <div className="mt-8 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{order.product_title || "Product"}</p>
            <p className="mt-1">
              {order.currency || "USD"} ${amount.toFixed(2)} ·{" "}
              {order.payment_method === "demo_instant" ? "Instant checkout (demo)" : order.payment_method}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Access</h2>
            {bookingError ? (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                {bookingError}
              </p>
            ) : null}
            {meetLink ? (
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-95"
                style={{ backgroundColor: "#0a7a69" }}
              >
                Join Google Meet
              </a>
            ) : null}
            {showRedirect ? (
              <a
                href={delivery.redirect_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-95"
                style={{ backgroundColor: PURPLE }}
              >
                Open download link
              </a>
            ) : firstDownload?.url ? (
              <button
                type="button"
                onClick={() => void triggerDownload()}
                disabled={downloading}
                className="mt-3 flex w-full items-center justify-center rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-95"
                style={{ backgroundColor: PURPLE }}
              >
                {downloading ? "Preparing download..." : "Download file"}
              </button>
            ) : delivery.file_name ? (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  Your file: <span className="font-medium text-slate-900">{delivery.file_name}</span>
                </p>
                <button
                  type="button"
                  onClick={() => void triggerDownload()}
                  disabled={downloading}
                  className="mt-3 flex w-full items-center justify-center rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                  style={{ backgroundColor: PURPLE }}
                >
                  {downloading ? "Preparing download..." : "Download now"}
                </button>
                {downloadError ? (
                  <p className="mt-2 text-sm font-medium text-red-600">{downloadError}</p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                The creator will deliver this product according to their settings. Keep this confirmation for your
                records.
              </p>
            )}
            <p className="mt-4 text-xs text-slate-500">
              Receipt and delivery are sent to your email and WhatsApp when configured by the seller.
            </p>
          </div>
<<<<<<< Updated upstream
          {showMailLine || showWhatsAppLine ? (
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Delivery status</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-800">
                {showMailLine ? <li>Sent on mail.</li> : null}
                {showWhatsAppLine ? <li>Sent on WhatsApp.</li> : null}
              </ul>
=======
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Delivery status</p>
            <div className="mt-3 space-y-2 text-sm text-slate-800">
              <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                <span>Email</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClasses(emailDelivery)}`}>
                  {statusLabel(emailDelivery)}
                </span>
              </div>
              {/* <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                <span>WhatsApp</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClasses(whatsappDelivery)}`}>
                  {statusLabel(whatsappDelivery)}
                </span>
              </div> */}
              {webinar ? (
                <div className="rounded-lg bg-white px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span>Meeting link</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        zoomLinkReady ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {zoomLinkReady ? "created" : "pending"}
                    </span>
                  </div>
                  {webinar.slot_date || webinar.slot_time ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {webinar.slot_date || ""} {webinar.slot_time || ""}{" "}
                      {webinar.time_zone ? `(${webinar.time_zone})` : ""}
                    </p>
                  ) : null}
                  {webinar.meeting_link ? (
                    <button
                      type="button"
                      onClick={() => {
                        const meetingLink = webinar.meeting_link || "";
                        const runtimeWebinarId = webinar.webinar_id || "";
                        if (!meetingLink) return;
                        if (runtimeWebinarId) {
                          void trackWebinarSession("join", runtimeWebinarId).then((result) => {
                            setWebinarSessionJoined(result.ok || webinarSessionJoined);
                            if (result.ok) setWebinarSessionEverJoined(true);
                            setWebinarSessionStatus(
                              result.ok
                                ? "Session tracking active."
                                : "Meeting opened. Session tracking unavailable."
                            );
                            window.open(meetingLink, "_blank", "noopener,noreferrer");
                          });
                          return;
                        }
                        setWebinarSessionStatus("Meeting opened. Webinar runtime ID is missing.");
                        window.open(meetingLink, "_blank", "noopener,noreferrer");
                      }}
                      className="mt-1 inline-block text-xs font-semibold text-violet-600 underline"
                    >
                      Open webinar link
                    </button>
                  ) : null}
                  {webinarSessionStatus ? (
                    <p className="mt-1 text-[11px] text-slate-500">{webinarSessionStatus}</p>
                  ) : null}
                  {(webinarEnded || webinarSessionEverJoined) ? (
                    <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                      <p>
                        Attendance:{" "}
                        <span className="font-semibold text-slate-800">{attendanceLabel}</span>
                        {typeof attendanceSecs === "number"
                          ? ` (${Math.round(attendanceSecs / 60)} mins)`
                          : ""}
                      </p>
                      {webinarEnded ? (
                        <p>
                          Webinar ended {endedEarly ? "early" : "as planned"}.
                          {webinarDurationMins != null
                            ? ` Duration: ${webinarDurationMins} mins.`
                            : ""}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {showFeedbackForm ? (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-800">
                        Webinar feedback
                      </p>
                      <div className="mt-2">
                        <label className="text-[11px] text-slate-600">Rating</label>
                        <select
                          value={feedbackRating}
                          onChange={(e) => setFeedbackRating(e.target.value)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                        >
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Good</option>
                          <option value="3">3 - Okay</option>
                          <option value="2">2 - Poor</option>
                          <option value="1">1 - Very poor</option>
                        </select>
                      </div>
                      <div className="mt-2">
                        <label className="text-[11px] text-slate-600">
                          Comment (optional)
                        </label>
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          rows={3}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                          placeholder="How was the webinar?"
                        />
                      </div>
                      {feedbackError ? (
                        <p className="mt-1 text-[11px] text-red-600">{feedbackError}</p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void submitFeedback()}
                        disabled={feedbackBusy}
                        className="mt-2 rounded bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
                      >
                        {feedbackBusy ? "Submitting..." : "Submit feedback"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
>>>>>>> Stashed changes
            </div>
          ) : null}

          <Link
            href={username ? `/${encodeURIComponent(username)}` : "/"}
            className="mt-8 block text-center text-sm font-semibold text-violet-600 underline underline-offset-2"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
