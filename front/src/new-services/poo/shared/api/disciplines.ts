import { apiFetch } from "./client";
import type { EntityStatus } from "./types";

export interface DisciplineResponse {
  id: string;
  name: string;
  description: string;
  status: EntityStatus;
  courseId: string;
  responsibleProfessorId: string;
}

export interface DisciplinePageResponse {
  content: DisciplineResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * Lista disciplinas (com filtro opcional por curso)
 * GET /disciplines?courseId={courseId}
 */
export async function listDisciplines(
  courseId?: string,
  page: number = 0,
  size: number = 20
): Promise<DisciplinePageResponse> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('size', String(size));
  if (courseId) params.append('courseId', courseId);

  return apiFetch<DisciplinePageResponse>(`/disciplines?${params.toString()}`);
}

/**
 * Obtém uma disciplina por ID
 * GET /disciplines/{id}
 */
export async function getDiscipline(disciplineId: string): Promise<DisciplineResponse> {
  return apiFetch<DisciplineResponse>(`/disciplines/${disciplineId}`);
}
