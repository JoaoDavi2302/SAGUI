import { apiFetch } from "./client";

export async function getDashboardEnrollments() {
  return apiFetch<any[]>("/enrollments");
}

export async function getDashboardCourses() {
  return apiFetch<any[]>("/courses");
}

export async function getDashboardDisciplines() {
  return apiFetch<any[]>("/disciplines");
}

export async function getDashboardModules() {
  return apiFetch<any[]>("/modules");
}

export async function getDashboardLessons() {
  return apiFetch<any[]>("/lessons");
}

export async function getDashboardUsers() {
  return apiFetch<any[]>("/users");
}

export async function getDashboardProgress() {
  return apiFetch<any[]>("/module-progress");
}

export async function getDashboardActivities() {
  return apiFetch<any[]>("/activities");
}