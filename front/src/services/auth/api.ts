import { apiFetch } from "../api/client";
import { components } from "../types/api-schema";

export type LoginResponseDTO = components["schemas"]["LoginResponse"];
export type UserProfileResponseDTO = components["schemas"]["UserProfileResponse"];
export type RefreshTokenResponseDTO = components["schemas"]["RefreshTokenResponse"];

export function loginRequest(email: string, password: string) {
  return apiFetch<LoginResponseDTO>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuthRefresh: true,
  });
}

export function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  address?: string;
}) {
  const body: Record<string, string> = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
  };

  if (payload.birthDate) {
    body.birthDate = payload.birthDate;
  }

  if (payload.address) {
    body.address = payload.address;
  }

  return apiFetch<LoginResponseDTO>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuthRefresh: true,
  });
}

export function getMyProfile() {
  return apiFetch<UserProfileResponseDTO>("/api/users/me");
}

export function logoutRequest(refreshToken: string) {
  return apiFetch<void>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    skipAuthRefresh: true,
  });
}
