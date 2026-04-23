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

/** Digital products: `/api/digital-products` */
export const API_DIGITAL_PRODUCTS_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/digital-products`
  : "/api/digital-products";

/** Payments: `/api/payments` */
export const API_PAYMENTS_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/payments`
  : "/api/payments";

/** Audience / subscribers: `/api/audience` */
export const API_AUDIENCE_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/audience`
  : "/api/audience";

/** Analytics: `/api/analytics` */
export const API_ANALYTICS_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/analytics`
  : "/api/analytics";

/** Integrations status: `/api/integrations` */
export const API_INTEGRATIONS_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/integrations`
  : "/api/integrations";

/** Landing pages + store design: `/api/landing-pages` */
export const API_LANDING_PAGES_BASE = API_BASE_URL
  ? `${API_BASE_URL}/api/landing-pages`
  : "/api/landing-pages";

/**
 * Authenticated fetch — automatically attaches the Bearer token from localStorage.
 * Safe to call on the server (token will be null, no Authorization header is sent).
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}
