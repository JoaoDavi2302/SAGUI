const LOCAL_FALLBACK = "http://localhost:8080/api";

function normalizeApiBaseUrl(raw: string | undefined): string {
  if (!raw?.trim()) {
    return LOCAL_FALLBACK;
  }

  let url = raw.trim().replace(/\/$/, "");

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }

  return url;
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL,
);
