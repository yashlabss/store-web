"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { API_PUBLIC_BASE } from "../../../../lib/api";

export default function WebinarReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = typeof params?.username === "string" ? params.username : "";
  const webinarId = searchParams.get("webinar_id") || "";
  const buyerId = searchParams.get("buyer_id") || "";

  const [rating, setRating] = useState("5");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!username || !webinarId) {
      setError("Invalid review link.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const res = await fetch(`${API_PUBLIC_BASE}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          event_type: "webinar_feedback_submitted",
          metadata: {
            webinar_id: webinarId,
            buyer_id: buyerId || null,
            rating: Number(rating) || 0,
            feedback: feedback.trim(),
            source: "webinar_review_link",
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((json as { message?: string }).message || "Could not submit feedback.");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Webinar feedback</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please share how the webinar session went, especially because it ended early.
        </p>
        {submitted ? (
          <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            Thanks for your feedback.
          </div>
        ) : (
          <>
            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very poor</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">Comment</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                placeholder="What worked well, and what should improve?"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
          </>
        )}
        <Link
          href={username ? `/${encodeURIComponent(username)}` : "/"}
          className="mt-5 inline-block text-sm font-medium text-violet-700 underline"
        >
          Back to store
        </Link>
      </div>
    </main>
  );
}

