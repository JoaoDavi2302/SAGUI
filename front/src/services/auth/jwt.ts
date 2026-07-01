import { Role } from "./types";

const ROLE_MAP: Record<string, Role> = {
  Admin: "ADMIN",
  Professor: "PROFESSOR",
  Aluno: "ALUNO",
};

export function parseRoleFromToken(token: string): Role | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const rawRole = payload.role as string | undefined;
    if (!rawRole) return null;
    return ROLE_MAP[rawRole] ?? null;
  } catch {
    return null;
  }
}
