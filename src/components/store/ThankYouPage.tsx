"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_PUBLIC_BASE, API_WEBINAR_HOST_BASE } from "../../lib/api";

const PURPLE = "#6b46ff";

type Delivery = {
  type: string;
  file_name: string | null;
  redirect_url: string | null;
  preview_url?: string | null;
  preview_type?: "pdf" | "audio" | "video" | null;
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
    buyer_phone?: string | null;
    payment_method: string;
    product_title: string | null;
    product_id?: string | null;
  };
  delivery: Delivery;
  delivery_status?: {
    email?: {
      status?: string;
      provider?: string | null;
      sent_at?: string | null;
      error_hint?: string | null;
    };
    whatsapp?: {
      status?: string;
      provider?: string | null;
      sent_at?: string | null;
      twilio_error?: { twilio_code?: string | null; message?: string | null } | null;
    };
  };
  webinar?: {
    webinar_id?: string | null;
    webinar_status?: string | null;
    webinar_start_time?: string | null;
    webinar_end_time?: string | null;
    webinar_duration_mins?: number | null;
    registration_id?: string | null;
    slot_date?: string | null;
    slot_time?: string | null;
    time_zone?: string | null;
    meeting_link?: string | null;
    meeting_provider?: string | null;
    meeting_location?: string | null;
    meeting_start_at?: string | null;
  } | null;
};

type SessionTrackResult = {
  ok: boolean;
  session?: {
    attendance_secs?: number | null;
    attendance_mark?: string | null;
  } | null;
};

function mailSentSimple(status?: string) {
  return String(status || "").toLowerCase() === "sent";
}

/** Treat API success / in-flight WhatsApp as “sent” for a simple buyer-facing line. */
function whatsAppSentSimple(status?: string) {
  const s = String(status || "").toLowerCase();
  return s === "sent" || s === "accepted" || s === "pending";
}

type DeliveryUiStatus = "sent" | "pending" | "failed" | "not_requested" | "not_configured";

function normalizeDeliveryStatus(status?: string): DeliveryUiStatus {
  const s = String(status || "").toLowerCase();
  if (s === "sent" || s === "accepted") return "sent";
  if (s === "not_configured") return "not_configured";
  if (s === "pending" || s === "queued") return "pending";
  if (s === "failed") return "failed";
  return "not_requested";
}

function statusBadgeClasses(status: DeliveryUiStatus): string {
  if (status === "sent") return "bg-emerald-100 text-emerald-700";
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  if (status === "not_configured") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-600";
}

