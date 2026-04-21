// Session is stored in cookies (not localStorage) so `proxy.ts` can read
// `polaris.access` on the server and hard-gate protected routes before any
// HTML flashes. Cookies are non-httpOnly because the API client still needs
// to read the access token to send it as a Bearer header.

const ACCESS_KEY = "polaris.access";
const REFRESH_KEY = "polaris.refresh";
const USER_KEY = "polaris.user";

// Token lifetimes match the backend defaults in app/core/config.py.
const ACCESS_MAX_AGE_SEC = 30 * 60; // 30 minutes
const REFRESH_MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days

export type StoredUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "reviewer" | "operator";
  is_active: boolean;
};

function setCookie(name: string, value: string, maxAgeSec: number): void {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAgeSec}`,
    "Path=/",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const segment of document.cookie.split("; ")) {
    if (segment.startsWith(prefix)) {
      return decodeURIComponent(segment.slice(prefix.length));
    }
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_KEY);
}

export function getStoredUser(): StoredUser | null {
  const raw = getCookie(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function storeSession(
  access: string,
  refresh: string,
  user: StoredUser,
): void {
  setCookie(ACCESS_KEY, access, ACCESS_MAX_AGE_SEC);
  setCookie(REFRESH_KEY, refresh, REFRESH_MAX_AGE_SEC);
  setCookie(USER_KEY, JSON.stringify(user), REFRESH_MAX_AGE_SEC);
}

export function clearSession(): void {
  deleteCookie(ACCESS_KEY);
  deleteCookie(REFRESH_KEY);
  deleteCookie(USER_KEY);
}
