import type { HeaderSearchType } from "./types";

export interface AdminHeaderConfig {
  title: string;
  searchType?: HeaderSearchType;
}

export function getAdminHeaderConfig(pathname: string): AdminHeaderConfig | null {
  if (pathname === "/dashboard") {
    return { title: "Painel", searchType: "courses" };
  }

  if (pathname.startsWith("/dashboard/cursos")) {
    return { title: "Cursos", searchType: "courses" };
  }

  if (pathname.startsWith("/dashboard/usuarios")) {
    return { title: "Usuários", searchType: "users" };
  }

  if (pathname.startsWith("/dashboard/matriculas")) {
    return { title: "Matrículas" };
  }

  if (pathname.startsWith("/perfil")) {
    return { title: "Perfil" };
  }

  if (pathname.startsWith("/disciplinas")) {
    return { title: "Disciplinas", searchType: "disciplines" };
  }

  if (pathname.startsWith("/avaliacoes")) {
    return { title: "Avaliações", searchType: "activities" };
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
