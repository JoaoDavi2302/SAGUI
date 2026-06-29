// protege rotas pré carregamento
// redireciona antes do js
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/cadastro",
  "/recuperar-senha",
//   "/", não precisa
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("MIDDLEWARE:", pathname);

  // não interceptar next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (isPublic) {
    return NextResponse.next();
  }

  if (!token) {
    // console.log("~sem token");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};