function statusLabel(status: DeliveryUiStatus): string {
  if (status === "not_requested") return "not requested";
  if (status === "not_configured") return "not configured";
  return status;
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
  const [webinarSessionJoined, setWebinarSessionJoined] = useState(false);
  const [webinarSessionEverJoined, setWebinarSessionEverJoined] = useState(false);
  const [webinarSessionStatus, setWebinarSessionStatus] = useState("");
  const [attendanceMark, setAttendanceMark] = useState("");
  const [attendanceSecs, setAttendanceSecs] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

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
    let pollCount = 0;

    async function loadOrder(isPoll: boolean) {
      const oid = orderId ?? "";
      const tok = token ?? "";
      if (!oid || !tok) return;
      try {
        const tokenValue =
          typeof window === "undefined"
            ? ""
            : localStorage.getItem("buyer_auth_token") || "";
        const res = await fetch(
          `${API_PUBLIC_BASE}/order/${encodeURIComponent(oid)}?token=${encodeURIComponent(tok)}`,
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
        if (!cancelled && !isPoll) {
          setError(e instanceof Error ? e.message : "Could not load order.");
        }
      } finally {
        if (!cancelled && !isPoll) setLoading(false);
      }
    }

    void loadOrder(false);

    const pollMs = 2500;
    const maxPolls = 6;
    const timer = window.setInterval(() => {
      if (cancelled) return;
      pollCount += 1;
      if (pollCount > maxPolls) {
        window.clearInterval(timer);
        return;
      }
      void loadOrder(true);
    }, pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [hasAccessParams, orderId, token, router]);

  useEffect(() => {
    if (!data?.webinar?.webinar_id || !webinarSessionJoined) return;
    const webinarId = data.webinar.webinar_id;
    const timer = window.setInterval(() => {
      void trackWebinarSession("heartbeat", webinarId);
    }, 30000);
    const onPageHide = () => {
      void trackWebinarSession("leave", webinarId).then((result) => {
        if (result.ok) {
          setAttendanceMark(String(result.session?.attendance_mark || ""));
          setAttendanceSecs(
            typeof result.session?.attendance_secs === "number"
              ? result.session.attendance_secs
              : null
          );
        }
      });
      setWebinarSessionJoined(false);
    };
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
      void trackWebinarSession("leave", webinarId);
    };
  }, [data?.webinar?.webinar_id, webinarSessionJoined]);

  useEffect(() => {
    if (!webinarSessionEverJoined || !orderId || !token) return;
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const tokenValue = localStorage.getItem("buyer_auth_token") || "";
      if (!tokenValue) return;
      void fetch(
        `${API_PUBLIC_BASE}/order/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`,
        {
          cache: "no-store",
          headers: { Authorization: `Bearer ${tokenValue}` },
        }
      )
        .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
        .then(({ ok, json }) => {
          if (ok) setData(json as OrderPayload);
        })
        .catch(() => {
          /* ignore silent refresh errors */
        });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [webinarSessionEverJoined, orderId, token]);

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
  const webinar = data.webinar;
  const showMailLine = mailSentSimple(status?.email?.status);
  const showWhatsAppLine = whatsAppSentSimple(status?.whatsapp?.status);
  const emailDelivery = normalizeDeliveryStatus(status?.email?.status);
  const whatsappDelivery = normalizeDeliveryStatus(status?.whatsapp?.status);
  const zoomLinkReady = Boolean(webinar?.meeting_link);
  const amount = Number(order.amount) || 0;
  const showRedirect =
    delivery.type === "redirect" && delivery.redirect_url && /^https?:\/\//i.test(delivery.redirect_url);
  const firstDownload = delivery.download_links?.[0];
  const webinarEnded =
    Boolean(webinar?.webinar_end_time) || String(webinar?.webinar_status || "") === "ended";
  const webinarStartMs = webinar?.webinar_start_time
    ? new Date(webinar.webinar_start_time).getTime()
    : Number.NaN;
  const webinarEndMs = webinar?.webinar_end_time
    ? new Date(webinar.webinar_end_time).getTime()
    : Number.NaN;
  const webinarDurationMins =
    !Number.isNaN(webinarStartMs) && !Number.isNaN(webinarEndMs)
      ? Math.max(0, Number(((webinarEndMs - webinarStartMs) / 60000).toFixed(2)))
      : null;
  const endedEarly =
    webinarEnded &&
    webinarDurationMins != null &&
    Number(webinar?.webinar_duration_mins || 0) > 0 &&
    webinarDurationMins < Number(webinar?.webinar_duration_mins || 0);
  const attendanceLabel =
    String(attendanceMark || "").toLowerCase() === "completed"
      ? "Completed"
      : String(attendanceMark || "").toLowerCase() === "partial"
        ? "Partial"
        : String(attendanceMark || "").toLowerCase() === "missed"
          ? "Not attended"
          : webinarEnded && webinarSessionEverJoined
            ? "Not attended"
            : "—";
  const showFeedbackForm = webinarEnded && webinarSessionEverJoined && !feedbackSubmitted;

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

  const submitFeedback = async () => {
    try {
      setFeedbackBusy(true);
      setFeedbackError("");
      const res = await fetch(`${API_PUBLIC_BASE}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          event_type: "webinar_feedback_submitted",
          product_id: order.product_id || undefined,
          metadata: {
            webinar_id: webinar?.webinar_id || null,
            rating: Number(feedbackRating) || 0,
            feedback: feedbackText.trim(),
            attendance_mark: attendanceMark || null,
            attendance_secs: attendanceSecs,
            ended_early: endedEarly,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((json as { message?: string }).message || "Could not submit feedback.");
      }
      setFeedbackSubmitted(true);
      setWebinarSessionStatus("Thanks! Your webinar feedback has been submitted.");
    } catch (e) {
      setFeedbackError(e instanceof Error ? e.message : "Could not submit feedback.");
    } finally {
      setFeedbackBusy(false);
    }
  };

  const trackWebinarSession = async (
    action: "join" | "heartbeat" | "leave",
    webinarId: string
  ): Promise<SessionTrackResult> => {
    try {
      const tokenValue =
        typeof window === "undefined" ? "" : localStorage.getItem("buyer_auth_token") || "";
      if (!tokenValue) return { ok: false };
      const res = await fetch(`${API_WEBINAR_HOST_BASE}/session/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenValue}`,
        },
        body: JSON.stringify({ webinar_id: webinarId }),
        keepalive: action === "leave",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false };
      return {
        ok: true,
        session: (json as { session?: SessionTrackResult["session"] }).session || null,
      };
    } catch {
      return { ok: false };
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
            ) : delivery.preview_url ? (
              <a
                href={delivery.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-95"
                style={{ backgroundColor: PURPLE }}
              >
                {delivery.preview_type === "audio"
                  ? "Listen Now"
                  : delivery.preview_type === "video"
                    ? "Watch Now"
                    : "View & Download"}
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

            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              {emailDelivery === "failed" ? (
                <>
                  <p>
                    Email did not send. In <code className="rounded bg-slate-100 px-1">store-backend/.env</code> set
                    either SMTP (Gmail etc.) or{" "}
                    <code className="rounded bg-slate-100 px-1">RESEND_API_KEY</code> +{" "}
                    <code className="rounded bg-slate-100 px-1">RESEND_FROM_EMAIL</code>, then restart the API.
                  </p>
                  {status?.email?.error_hint ? (
                    <p className="mt-1 break-words font-mono text-[11px] text-slate-600">
                      {status.email.error_hint}
                    </p>
                  ) : null}
                </>
              ) : null}
              {whatsappDelivery === "not_configured" ? (
                <p>
                  WhatsApp is not set up. Add Twilio WhatsApp env vars in{" "}
                  <code className="rounded bg-slate-100 px-1">store-backend/.env</code> (see{" "}
                  <code className="rounded bg-slate-100 px-1">.env.example</code>) and restart.
                </p>
              ) : null}
              {whatsappDelivery === "not_requested" && webinar ? (
                <p>WhatsApp was not requested for this order (missing/invalid phone at checkout).</p>
              ) : null}
              {(showMailLine || showWhatsAppLine) && !webinar ? (
                <p>Delivery is in progress and usually completes quickly.</p>
              ) : null}
            </div>
          </div>

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
