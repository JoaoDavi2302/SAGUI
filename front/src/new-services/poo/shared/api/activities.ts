import { apiFetch } from "./client";

export type EntityStatus = "Active" | "Inactive";

export interface ActivityDTO {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  attemptLimit: number;
  minimumScore: number;
  status: EntityStatus;
}

export async function listActivities(moduleId?: string) {
  const params = new URLSearchParams();
  if (moduleId) {
    params.set("moduleId", moduleId);
  }

  const query = params.toString();
  return apiFetch<ActivityDTO[]>(
    query ? `/activities?${query}` : "/activities",
  );
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