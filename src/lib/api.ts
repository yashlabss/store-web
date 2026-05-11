/**
 * Browser calls must use same-origin `/api/*`. Next.js rewrites proxy to your backend
 * (`next.config.ts`: BACKEND_URL / NEXT_PUBLIC_API_BASE_URL). If we prepend
 * `NEXT_PUBLIC_API_BASE_URL` here, the browser hits api.* cross‑origin from www —
 * that fails unless CORS_ORIGIN on the API lists www (easy to misconfigure).
 *
 * Keep NEXT_PUBLIC_API_BASE_URL for build-time rewrites only, not for fetch URLs below.
 */
const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
export const API_BASE_URL =
  raw && raw.length > 0 ? raw.replace(/\/$/, "") : "";

/** Proxied to Express `/api/auth`. */
export const API_AUTH_BASE = "/api/auth";

/** Proxied to `/api/products`. */
export const API_PRODUCTS_BASE = "/api/products";

/** Proxied to `/api/public`. */
export const API_PUBLIC_BASE = "/api/public";

/** Proxied to `/api/webinar-host`. */
export const API_WEBINAR_HOST_BASE = "/api/webinar-host";

/**
 * Playback URLs: absolute https pass through; relative paths stay same-origin.
 */
export function resolvePlaybackUrl(pathOrUrl: string): string {
  const s = String(pathOrUrl || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return s.startsWith("/") ? s : `/${s}`;
}
