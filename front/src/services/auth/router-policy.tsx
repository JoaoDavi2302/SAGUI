// politicas de acesso as rotas baseado em roles
export type Role = "ADMIN" | "PROFESSOR" | "ALUNO";

export const routerPolicy: Record<string, Role[]> = {
  "/dashboard": ["ADMIN"],
  "/cursos": ["ADMIN", "PROFESSOR", "ALUNO"],
  "/disciplinas": ["ADMIN", "PROFESSOR", "ALUNO"],
  "/materiais": ["ADMIN", "PROFESSOR", "ALUNO"],
  "/avaliacoes": ["ADMIN", "PROFESSOR", "ALUNO"],
  "/perfil": ["ADMIN", "PROFESSOR", "ALUNO"],
};