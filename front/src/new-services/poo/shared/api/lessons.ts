import { apiFetch } from "./client";
import { fetchAllPages } from "./pagination";

export type EntityStatus = "Active" | "Inactive";

export interface LessonDTO {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  status: EntityStatus;
  moduleId: string;
}

export interface LessonRequestDTO {
  name: string;
  description?: string;
  orderIndex: number;
  moduleId: string;
}

export async function listLessons(moduleId: string, status?: EntityStatus) {
  const params: Record<string, string> = { moduleId };
  if (status) params.status = status;

  return fetchAllPages<LessonDTO>("/lessons", params);
}

export async function createLesson(data: LessonRequestDTO) {
  return apiFetch<LessonDTO>("/lessons", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLesson(
  id: string,
  data: LessonRequestDTO,
) {
  return apiFetch<LessonDTO>(`/lessons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changeLessonStatus(
  lessonId: string,
  status: EntityStatus,
) {
  return apiFetch<void>(
    `/lessons/${lessonId}/status?status=${status}`,
    {
      method: "PATCH",
    },
  );
}

export async function deleteLesson(id: string) {
  return changeLessonStatus(id, "Inactive");
}