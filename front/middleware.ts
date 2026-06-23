// bloqueia ou permite acesso às rotas antes da página carregar, no lado do servidor/edge.
import { NextRequest, NextResponse } from "next/server";
import database from "./src/components/mock.json";

const PUBLIC_ROUTES = [
  "/login",
  "/cadastro",
  "/recuperar-senha",
];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const token = req.cookies.get("token")?.value;

  const user = database.users.find(u => u.id === token);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = database.user_roles.find(r => r.user_id === user.id);
    const roleName = database.roles.find(r => r.id === role?.role_id)?.name;

    if (roleName !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};