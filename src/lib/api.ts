/**
 * Browser-facing API paths are always same-origin `/api/*`.
 * Next.js rewrites proxy these to your Express backend (`next.config.ts`: BACKEND_URL or
 * NEXT_PUBLIC_API_BASE_URL). That way the deployed site on www does not call api.* directly
 * from the browser (which would require CORS on the API).
 *
 * `NEXT_PUBLIC_API_BASE_URL` remains useful for build-time rewrite resolution and optional
 * tooling; it is not prepended onto fetch/XHR bases below.
 */
const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
export const API_BASE_URL =
  raw && raw.length > 0 ? raw.replace(/\/$/, "") : "";

/** Auth routes — proxied to Express `/api/auth`. */
export const API_AUTH_BASE = "/api/auth";

/** Product / store CRUD — proxied to `/api/products`. */
export const API_PRODUCTS_BASE = "/api/products";

/** Public storefront — proxied to `/api/public`. */
export const API_PUBLIC_BASE = "/api/public";

/** Webinar host/session tracking — proxied to `/api/webinar-host`. */
export const API_WEBINAR_HOST_BASE = "/api/webinar-host";

/**
 * Normalize playback URLs from the API. Absolute https URLs pass through (e.g. signed storage).
 * Relative paths stay same-origin so audio/video can load through the Next proxy without CORS.
 */
export function resolvePlaybackUrl(pathOrUrl: string): string {
  const s = String(pathOrUrl || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return s.startsWith("/") ? s : `/${s}`;
}
