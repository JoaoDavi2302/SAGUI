export type Role = "Admin" | "Professor" | "Aluno";

export interface LoggedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type EntityStatus = 'Active' | 'Inactive';

export interface ModuleResponse {
  id: string;
  name: string;
  description: string;
  orderIndex: number;
  status: EntityStatus;
  disciplineId: string;
}

export interface ModulePageResponse {
  content: ModuleResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
