import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { upsertGoogleTokens } from "../../../../../lib/server/googleTokenStore";

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/integrations/google/callback`;
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);

  let email: string | null = null;
  try {
    const oauth2 = google.oauth2({ version: "v2", auth });
    const me = await oauth2.userinfo.get();
    email = me.data.email || null;
  } catch {
    /* ignore non-critical profile fetch failures */
  }

  upsertGoogleTokens(coachId, {
    accessToken: tokens.access_token || null,
    refreshToken: tokens.refresh_token || null,
    expiryDate: typeof tokens.expiry_date === "number" ? tokens.expiry_date : null,
    email,
  });

  const finalUrl = new URL(returnTo, baseUrl);
  finalUrl.searchParams.set("google_connected", "1");
  return NextResponse.redirect(finalUrl.toString());
}
