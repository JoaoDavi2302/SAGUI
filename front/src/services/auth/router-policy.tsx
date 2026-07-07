// politicas de acesso as rotas baseado em roles
import type { Role } from "@/services/poo/shared/types";

export type { Role };

export const routerPolicy: Record<string, Role[]> = {
  "/dashboard": ["Admin"],
  "/cursos": ["Admin", "Professor", "Aluno"],
  "/disciplinas": ["Admin", "Professor", "Aluno"],
  "/materiais": ["Admin", "Professor", "Aluno"],
  "/avaliacoes": ["Admin", "Professor", "Aluno"],
  "/perfil": ["Admin", "Professor", "Aluno"],
};
