/**
 * Base URL for the Express API (no trailing slash).
 * If unset, use same-origin `/api/...` so Next.js rewrites proxy to the backend (avoids CORS in dev).
 * In production, set NEXT_PUBLIC_API_BASE_URL to your deployed API origin.
 */
const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
export const API_BASE_URL =
  raw && raw.length > 0 ? raw.replace(/\/$/, "") : "";

/** Auth routes: `/api/auth` on the backend (proxied in dev when API_BASE_URL is empty). */
export const API_AUTH_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/auth`
  : "/api/auth";

/** Product / store CRUD: `/api/products` */
export const API_PRODUCTS_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/products`
  : "/api/products";

/** Public storefront (no auth): `/api/public` */
export const API_PUBLIC_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/public`
  : "/api/public";

/** Webinar host/session tracking routes: `/api/webinar-host` */
export const API_WEBINAR_HOST_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/webinar-host`
  : "/api/webinar-host";
