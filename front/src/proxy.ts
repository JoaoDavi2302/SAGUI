// filtro de rotas/validação pós login
import { NextRequest, NextResponse } from "next/server";

<<<<<<< HEAD
import type { Role } from "@/new-services/poo/shared/types";
import { canAccess } from "@/new-services/auth/router-acess";
=======
import databaseJson from "@/components/mock.json";
import { Database } from "@/services/poo/shared/types";

const database = databaseJson as Database;

import { Role } from "@/services/poo/shared/types";
import { canAccess } from "@/services/auth/router-acess";
>>>>>>> origin/develop

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
<<<<<<< HEAD
  "/register"
=======
  "/recuperar-senha",
>>>>>>> origin/develop
]);

function isPublic(path: string) {
  return PUBLIC_ROUTES.has(path);
}

<<<<<<< HEAD
function getUserRole(req: NextRequest): Role | null {
  const role = req.cookies.get("role")?.value;

  if (role === "Admin" || role === "Professor" || role === "Aluno") {
    return role;
  }

  return null;
=======
function getUserRole(userId: string): Role |null {
  const user = database.usuarios.find(
    (u) => u.id === Number(userId),
  );

  return user?.perfil ?? null;
>>>>>>> origin/develop
}

export function proxy(req: NextRequest) {
  const path = normalize(req.nextUrl.pathname);

<<<<<<< HEAD
=======
  console.log("[PROXY]", path);

  // rotas públicas
>>>>>>> origin/develop
  if (isPublic(path)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
<<<<<<< HEAD
    return NextResponse.redirect(new URL("/login", req.url));
=======
    console.log("[PROXY] sem token");

    return NextResponse.redirect(
      new URL("/login", req.url),
    );
>>>>>>> origin/develop
  }

  const role = getUserRole(req);

  if (!role) {
<<<<<<< HEAD
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!canAccess(path, role)) {
    return NextResponse.redirect(new URL("/not-found", req.url));
  }

=======
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

>>>>>>> origin/develop
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
<<<<<<< HEAD
};
=======
};
>>>>>>> origin/develop
