/** Map browser fetch failures to a clearer message for users. */
export function networkErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Something went wrong.";
  const m = err.message.toLowerCase();
  if (
    m.includes("failed to fetch") ||
    m.includes("networkerror") ||
    m.includes("load failed") ||
    m.includes("econnrefused")
  ) {
    return "Cannot reach the API. Start the backend (cd store-backend && npm run dev, port 5000) and ensure store-web BACKEND_URL points at it. Leave NEXT_PUBLIC_API_BASE_URL empty so login uses /api (proxied by Next), then retry.";
  }
  return err.message;
}
