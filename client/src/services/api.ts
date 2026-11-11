import { ApiError, readApiResponse } from "./api-response";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<{ data: T }> {
  const token = localStorage.getItem("token");
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (extraHeaders) Object.assign(headers, extraHeaders);
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${url}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(
      "Could not reach the service. Check your connection and try again."
    );
  }

  if (response.status === 401 && token && !url.startsWith("/auth/otp/") && localStorage.getItem("token") === token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (
      !window.location.pathname.includes("/login") &&
      !window.location.pathname.includes("/register") &&
      !window.location.pathname.includes("/signup")
    ) {
      window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
  }

  return { data: await readApiResponse<T>(response) };
}

const api = {
  get<T>(url: string, config?: { params?: Record<string, string> }): Promise<{ data: T }> {
    const qs = config?.params ? "?" + new URLSearchParams(config.params).toString() : "";
    return request<T>("GET", `${url}${qs}`);
  },
  post<T>(url: string, body?: unknown, config?: { headers?: Record<string, string> }): Promise<{ data: T }> {
    return request<T>("POST", url, body, config?.headers);
  },
  patch<T>(url: string, body: unknown): Promise<{ data: T }> {
    return request<T>("PATCH", url, body);
  },
};

export default api;
