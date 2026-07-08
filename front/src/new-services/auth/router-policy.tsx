// politicas de acesso as rotas baseado em roles
import type { Role } from "@/new-services/poo/shared/types";

export type { Role };

export const routerPolicy: Record<string, Role[]> = {
  "/dashboard": ["Admin"],
  "/dashboard/usuarios": ["Admin"],
  "/dashboard/matriculas": ["Admin"],
  "/dashboard/cursos": ["Admin"],
  "/cursos": ["Admin", "Professor", "Aluno"],
  "/disciplinas": ["Admin", "Professor", "Aluno"],
  "/materiais": ["Admin", "Professor", "Aluno"],
  "/avaliacoes": ["Admin", "Professor", "Aluno"],
  "/perfil": ["Admin", "Professor", "Aluno"],
};
