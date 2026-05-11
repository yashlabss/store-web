"use client";

import { useState } from "react";
import { SUPPORT_EMAIL } from "./constants";

export default function SupportContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Mintln support: ${name || "Contact"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
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
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none ring-indigo-500/0 transition-shadow focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="How can we help?"
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Submitting opens your email app with this message addressed to {SUPPORT_EMAIL}. You can send it from there.
      </p>
      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 sm:w-auto"
      >
        Open email draft
      </button>
      {submitted ? (
        <p className="mt-3 text-sm text-emerald-700" role="status">
          If your mail app did not open, email us directly at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}
