import { apiFetch } from "./client";
import type { EntityStatus } from "../types";

export interface CourseResponse {
  id: string;
  name: string;
  description: string;
  status: EntityStatus;
}

export interface CoursePageResponse {
  content: CourseResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function listCourses(
  status: EntityStatus = 'Active',
  page: number = 0,
  size: number = 20
): Promise<CoursePageResponse> {
  return apiFetch<CoursePageResponse>(
    `/courses?status=${status}&page=${page}&size=${size}`
  );
}

export async function getCourse(courseId: string): Promise<CourseResponse> {
  return apiFetch<CourseResponse>(`/courses/${courseId}`);
}
