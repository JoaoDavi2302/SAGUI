export type Role = "ADMIN" | "PROFESSOR" | "ALUNO";

export interface LoggedUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role: Role;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  address?: string;
}

export interface AuthContextType {
  user: LoggedUser | null;
  loading: boolean;
  effectiveRole: Role;
  login: (email: string, password: string) => Promise<Role | null>;
  register: (input: RegisterInput) => Promise<Role>;
  logout: () => void;
}

export function getPostLoginPath(role: Role): string {
  return role === "ADMIN" ? "/dashboard" : "/";
}
