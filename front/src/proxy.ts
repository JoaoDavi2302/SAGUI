// filtro de rotas/validação pós login
import { NextRequest, NextResponse } from "next/server";

import databaseJson from "@/components/mock.json";
import { Database } from "@/services/poo/shared/types";

const database = databaseJson as Database;

import { Role } from "@/services/poo/shared/types";
import { canAccess } from "@/services/auth/router-acess";

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
]);

function isPublic(path: string) {
  return PUBLIC_ROUTES.has(path);
}

function getUserRole(userId: string): Role |null {
  const user = database.usuarios.find(
    (u) => u.id === Number(userId),
  );

  return user?.perfil ?? null;
}

export function proxy(req: NextRequest) {
  const path = normalize(req.nextUrl.pathname);

  console.log("[PROXY]", path);

  // rotas públicas
  if (isPublic(path)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.log("[PROXY] sem token");

    return NextResponse.redirect(
      new URL("/login", req.url),
    );
  }

  const role = getUserRole(token);

  if (!role) {
    console.log("[PROXY] usuário inválido");

    return NextResponse.redirect(
      new URL("/login", req.url),
    );
  }

  if (!canAccess(path, role)) {
    console.log("[PROXY] acesso negado");

    return NextResponse.redirect(
      new URL("/not-found", req.url),
    );
  }

  console.log("[PROXY] acesso permitido");

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};