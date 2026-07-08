import type { HeaderSearchType } from "./types";

export interface AdminHeaderConfig {
  title: string;
  searchType?: HeaderSearchType;
}

export function getAdminHeaderConfig(pathname: string): AdminHeaderConfig | null {
  if (pathname.startsWith("/dashboard/cursos/")) {
    return { title: "Curso", searchType: "disciplines" };
  }

  if (pathname.startsWith("/dashboard/cursos")) {
    return { title: "Cursos", searchType: "courses" };
  }

  if (pathname.startsWith("/dashboard/disciplinas/")) {
    return { title: "Disciplina" };
  }

  if (pathname.startsWith("/dashboard/disciplinas")) {
    return { title: "Disciplinas", searchType: "disciplines" };
  }

  if (pathname.startsWith("/dashboard/usuarios")) {
    return { title: "Usuários", searchType: "users" };
  }

  if (pathname.startsWith("/dashboard/matriculas")) {
    return { title: "Matrículas" };
  }

  if (pathname === "/dashboard") {
    return { title: "Painel", searchType: "courses" };
  }

  if (pathname.startsWith("/perfil")) {
    return { title: "Perfil" };
  }

  if (pathname.startsWith("/cursos/gerenciar/")) {
    return { title: "Curso", searchType: "disciplines" };
  }

  if (pathname.startsWith("/cursos")) {
    return { title: "Cursos", searchType: "courses" };
  }

  if (pathname.startsWith("/disciplinas/gerenciar/")) {
    return { title: "Disciplina" };
  }

  if (pathname.startsWith("/disciplinas")) {
    return { title: "Disciplinas", searchType: "disciplines" };
  }

  return null;
}

export interface ProfessorHeaderConfig {
  title: string;
  searchType?: HeaderSearchType;
}

export function getProfessorHeaderConfig(
  pathname: string,
): ProfessorHeaderConfig | null {
  if (pathname === "/" || pathname === "/professorPage") {
    return { title: "Início" };
  }

  if (pathname === "/professor/disciplinas") {
    return { title: "Disciplinas", searchType: "professor-disciplines" };
  }

  if (pathname.startsWith("/professor/disciplinas/")) {
    return { title: "Disciplina" };
  }

  if (pathname.startsWith("/professor/calendario")) {
    return { title: "Calendário" };
  }

  if (pathname.startsWith("/professor/relatorios")) {
    return { title: "Relatórios" };
  }

  if (pathname.startsWith("/perfil")) {
    return { title: "Perfil" };
  }

  return null;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
