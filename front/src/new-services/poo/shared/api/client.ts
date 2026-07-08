import { getAccessToken } from "@/new-services/auth/authApi";
import { API_BASE_URL } from "@/new-services/poo/shared/config";

function messageFromBody(body: unknown): string | undefined {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return undefined;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(messageFromBody(body) ?? `API error ${status}`);
    this.name = "ApiError";
  }
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await safeJson(response));
  }


//   if (!response.ok) {
//   const error = await safeJson(response);

//   console.error("STATUS:", response.status);
//   console.error("URL:", response.url);
//   console.error("BODY:", error);

//   throw new ApiError(response.status, error);
// }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
