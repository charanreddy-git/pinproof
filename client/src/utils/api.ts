/**
 * Origin of the API server, used for assets the API serves directly
 * (for example evidence images under /uploads).
 *
 * `VITE_API_URL` normally includes the `/api` suffix. Parsing it as a URL
 * avoids mangling hosts that begin with `api.` — a plain
 * `.replace("/api", "")` would turn `https://api.example.com/api` into
 * `https:/example.com/api`.
 */
export function getApiOrigin(): string {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  if (!apiUrl) return "";

  try {
    return new URL(apiUrl, window.location.origin).origin;
  } catch {
    // Fallback for unusual relative values.
    return apiUrl.replace(/\/api\/?$/, "");
  }
}
