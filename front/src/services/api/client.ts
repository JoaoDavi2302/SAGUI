import { clearSession, getAccessToken, getRefreshToken, persistSession } from "./tokens";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  fields?: { field: string; message: string }[];

  constructor(
    status: number,
    message: string,
    fields?: { field: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export class NetworkError extends Error {
  constructor(message = "Não foi possível conectar ao servidor") {
    super(message);
    this.name = "NetworkError";
  }
}

export interface ApiFetchOptions extends RequestInit {
  skipAuthRefresh?: boolean;
}

let refreshInFlight: Promise<boolean> | null = null;

async function doRefreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const body = await res.json();
    const accessToken = body.accessToken ?? body.accesToken;
    const newRefreshToken = body.refreshToken;

    if (!accessToken || !newRefreshToken) return false;

    persistSession(accessToken, newRefreshToken);
    return true;
  } catch {
    return false;
  }
}

function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = doRefreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function isAuthPath(path: string) {
  return path.startsWith("/api/auth/");
}

async function executeFetch(path: string, options: RequestInit): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new NetworkError();
  }
}

function handleSessionExpired() {
  clearSession();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuthRefresh, ...fetchOptions } = options;

  let res = await executeFetch(path, fetchOptions);

  if (
    res.status === 401 &&
    !skipAuthRefresh &&
    !isAuthPath(path)
  ) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      res = await executeFetch(path, fetchOptions);
    } else {
      handleSessionExpired();
      throw new ApiError(401, "Sessão expirada");
    }
  }

  if (!res.ok) {
    let message = "Erro na requisição";
    let fields: { field: string; message: string }[] | undefined;

    try {
      const body = await res.json();
      message = body.message ?? message;
      if (Array.isArray(body.fields)) {
        fields = body.fields;
      }
    } catch {
      // mantém mensagem padrão
    }
    throw new ApiError(res.status, message, fields);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
