import { NextRequest, NextResponse } from "next/server";
import { canAccess } from "@/services/auth/router-acess";
import { parseRoleFromToken } from "@/services/auth/jwt";
import { isAdminPanelRoute, Role } from "@/services/auth/router-policy";

const PUBLIC_ROUTES = new Set([
  "/login",
  "/cadastro",
  "/recuperar-senha",
]);

function normalizePath(pathname: string) {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function middleware(req: NextRequest) {
  const pathname = normalizePath(req.nextUrl.pathname);

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  const isPublic = PUBLIC_ROUTES.has(pathname);

  if (isPublic) {
    if (token && (pathname === "/login" || pathname === "/cadastro")) {
      const role = parseRoleFromToken(token) as Role | null;
      const dest = role === "ADMIN" ? "/dashboard" : "/";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = parseRoleFromToken(token) as Role | null;

  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (role === "ADMIN" && !isAdminPanelRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!canAccess(pathname, role)) {
    return NextResponse.redirect(new URL("/not-found", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
