import { API_BASE, api } from "./client";
import {
  type LoginResponse,
  type UserPublic,
  loginResponseSchema,
  userPublicSchema,
} from "../schemas/auth";

export const googleLoginUrl = `${API_BASE}/api/v1/auth/google/login`;

export function exchangeGoogleCode(code: string): Promise<LoginResponse> {
  return api.post(
    "/api/v1/auth/google/callback",
    { code },
    { schema: loginResponseSchema, authGuard: false },
  );
}

export function refresh(refresh_token: string): Promise<LoginResponse> {
  return api.post(
    "/api/v1/auth/refresh",
    { refresh_token },
    { schema: loginResponseSchema, authGuard: false },
  );
}

export function me(): Promise<UserPublic> {
  return api.get("/api/v1/auth/me", { schema: userPublicSchema });
}

export function logout(): Promise<void> {
  return api.delete("/api/v1/auth/logout").catch(() => undefined) as Promise<void>;
}
