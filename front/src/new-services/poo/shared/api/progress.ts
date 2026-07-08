import { apiFetch } from "./client";

export interface ModuleProgressResponse {
  moduleId: string;
  moduleName: string;
  orderIndex: number;
  progressPercentage: number;
  completed: boolean;
  unlocked: boolean;
}

export interface DisciplineProgressResponse {
  disciplineId: string;
  disciplineName: string;
  totalModules: number;
  completedModules: number;
  overallPercentage: number;
  modules: ModuleProgressResponse[];
}

/**
 * Obtém o progresso do aluno em uma disciplina
 * GET /disciplines/{disciplineId}/progress
 */
export async function getDisciplineProgress(disciplineId: string): Promise<DisciplineProgressResponse> {
  return apiFetch<DisciplineProgressResponse>(`/disciplines/${disciplineId}/progress`);
}

/**
 * Verifica se o módulo está liberado para o aluno
 * GET /modules/{moduleId}/access - retorna 200 se liberado, 403 se bloqueado
 */
export async function checkModuleAccess(moduleId: string): Promise<boolean> {
  try {
    await apiFetch<void>(`/modules/${moduleId}/access`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém o progresso do aluno em um módulo específico
 * GET /modules/{moduleId}/progress
 */
export async function getModuleProgress(moduleId: string): Promise<ModuleProgressResponse> {
  return apiFetch<ModuleProgressResponse>(`/modules/${moduleId}/progress`);
}

/**
 * Obtém o progresso de um aluno em uma matrícula (para professor/admin)
 * GET /enrollments/{enrollmentId}/progress
 */
export async function getEnrollmentProgress(enrollmentId: string): Promise<DisciplineProgressResponse> {
  return apiFetch<DisciplineProgressResponse>(`/enrollments/${enrollmentId}/progress`);
}

/**
 * Lista o progresso dos alunos em uma disciplina (para professor)
 * GET /disciplines/{disciplineId}/students/progress
 */
export async function listDisciplineStudentsProgress(
  disciplineId: string,
  page: number = 0,
  size: number = 20
): Promise<{
  content: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    overallPercentage: number;
    completedModules: number;
    totalModules: number;
  }>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}> {
  return apiFetch(`/disciplines/${disciplineId}/students/progress?page=${page}&size=${size}`);
}
