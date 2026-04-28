import { NextRequest, NextResponse } from "next/server";
import { fetchZoomUserEmail } from "../../../../../lib/zoom-meeting";
import { upsertZoomTokens } from "../../../../../lib/server/zoomTokenStore";

type ZoomTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  account_id?: string;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.json({ message: "Missing OAuth callback params" }, { status: 400 });
  }

  let coachId = "";
  let returnTo = "/dashboard/store/product/add?kind=coaching";
  try {
    const parsed = JSON.parse(state) as { coachId?: string; returnTo?: string };
    coachId = parsed.coachId || "";
    returnTo = parsed.returnTo || returnTo;
  } catch {
    return NextResponse.json({ message: "Invalid OAuth state" }, { status: 400 });
  }

  if (!coachId) {
    return NextResponse.json({ message: "Missing coach id in state" }, { status: 400 });
  }

  const clientId = process.env.ZOOM_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.ZOOM_CLIENT_SECRET?.trim() || "";
  if (!clientId || !clientSecret) {
    const errUrl = new URL(returnTo, req.nextUrl.origin);
    errUrl.searchParams.set("zoom_error", "oauth_not_configured");
    return NextResponse.redirect(errUrl.toString());
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/zoom/callback`;
  const tokenRes = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const errUrl = new URL(returnTo, req.nextUrl.origin);
    errUrl.searchParams.set("zoom_error", "token_exchange_failed");
    return NextResponse.redirect(errUrl.toString());
  }

  const tokens = (await tokenRes.json().catch(() => ({}))) as ZoomTokenResponse;
  const accessToken = typeof tokens.access_token === "string" ? tokens.access_token : null;
  const refreshToken = typeof tokens.refresh_token === "string" ? tokens.refresh_token : null;
  const expiryDate = typeof tokens.expires_in === "number" ? Date.now() + tokens.expires_in * 1000 : null;
  const accountId = typeof tokens.account_id === "string" ? tokens.account_id : null;
  const email = accessToken ? await fetchZoomUserEmail(accessToken) : null;

  upsertZoomTokens(coachId, {
    accessToken,
    refreshToken,
    expiryDate,
    accountId,
    email,
  });

  const finalUrl = new URL(returnTo, baseUrl);
  finalUrl.searchParams.set("zoom_connected", "1");
  return NextResponse.redirect(finalUrl.toString());
}
