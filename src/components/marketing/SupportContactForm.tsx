"use client";

import { useState } from "react";
import { SUPPORT_EMAIL } from "./constants";

export default function SupportContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setStatus("loading");
    try {
      const res = await fetch("/api/public/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          typeof data.message === "string" && data.message.trim()
            ? data.message
            : res.status === 429
              ? "Too many attempts. Please wait a bit and try again."
              : "Something went wrong. You can still reach us by email."
        );
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Check your connection or email us directly.");
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="support-name" className="mb-1.5 block text-sm font-semibold text-[#1f2a44]">
            Name
          </label>
          <input
            id="support-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none ring-indigo-500/0 transition-shadow focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Your name"
            disabled={status === "loading"}
          />
        </div>
        <div>
          <label htmlFor="support-email" className="mb-1.5 block text-sm font-semibold text-[#1f2a44]">
            Email
          </label>
          <input
            id="support-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none ring-indigo-500/0 transition-shadow focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="you@example.com"
            disabled={status === "loading"}
          />
        </div>
        <div>
          <label htmlFor="support-message" className="mb-1.5 block text-sm font-semibold text-[#1f2a44]">
            Message
          </label>
          <textarea
            id="support-message"
            name="message"
            required
            minLength={10}
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none ring-indigo-500/0 transition-shadow focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="How can we help? (at least 10 characters)"
            disabled={status === "loading"}
          />
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Hit send and our team at {SUPPORT_EMAIL} gets the full note—real people, not an auto-reply wall.
      </p>
      {status === "error" && errorMsg ? (
        <p className="mt-3 text-sm font-medium text-rose-600" role="alert">
          {errorMsg}{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
            {SUPPORT_EMAIL}
          </a>
        </p>
      ) : null}
      {status === "success" ? (
        <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
          You’re all set—we received your note and will be in touch soon.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Sending…" : "Send my message"}
      </button>
    </form>
  );
}
