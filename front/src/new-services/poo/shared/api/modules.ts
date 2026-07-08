import { apiFetch } from "./client";
import type { EntityStatus, ModuleResponse, ModulePageResponse } from "../types";
import { ModuleDTO, ModuleRequestDTO } from "./catalog";
import { fetchAllPages } from "./pagination";

export async function listAllModules(
  status?: EntityStatus,
) {
  return fetchAllPages<ModuleDTO>(
    "/modules",
    status ? { status } : {},
  );
}

export async function listModules(
  disciplineId: string,
  status?: EntityStatus,
) {
  return fetchAllPages<ModuleDTO>(
    "/modules",
    {
      disciplineId,
      ...(status && { status }),
    },
  );
}

export async function getModule(id: string) {
  return apiFetch<ModuleDTO>(`/modules/${id}`);
}

export async function createModule(
  data: ModuleRequestDTO,
) {
  return apiFetch<ModuleDTO>("/modules", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateModule(
  id: string,
  data: ModuleRequestDTO,
) {
  return apiFetch<ModuleDTO>(`/modules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changeModuleStatus(
  id: string,
  status: EntityStatus,
) {
  return apiFetch<void>(
    `/modules/${id}/status?status=${status}`,
    {
      method: "PATCH",
    },
  );
}
