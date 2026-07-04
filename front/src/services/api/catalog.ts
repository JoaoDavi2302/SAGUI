import { apiFetch } from "./client";
import { components } from "../types/api-schema";

type Page<T> = {
  content?: T[];
  last?: boolean;
};

export async function fetchAllPages<T>(
  path: string,
  pageSize = 100,
): Promise<T[]> {
  const items: T[] = [];
  let page = 0;
  let last = false;

  while (!last) {
    const separator = path.includes("?") ? "&" : "?";
    const response = await apiFetch<Page<T>>(
      `${path}${separator}page=${page}&size=${pageSize}`,
    );

    items.push(...(response.content ?? []));
    last = response.last ?? true;
    page += 1;
  }

  return items;
}

export type EntityStatus = "Active" | "Inactive";

export type CourseDTO = components["schemas"]["CourseResponse"];
export type DisciplineDTO = components["schemas"]["DisciplineResponse"];
export type ModuleDTO = components["schemas"]["ModuleResponse"];
export type LessonDTO = components["schemas"]["LessonResponse"];
export type CourseRequestDTO = components["schemas"]["CourseRequest"];
export type DisciplineRequestDTO = components["schemas"]["DisciplineRequest"];
export type ModuleRequestDTO = components["schemas"]["ModuleRequest"];
export type UserProfileDTO = components["schemas"]["UserProfileResponse"];

export async function listCourses(status?: "Active" | "Inactive") {
  const query = status ? `?status=${status}` : "";
  return fetchAllPages<CourseDTO>(`/api/courses${query}`);
}

export async function getCourse(id: string) {
  return apiFetch<CourseDTO>(`/api/courses/${id}`);
}

export async function listDisciplines(courseId?: string) {
  const query = courseId ? `?courseId=${courseId}` : "";
  return fetchAllPages<DisciplineDTO>(`/api/disciplines${query}`);
}

export async function getDiscipline(id: string) {
  return apiFetch<DisciplineDTO>(`/api/disciplines/${id}`);
}

export async function listModules(disciplineId?: string) {
  const query = disciplineId ? `?disciplineId=${disciplineId}` : "";
  return fetchAllPages<ModuleDTO>(`/api/modules${query}`);
}

export async function listLessonsByModule(moduleId: string) {
  return fetchAllPages<LessonDTO>(`/api/lessons?moduleId=${moduleId}`);
}

export async function listAllLessons(moduleIds: string[]) {
  if (moduleIds.length === 0) return [];

  const lessonsByModule = await Promise.all(
    moduleIds.map((moduleId) => listLessonsByModule(moduleId)),
  );

  return lessonsByModule.flat();
}

export async function createCourse(data: CourseRequestDTO) {
  return apiFetch<CourseDTO>("/api/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createDiscipline(data: DisciplineRequestDTO) {
  return apiFetch<DisciplineDTO>("/api/disciplines", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createModule(data: ModuleRequestDTO) {
  return apiFetch<ModuleDTO>("/api/modules", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function changeCourseStatus(courseId: string, status: EntityStatus) {
  return apiFetch<void>(
    `/api/courses/${courseId}/status?status=${encodeURIComponent(status)}`,
    { method: "PATCH" },
  );
}

export async function changeDisciplineStatus(
  disciplineId: string,
  status: EntityStatus,
) {
  return apiFetch<void>(
    `/api/disciplines/${disciplineId}/status?status=${encodeURIComponent(status)}`,
    { method: "PATCH" },
  );
}

export async function listProfessors() {
  return fetchAllPages<UserProfileDTO>("/api/users?role=Professor");
}
