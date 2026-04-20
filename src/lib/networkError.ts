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
    return "Cannot reach the API. In a second terminal run: cd store-backend && npm run dev (port 5001). Then retry signup.";
  }
  return err.message;
}
