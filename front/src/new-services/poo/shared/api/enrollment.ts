import { apiFetch } from "./client";
import { fetchAllPages } from "./pagination";

export interface EnrollmentDTO {
  id: string;
  studentId: string;
  disciplineId: string;
  courseId: string;
  status: string;
}

export interface EnrollmentRequestDTO {
  disciplineId: string;
  courseId?: string;
}

export async function listEnrollments() {
  return fetchAllPages<EnrollmentDTO>("/enrollments");
}

export async function createEnrollment(
  data: EnrollmentRequestDTO,
) {
  return apiFetch<EnrollmentDTO>("/enrollments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}