/**
 * Public storefront URL path: /{handle} e.g. /yaswanth
 * Marketing domain shown in the dashboard: yash.store/{handle}
 */
export function publicStoreUrl(handle: string) {
  return `/${encodeURIComponent(handle)}`;
}

/** Shown next to copy (not the browser path). */
export const DISPLAY_STORE_DOMAIN = "localhost:3001";
