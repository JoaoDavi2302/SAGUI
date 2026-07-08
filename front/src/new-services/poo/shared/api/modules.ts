import { apiFetch } from "./client";
import type { EntityStatus, ModuleResponse, ModulePageResponse } from "../types";

export async function listModules(
  disciplineId: string,
  status: EntityStatus = 'Active',
  page: number = 0,
  size: number = 20
): Promise<ModulePageResponse> {
  return apiFetch<ModulePageResponse>(
    `/modules?disciplineId=${disciplineId}&status=${status}&page=${page}&size=${size}`
  );
}

export async function getModule(moduleId: string): Promise<ModuleResponse> {
  return apiFetch<ModuleResponse>(`/modules/${moduleId}`);
}
