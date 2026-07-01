import { apiFetch } from "./client";
import { fetchAllPages, UserProfileDTO } from "./catalog";

export type UserRoleDTO = "Admin" | "Professor" | "Aluno";

export async function listUsers(params?: {
  role?: UserRoleDTO;
  search?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.role) qs.set("role", params.role);
  if (params?.search) qs.set("search", params.search);

  const query = qs.toString();
  const path = query ? `/api/users?${query}` : "/api/users";

  return fetchAllPages<UserProfileDTO>(path);
}

export async function changeUserRole(userId: string, role: UserRoleDTO) {
  return apiFetch<UserProfileDTO>(
    `/api/users/${userId}/role?role=${encodeURIComponent(role)}`,
    { method: "PATCH" },
  );
}

export async function activateUser(userId: string) {
  return apiFetch<UserProfileDTO>(`/api/users/${userId}/activate`, {
    method: "PATCH",
  });
}

export async function deactivateUser(userId: string) {
  return apiFetch<UserProfileDTO>(`/api/users/${userId}/deactivate`, {
    method: "PATCH",
  });
}
