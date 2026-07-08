import { apiFetch } from "./client";
import { fetchAllPages } from "./pagination";
import type { Role } from "@/services/poo/shared/types";

export type EntityStatus = "Active" | "Inactive";

export interface CourseDTO {
  id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
}

export interface DisciplineDTO {
  id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  courseId: string;
  responsibleProfessorId: string;
}

export interface ModuleDTO {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  status: EntityStatus;
  disciplineId: string;
}

export interface UserProfileDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: EntityStatus;
}

export interface CourseRequestDTO {
  name: string;
  description?: string;
}

export interface DisciplineRequestDTO {
  name: string;
  description?: string;
  courseId: string;
  responsibleProfessorId: string;
}

export async function listCourses(status?: EntityStatus) {
  return fetchAllPages<CourseDTO>(
    "/courses",
    status ? { status } : {},
  );
}

export async function getCourse(id: string) {
  return apiFetch<CourseDTO>(`/courses/${id}`);
}

export async function getDiscipline(id: string) {
  return apiFetch<DisciplineDTO>(`/disciplines/${id}`);
}

export async function createCourse(data: CourseRequestDTO) {
  return apiFetch<CourseDTO>("/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCourse(id: string, data: CourseRequestDTO) {
  return apiFetch<CourseDTO>(`/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changeCourseStatus(
  courseId: string,
  status: EntityStatus,
) {
  return apiFetch<void>(`/courses/${courseId}/status?status=${status}`, {
    method: "PATCH",
  });
}

export async function listDisciplines(courseId?: string) {
  return fetchAllPages<DisciplineDTO>(
    "/disciplines",
    courseId ? { courseId } : {},
  );
}

export async function createDiscipline(data: DisciplineRequestDTO) {
  return apiFetch<DisciplineDTO>("/disciplines", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDiscipline(
  id: string,
  data: DisciplineRequestDTO,
) {
  return apiFetch<DisciplineDTO>(`/disciplines/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changeDisciplineStatus(
  disciplineId: string,
  status: EntityStatus,
) {
  return apiFetch<void>(`/disciplines/${disciplineId}/status?status=${status}`, {
    method: "PATCH",
  });
}

export async function listModules(disciplineId?: string) {
  return fetchAllPages<ModuleDTO>(
    "/modules",
    disciplineId ? { disciplineId } : {},
  );
}

export async function listProfessors() {
  return fetchAllPages<UserProfileDTO>("/users", { role: "Professor" });
}
