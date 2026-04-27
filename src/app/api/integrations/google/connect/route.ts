import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const coachId = req.nextUrl.searchParams.get("coachId");
  if (!coachId) {
    return NextResponse.json({ message: "coachId is required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/integrations/google/callback`;
  const returnTo = req.nextUrl.searchParams.get("returnTo") || "/dashboard/store/product/add?kind=coaching";

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    try {
      const errorUrl = new URL(returnTo, req.nextUrl.origin);
      errorUrl.searchParams.set("google_error", "oauth_not_configured");
      return NextResponse.redirect(errorUrl.toString());
    } catch {
      return NextResponse.json(
        {
          message:
            "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in store-web/.env.local and restart the dev server.",
        },
        { status: 503 }
      );
    }
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const url = auth.generateAuthUrl({
    access_type: "offline",
    /** Omit forced consent — `prompt: "consent"` re-ran the full unverified-app flow on every click. */
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    state: JSON.stringify({ coachId, returnTo }),
  });

  return NextResponse.redirect(url);
}
