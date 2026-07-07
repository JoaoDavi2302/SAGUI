import { API_BASE_URL } from "../poo/shared/config";
import type { LoggedUser, Role } from "@/services/poo/shared/types";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

/** Compatível com backend antigo que serializava `accesToken` (typo). */
function normalizeLoginResponse(data: Record<string, unknown>): LoginResponse {
  const accessToken =
    typeof data.accessToken === "string"
      ? data.accessToken
      : typeof data.accesToken === "string"
        ? data.accesToken
        : null;

  const refreshToken =
    typeof data.refreshToken === "string" ? data.refreshToken : null;

  if (!accessToken || !refreshToken) {
    throw new Error("INVALID_AUTH_RESPONSE");
  }

  return { accessToken, refreshToken };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  address?: string;
}

interface ApiErrorResponse {
  message?: string;
  fields?: { field: string; message: string }[];
}

export class AuthRequestError extends Error {
  constructor(
    message: string,
    public readonly code: "DUPLICATE_EMAIL" | "VALIDATION" | "UNKNOWN",
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "AuthRequestError";
  }
}

interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
}

function parseRole(role: string): Role {
  if (role === "Admin" || role === "Professor" || role === "Aluno") {
    return role;
  }
  return "Aluno";
}

export function setSessionCookies(role: Role) {
  document.cookie = "token=1; path=/; max-age=86400; SameSite=Lax";
  document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearSessionCookies() {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function clearStoredTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function mapUserProfile(data: UserProfileResponse): LoggedUser {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: parseRole(data.role),
  };
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const data = await response.json();
  return normalizeLoginResponse(data);
}

async function parseAuthError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  let body: ApiErrorResponse = {};

  try {
    body = await response.json();
  } catch {
    // resposta sem JSON
  }

  if (response.status === 422 && body.fields?.length) {
    const fieldErrors = Object.fromEntries(
      body.fields.map((field) => [field.field, field.message]),
    );

    throw new AuthRequestError(
      body.message ?? "Verifique os campos do formulário.",
      "VALIDATION",
      fieldErrors,
    );
  }

  const message = body.message ?? fallbackMessage;

  if (
    response.status === 401 &&
    message.toLowerCase().includes("cadastrado")
  ) {
    throw new AuthRequestError(message, "DUPLICATE_EMAIL");
  }

  throw new AuthRequestError(message, "UNKNOWN");
}

export async function registerRequest(
  input: RegisterInput,
): Promise<LoginResponse> {
  const payload: Record<string, string> = {
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
  };

  if (input.birthDate) {
    payload.birthDate = input.birthDate;
  }

  if (input.address?.trim()) {
    payload.address = input.address.trim();
  }

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseAuthError(response, "Não foi possível concluir o cadastro.");
  }

  const responseData = await response.json();
  return normalizeLoginResponse(responseData);
}

export async function fetchMe(accessToken: string): Promise<LoggedUser> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("UNAUTHORIZED");
  }

  const data: UserProfileResponse = await response.json();
  return mapUserProfile(data);
}

export async function logoutRequest(refreshToken: string | null) {
  if (!refreshToken) return;

  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}
