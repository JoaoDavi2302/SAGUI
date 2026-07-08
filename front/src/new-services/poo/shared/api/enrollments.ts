import { apiFetch } from "./client";

export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EnrollmentDetailResponse {
  id: string;
  status: EnrollmentStatus;
  studentId: string;
  studentName: string;
  studentEmail: string;
  disciplineId: string;
  disciplineName: string;
  courseId: string | null;
}

export interface EnrollmentPageResponse {
  content: EnrollmentDetailResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface EnrollmentRequest {
  disciplineId: string;
  courseId?: string;
}

export interface EnrollmentResponse {
  id: string;
  status: EnrollmentStatus;
  message: string;
}

/**
 * Lista matrículas do aluno logado
 * GET /enrollments/my
 */
export async function listMyEnrollmentsPage(
  page: number = 0,
  size: number = 20
): Promise<EnrollmentPageResponse> {
  return apiFetch<EnrollmentPageResponse>(`/enrollments/my?page=${page}&size=${size}`);
}

/**
 * Solicita matrícula em uma disciplina
 * POST /enrollments
 */
export async function requestEnrollment(
  data: EnrollmentRequest
): Promise<EnrollmentResponse> {
  return apiFetch<EnrollmentResponse>('/enrollments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Cancela uma matrícula
 * PUT /enrollments/{id}/cancel
 */
export async function cancelEnrollment(enrollmentId: string): Promise<EnrollmentResponse> {
  return apiFetch<EnrollmentResponse>(`/enrollments/${enrollmentId}/cancel`, {
    method: 'PUT',
  });
}
