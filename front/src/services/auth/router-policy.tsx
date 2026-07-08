// politicas de acesso as rotas baseado em roles
<<<<<<< HEAD
import type { Role } from "@/services/poo/shared/types";

export type { Role };

export const routerPolicy: Record<string, Role[]> = {
  "/dashboard": ["Admin"],
  "/dashboard/usuarios": ["Admin"],
  "/cursos": ["Admin", "Professor", "Aluno"],
  "/disciplinas": ["Admin", "Professor", "Aluno"],
  "/materiais": ["Admin", "Professor", "Aluno"],
  "/avaliacoes": ["Admin", "Professor", "Aluno"],
  "/perfil": ["Admin", "Professor", "Aluno"],
};
=======
export type Role = "ADMINISTRADOR" | "PROFESSOR" | "ALUNO";

export const routerPolicy: Record<string, Role[]> = {
  "/dashboard": ["ADMINISTRADOR"],
  "/cursos": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
  "/disciplinas": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
  "/materiais": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
  "/avaliacoes": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
  "/perfil": ["ADMINISTRADOR", "PROFESSOR", "ALUNO"],
};
>>>>>>> origin/develop
