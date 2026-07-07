import { apiFetch } from "./client";

export type EnrollmentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface EnrollmentDetailDTO {
  id: string;
  status: EnrollmentStatus;
  studentId: string;
  studentName: string;
  disciplineId: string;
  disciplineName: string;
  courseId: string | null;
}

export interface EnrollmentPageDTO {
  content: EnrollmentDetailDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface EnrollmentActionDTO {
  id: string;
  status: EnrollmentStatus;
  message: string;
}

export interface EnrollmentRequestDTO {
  disciplineId: string;
  courseId?: string;
}

export async function listPendingEnrollmentsPage(params?: {
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 10),
  });

  return apiFetch<EnrollmentPageDTO>(
    `/enrollments/pending?${searchParams}`,
  );
}

export async function approveEnrollment(enrollmentId: string) {
  return apiFetch<EnrollmentActionDTO>(
    `/enrollments/${enrollmentId}/approve`,
    { method: "PUT" },
  );
}

export async function rejectEnrollment(enrollmentId: string) {
  return apiFetch<EnrollmentActionDTO>(
    `/enrollments/${enrollmentId}/reject`,
    { method: "PUT" },
  );
}

export async function requestEnrollment(data: EnrollmentRequestDTO) {
  return apiFetch<EnrollmentActionDTO>("/enrollments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelEnrollment(enrollmentId: string) {
  return apiFetch<EnrollmentActionDTO>(
    `/enrollments/${enrollmentId}/cancel`,
    { method: "PUT" },
  );
}

export async function listMyEnrollmentsPage(params?: {
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 10),
  });

  return apiFetch<EnrollmentPageDTO>(`/enrollments/my?${searchParams}`);
}
