import { NextRequest, NextResponse } from "next/server";

/**
 * Optional proxy: if Zoom posts to the Next origin, forward the raw body to the API
 * (BACKEND_URL / NEXT_PUBLIC_API_BASE_URL) so signature validation still works.
 * In production, Zoom usually posts directly to https://api.mintln.com/.../zoom/webhook.
 */
const backendBase =
  process.env.BACKEND_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  "http://127.0.0.1:5000";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "zoom-webhook-proxy",
    target: `${backendBase.replace(/\/$/, "")}/api/integrations/zoom/webhook`,
  });
}

export async function POST(req: NextRequest) {
  const target = `${backendBase.replace(/\/$/, "")}/api/integrations/zoom/webhook`;
  const body = await req.text();
  const contentType = req.headers.get("content-type") || "application/json";

  const forward: Record<string, string> = {
    "Content-Type": contentType,
    "ngrok-skip-browser-warning": "1",
  };
  const zmSig = req.headers.get("x-zm-signature");
  const zmTs = req.headers.get("x-zm-request-timestamp");
  const zmAuth = req.headers.get("authorization");
  if (zmSig) forward["x-zm-signature"] = zmSig;
  if (zmTs) forward["x-zm-request-timestamp"] = zmTs;
  if (zmAuth) forward["authorization"] = zmAuth;

  const res = await fetch(target, {
    method: "POST",
    headers: forward,
    body,
  });

  const text = await res.text();
  const outCt = res.headers.get("content-type") || "application/json";
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": outCt },
  });
}
