import type { z } from "zod";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const API_BASE = RAW_BASE.replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

type RequestOpts<T> = {
  query?: Query;
  body?: unknown;
  schema?: z.ZodType<T>;
  signal?: AbortSignal;
  /** If true (default), auto-clear session + redirect to /login on 401. */
  authGuard?: boolean;
};

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function readAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = "polaris.access=";
  for (const seg of document.cookie.split("; ")) {
    if (seg.startsWith(prefix)) return decodeURIComponent(seg.slice(prefix.length));
  }
  return null;
}

function handleUnauthorized(): void {
  if (typeof document === "undefined") return;
  for (const name of ["polaris.access", "polaris.refresh", "polaris.user"]) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOpts<T> = {},
): Promise<T> {
  const { query, body, schema, signal, authGuard = true } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  const token = readAccessToken();
  if (token) headers["authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    // Next 16: fetch is uncached by default — matches what we want for API calls.
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  if (res.status === 401 && authGuard) {
    handleUnauthorized();
  }

  if (!res.ok) {
    const message =
      (isJson && payload && typeof payload === "object" && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : null) ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, payload, message);
  }

  if (!schema) {
    return payload as T;
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(
      res.status,
      payload,
      `Response failed schema validation: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}

export const api = {
  get: <T>(path: string, opts?: RequestOpts<T>) => request<T>("GET", path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOpts<T>) =>
    request<T>("POST", path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOpts<T>) =>
    request<T>("PUT", path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOpts<T>) => request<T>("DELETE", path, opts),
};
