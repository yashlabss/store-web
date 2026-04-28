import { NextRequest, NextResponse } from "next/server";
import { getZoomTokens, hasValidZoomCredentialTokens } from "../../../../lib/server/zoomTokenStore";

/**
 * Zoom OAuth setup (marketplace.zoom.us):
 * - Create OAuth app, type: User-managed.
 * - Add scopes: meeting:write:meeting, meeting:read:meeting.
 *   (user:read and meeting:write:admin may be unavailable depending on account role/app type.)
 * - Redirect URL (dev): http://localhost:3000/api/auth/zoom/callback
 * - Put credentials in store-web/.env.local:
 *   ZOOM_CLIENT_ID=...
 *   ZOOM_CLIENT_SECRET=...
 */
export async function GET(req: NextRequest) {
  const coachId = req.nextUrl.searchParams.get("coachId");
  if (!coachId) {
    return NextResponse.json({ message: "coachId is required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/zoom/callback`;
  const returnTo = req.nextUrl.searchParams.get("returnTo") || "/dashboard/store/product/add?kind=coaching";
  const clientId = process.env.ZOOM_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOOM_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    const errUrl = new URL(returnTo, req.nextUrl.origin);
    errUrl.searchParams.set("zoom_error", "oauth_not_configured");
    return NextResponse.redirect(errUrl.toString());
  }

  const existingTokens = getZoomTokens(coachId);
  const forceReconsent = !hasValidZoomCredentialTokens(existingTokens);
  const authUrl = new URL("https://zoom.us/oauth/authorize");
  const requestedScopes = [
    "meeting:write:meeting",
    "meeting:read:meeting",
  ].join(" ");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", requestedScopes);
  authUrl.searchParams.set("state", JSON.stringify({ coachId, returnTo }));
  if (forceReconsent) authUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}
