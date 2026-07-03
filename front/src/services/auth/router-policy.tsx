// politicas de acesso as rotas baseado em roles
export type Role = "ADMINISTRADOR" | "PROFESSOR" | "ALUNO";

export const routerPolicy: Record<string, Role[]> = {
  "/dashboard": ["ADMINISTRADOR"],
  "/cursos": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
  "/disciplinas": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
  "/materiais": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
  "/avaliacoes": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
  "/perfil": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
};