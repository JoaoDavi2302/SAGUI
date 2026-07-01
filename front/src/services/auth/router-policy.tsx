export type Role = "ADMIN" | "PROFESSOR" | "ALUNO";

export const routerPolicy: Record<string, Role[]> = {
  "/": ["PROFESSOR", "ALUNO"],
  "/dashboard": ["ADMIN"],
  "/cursos": ["PROFESSOR", "ALUNO"],
  "/disciplinas": ["PROFESSOR", "ALUNO"],
  "/materiais": ["PROFESSOR", "ALUNO"],
  "/avaliacoes": ["PROFESSOR", "ALUNO"],
  "/aulas": ["PROFESSOR", "ALUNO"],
  "/perfil": ["ADMIN", "PROFESSOR", "ALUNO"],
  "/not-found": ["ADMIN", "PROFESSOR", "ALUNO"],
};

export function isAdminPanelRoute(pathname: string): boolean {
  const path =
    pathname === "/" ? "/" : pathname.split("?")[0].replace(/\/+$/, "") || "/";

  return (
    path === "/dashboard" ||
    path.startsWith("/dashboard/") ||
    path === "/perfil" ||
    path === "/not-found"
  );
}
