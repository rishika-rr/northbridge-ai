/**
 * HTTP client for the Enterprise RAG API.
 *
 * - Sends the bearer token on every request.
 * - Turns every failure into an `ApiError` carrying the backend's error
 *   contract ({detail, code, request_id}), so screens can show an actionable
 *   message without anyone reading server logs.
 * - A 401 on an authenticated call ends the session.
 */

const BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

const TOKEN_KEY = "northbridge.token";

export type ErrorCode =
  | "validation_error"
  | "payload_too_large"
  | "unsupported_media_type"
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "dependency_unavailable"
  | "internal_error"
  | "network_error";

export class ApiError extends Error {
  status: number;
  code: ErrorCode;
  requestId: string | null;
  retryAfter: number | null;

  constructor(
    message: string,
    status: number,
    code: ErrorCode,
    requestId: string | null = null,
    retryAfter: number | null = null
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.retryAfter = retryAfter;
  }
}

// ---------------------------------------------------------------- token

// Kept in memory and in sessionStorage: survives a page refresh, is gone when
// the tab closes, and is never written to persistent storage.
let token: string | null = readStoredToken();

function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return token;
}

export function setToken(value: string | null): void {
  token = value;
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable (private mode): the in-memory token still works
  }
}

let onSessionExpired: (() => void) | null = null;

/** Called when the server rejects the token of a signed-in user. */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

// -------------------------------------------------------------- request

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  json?: unknown;
  form?: Record<string, string>;
  body?: FormData;
  query?: Record<string, string | number | undefined>;
  /** false for the login call itself */
  auth?: boolean;
};

function codeFor(status: number): ErrorCode {
  if (status === 401) return "unauthenticated";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 413) return "payload_too_large";
  if (status === 415) return "unsupported_media_type";
  if (status === 429) return "rate_limited";
  if (status === 502 || status === 503) return "dependency_unavailable";
  if (status >= 500) return "internal_error";
  return "validation_error";
}

/** `detail` is a string, or a list of field errors for 422 responses. */
function detailToText(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const { loc, msg } = item as { loc?: unknown[]; msg?: string };
        const field = Array.isArray(loc) ? loc[loc.length - 1] : undefined;
        return typeof field === "string" && msg ? `${field}: ${msg}` : msg ?? "";
      })
      .filter(Boolean);
    if (parts.length) return parts.join("; ");
  }
  return "";
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", json, form, body, query, auth = true } = options;

  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(json);
  } else if (form) {
    payload = new URLSearchParams(form);
  } else if (body) {
    payload = body; // the browser sets the multipart boundary
  }
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  let url = `${BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
    const text = params.toString();
    if (text) url += `?${text}`;
  }

  let response: Response;
  try {
    response = await fetch(url, { method, headers, body: payload });
  } catch {
    throw new ApiError("The server could not be reached.", 0, "network_error");
  }

  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  let data: { detail?: unknown; code?: ErrorCode; request_id?: string } = {};
  try {
    data = await response.json();
  } catch {
    // not JSON (e.g. a proxy error page)
  }

  const retryHeader = Number(response.headers.get("Retry-After"));
  const error = new ApiError(
    detailToText(data.detail) || `Request failed (${response.status}).`,
    response.status,
    data.code ?? codeFor(response.status),
    data.request_id ?? response.headers.get("X-Request-ID"),
    Number.isFinite(retryHeader) && retryHeader > 0 ? retryHeader : null
  );

  if (error.status === 401 && auth && token) {
    setToken(null);
    onSessionExpired?.();
  }
  throw error;
}

// ------------------------------------------------------------- messages

/**
 * A message the user can act on (UI-003, NFR-USE-001). Validation-style
 * errors use the server's own explanation; the rest get plain guidance.
 */
export function describeError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Something unexpected happened. Please try again.";
  }
  switch (error.code) {
    case "network_error":
      return "Can't reach the server. Check your connection and try again.";
    case "unauthenticated":
      return error.status === 401 && error.message.startsWith("Incorrect")
        ? error.message
        : "Your session has ended. Please sign in again.";
    case "forbidden":
      return error.message.includes("permission")
        ? "You don't have permission to do this. Ask an administrator if you need access."
        : error.message;
    case "rate_limited":
      return error.retryAfter
        ? `Too many requests. Try again in ${error.retryAfter} seconds.`
        : "Too many requests. Wait a moment and try again.";
    case "dependency_unavailable":
      return error.status === 503
        ? "The answer service isn't available right now. If this continues, contact your administrator."
        : "The language model didn't respond. Please try again in a moment.";
    case "internal_error":
      return error.requestId
        ? `Something went wrong on the server. Please try again. If it keeps happening, give your administrator this reference: ${error.requestId}`
        : "Something went wrong on the server. Please try again.";
    default:
      return error.message;
  }
}
