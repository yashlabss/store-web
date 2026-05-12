import { NextRequest, NextResponse } from "next/server";

/** Never statically optimized — webhooks must run on each request. */
export const dynamic = "force-dynamic";

const DEFAULT_UPSTREAM =
  "http://localhost:5000/api/webhooks/resend";

function resolveUpstreamUrl(): string {
  const full = process.env.RESEND_WEBHOOK_EXPRESS_URL?.trim();
  if (full) return full.replace(/\/$/, "");
  const base = process.env.BACKEND_URL?.trim();
  if (base) return `${base.replace(/\/$/, "")}/api/webhooks/resend`;
  return DEFAULT_UPSTREAM;
}

/**
 * POST only. Raw body as string (Svix-signed JSON bytes — do not parse before forward).
 * Forwards to Express; client always gets HTTP 200 + JSON (no redirects, no HTML).
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const upstreamUrl = resolveUpstreamUrl();

  const forwardHeaders = new Headers();
  const ct = req.headers.get("content-type");
  if (ct) forwardHeaders.set("Content-Type", ct);

  for (const name of ["svix-id", "svix-timestamp", "svix-signature"] as const) {
    const v = req.headers.get(name);
    if (v) forwardHeaders.set(name, v);
  }

  try {
    const res = await fetch(upstreamUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: rawBody,
      redirect: "manual",
    });
    if (res.status >= 300 && res.status < 400) {
      console.warn(
        "[webhooks/resend] upstream redirect not followed (manual):",
        res.status,
        res.headers.get("location")
      );
    }
    await res.text().catch(() => {});
  } catch (e) {
    console.error("[webhooks/resend] forward to Express failed:", e);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
