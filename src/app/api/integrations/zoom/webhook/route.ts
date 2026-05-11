import { NextRequest, NextResponse } from "next/server";

/**
 * When ngrok points at Next (port 3000), this route receives Zoom's POST and
 * forwards the raw body to the Express API so validation is not lost in rewrites.
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

  const res = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "ngrok-skip-browser-warning": "1",
    },
    body,
  });

  const text = await res.text();
  const outCt = res.headers.get("content-type") || "application/json";
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": outCt },
  });
}
