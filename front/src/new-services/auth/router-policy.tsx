// politicas de acesso as rotas baseado em roles
import type { Role } from "@/new-services/poo/shared/types";

export type { Role };

export const routerPolicy: Record<string, Role[]> = {
  "/": ["Admin", "Professor", "Aluno"],
  "/dashboard": ["Admin"],
  "/dashboard/usuarios": ["Admin"],
  "/dashboard/matriculas": ["Admin"],
  "/dashboard/cursos": ["Admin"],
  "/dashboard/disciplinas": ["Admin"],
  "/cursos": ["Admin", "Professor", "Aluno"],
  "/cursos/gerenciar": ["Admin"],
  "/disciplinas": ["Admin", "Professor", "Aluno"],
  "/disciplinas/gerenciar": ["Admin"],
  "/materiais": ["Admin", "Professor", "Aluno"],
  "/avaliacoes": ["Admin", "Professor", "Aluno"],
  "/perfil": ["Admin", "Professor", "Aluno"],
  "/professor/relatorios": ["Professor"],
};
