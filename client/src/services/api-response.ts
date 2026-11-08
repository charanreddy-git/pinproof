export class ApiError extends Error {
  response: { status: number; data: { message: string } };

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.response = { status, data: { message } };
  }
}

function fallbackMessage(status: number): string {
  if (status >= 500) {
    return "The service is temporarily unavailable. Please try again shortly.";
  }
  if (status === 401) return "Please sign in again to continue.";
  if (status === 404) return "The requested service could not be found.";
  if (status === 429) return "Too many requests. Please wait and try again.";
  return `Request failed (${status}). Please try again.`;
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  // No-content responses intentionally have nothing to parse.
  if (response.status === 204 || response.status === 205) return undefined as T;

  let payload: unknown;
  try {
    const text = await response.text();
    payload = text.trim() ? JSON.parse(text) : undefined;
  } catch {
    // A proxy can return HTML, plain text, or a truncated response body.
    // Do not expose that body (or a JSON parser exception) to the user.
    payload = undefined;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload &&
      typeof payload.message === "string" && payload.message.trim()
        ? payload.message
        : fallbackMessage(response.status);
    throw new ApiError(message, response.status);
  }

  if (payload === null || typeof payload !== "object") {
    throw new ApiError(
      "The server returned an invalid response. Please try again.",
      response.status
    );
  }

  return payload as T;
}
