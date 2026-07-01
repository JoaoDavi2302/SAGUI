import { clearCookie, getCookie, setCookie } from "./cookies";

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

export function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function persistAccessToken(accessToken: string) {
  const exp = decodeJwtExp(accessToken);
  const maxAge = exp ? Math.max(exp - Math.floor(Date.now() / 1000), 0) : 86400;
  setCookie("token", accessToken, maxAge);
}

export function persistSession(accessToken: string, refreshToken: string) {
  persistAccessToken(accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearSession() {
  clearCookie("token");
  if (typeof window !== "undefined") {
    localStorage.removeItem("refreshToken");
  }
}

export function getAccessToken(): string | undefined {
  return getCookie("token");
}
