/**
 * Configure this in deployment env when using custom domain, e.g.:
 * NEXT_PUBLIC_STORE_BASE_URL=https://stan.store
 */
const rawStoreBase = process.env.NEXT_PUBLIC_STORE_BASE_URL?.trim() || "";
export const STORE_BASE_URL = rawStoreBase.replace(/\/$/, "");

export function publicStorePath(handle: string) {
  return `/${encodeURIComponent(handle)}`;
}

/** Relative URL in local/dev; absolute URL when custom origin is configured. */
export function publicStoreUrl(handle: string) {
  const path = publicStorePath(handle);
  return STORE_BASE_URL ? `${STORE_BASE_URL}${path}` : path;
}

/** Human-readable domain label shown in UI next to handle. */
export const DISPLAY_STORE_DOMAIN = STORE_BASE_URL
  ? STORE_BASE_URL.replace(/^https?:\/\//, "")
  : "localhost:3000";
