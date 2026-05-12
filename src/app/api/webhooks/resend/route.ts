import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

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
 * Validates Svix (Resend) signature when `RESEND_WEBHOOK_SECRET` is set (e.g. on Vercel).
 * If the secret is unset (local dev), verification is skipped so you can test without Resend.
 */
function verifySvixSignature(rawBody: string, req: NextRequest): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.warn(
      "[webhooks/resend] RESEND_WEBHOOK_SECRET not set — skipping signature verification"
    );
    return true;
  }
  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");
  if (!id || !timestamp || !signature) {
    return false;
  }
  try {
    const wh = new Webhook(secret);
    wh.verify(rawBody, {
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * POST only. Raw body as text (Svix-signed JSON). Forwards to Express; client always gets HTTP 200 + JSON.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifySvixSignature(rawBody, req)) {
    return NextResponse.json(
      { success: false, error: "invalid_signature" },
      { status: 200 }
    );
  }

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
