import { apiFetch } from "./client";
import { fetchAllPages } from "./pagination";

export async function listActivities(moduleId?: string) {
  return fetchAllPages("/activities", moduleId ? { moduleId } : {});
}

export async function createActivity(data: unknown) {
  return apiFetch("/activities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateActivity(
  id: string,
  data: unknown,
) {
  return apiFetch(`/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}