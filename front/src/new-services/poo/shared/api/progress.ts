import { apiFetch } from "./client";

export interface ModuleProgressDTO {
  moduleId: string;
  moduleName: string;
  orderIndex: number;
  progressPercentage: number;
  completed: boolean;
  unlocked: boolean;
}

export interface DisciplineProgressDTO {
  disciplineId: string;
  disciplineName: string;
  totalModules: number;
  completedModules: number;
  overallPercentage: number;
  modules: ModuleProgressDTO[];
}

export interface StudentProgressSummaryDTO {
  studentId: string;
  studentName: string;
  studentEmail: string;
  overallPercentage: number;
  completedModules: number;
  totalModules: number;
}

export interface StudentProgressSummaryPageDTO {
  content: StudentProgressSummaryDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function getEnrollmentProgress(enrollmentId: string) {
  return apiFetch<DisciplineProgressDTO>(`/enrollments/${enrollmentId}/progress`);
}

export async function listDisciplineStudentsProgress(
  disciplineId: string,
  params?: { page?: number; size?: number },
) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 20),
  });

  return apiFetch<StudentProgressSummaryPageDTO>(
    `/disciplines/${disciplineId}/students/progress?${searchParams}`,
  );
}
