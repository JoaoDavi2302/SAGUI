// filtro de rotas/validação pós login
import { NextRequest, NextResponse } from "next/server";

import type { Role } from "@/new-services/poo/shared/types";
import { canAccess } from "@/new-services/auth/router-acess";

function normalize(path: string) {
  const clean = path.split("?")[0];

  if (clean === "/") {
    return "/";
  }

  return clean.replace(/\/+$/, "");
}

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/cadastro",
  "/recuperar-senha",
  "/register"
]);

function isPublic(path: string) {
  return PUBLIC_ROUTES.has(path);
}

function getUserRole(req: NextRequest): Role | null {
  const role = req.cookies.get("role")?.value;

  if (role === "Admin" || role === "Professor" || role === "Aluno") {
    return role;
  }

  return null;
}

export function proxy(req: NextRequest) {
  const path = normalize(req.nextUrl.pathname);

  if (isPublic(path)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = getUserRole(req);

  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!canAccess(path, role)) {
    return NextResponse.redirect(new URL("/not-found", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
