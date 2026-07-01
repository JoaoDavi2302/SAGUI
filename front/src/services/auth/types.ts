export type Role = "ADMIN" | "PROFESSOR" | "ALUNO";

export interface LoggedUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role: Role;
}

export interface AuthContextType {
  user: LoggedUser | null;
  loading: boolean;
  effectiveRole: Role;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}