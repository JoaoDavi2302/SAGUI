// filtro de rotas/validação pós login
// fallback
import { NextRequest, NextResponse } from "next/server";
import database from "@/components/mock.json";
import { routerPolicy, Role } from "@/services/auth/router-policy";
import { canAccess } from "./services/auth/router-acess";

function normalize(path: string) {
  const clean = path.split("?")[0];
  if (clean === "/") return "/";
  return clean.replace(/\/+$/, "");
}

const PUBLIC_ROUTES = new Set([
  "/login",
  "/cadastro",
  "/recuperar-senha",
  // redireciona para login
  "/",
]);

function isPublic(path: string) {
  return PUBLIC_ROUTES.has(path);
}

function getUserRole(userId: string): Role | null {
  const userRole = database.user_roles.find((r) => r.user_id === userId);

  const role = database.roles.find(
    (r) => r.id === userRole?.role_id
  )?.name;

  if (!role) return null;

  return role.toUpperCase() as Role;
}

// anterior
// function canAccess(path: string, role: Role) {
//   const match = Object.keys(routerPolicy)
//     .sort((a, b) => b.length - a.length)
//     .find((r) => path === r || path.startsWith(r + "/"));

//   if (!match) return false;

//   return routerPolicy[match].includes(role);
// }

export function proxy(req: NextRequest) {
  const path = normalize(req.nextUrl.pathname);

  // console.log("PROXY HIT:", path);

  // garante redirecionamento da rota publica
  if (isPublic(path)) {
    // console.log("PUBLIC ROUTE PROXY");
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    // console.log("sem token, login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = getUserRole(token);

  if (!role) {
    // console.log("sem role, login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!canAccess(path, role)) {
    // console.log("sem acesso, 404 not found");
    return NextResponse.redirect(new URL("/not-found", req.url));
  }

  // console.log("ALLOWED");
  return NextResponse.next();
}