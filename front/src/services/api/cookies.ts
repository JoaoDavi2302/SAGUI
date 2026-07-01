export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie.split("; ").find((c) => c.startsWith(`${name}=`))?.split("=")[1];
}

export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}`;
}

export function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}