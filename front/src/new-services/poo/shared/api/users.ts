import { apiFetch } from "./client";
import { fetchAllPages } from "./pagination";
import type { UserProfileDTO } from "./catalog";
import type { Role } from "@/services/poo/shared/types";

export type UserRoleDTO = Role;

export async function listUsers(params?: {
  role?: UserRoleDTO;
  search?: string;
}) {
  const query: Record<string, string> = {};
  if (params?.role) query.role = params.role;
  if (params?.search) query.search = params.search;

  return fetchAllPages<UserProfileDTO>("/users", query);
}

export async function changeUserRole(userId: string, role: UserRoleDTO) {
  return apiFetch<UserProfileDTO>(
    `/users/${userId}/role?role=${encodeURIComponent(role)}`,
    { method: "PATCH" },
  );
}

export async function activateUser(userId: string) {
  return apiFetch<UserProfileDTO>(`/users/${userId}/activate`, {
    method: "PATCH",
  });
}

export async function deactivateUser(userId: string) {
  return apiFetch<UserProfileDTO>(`/users/${userId}/deactivate`, {
    method: "PATCH",
  });
}
