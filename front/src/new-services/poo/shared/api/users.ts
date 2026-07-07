import { apiFetch } from "./client";
import { fetchAllPages } from "./pagination";
import type { UserProfileDTO } from "./catalog";
import type { Role } from "@/new-services/poo/shared/types";

export type UserRoleDTO = Role;

export interface CreateUserRequestDTO {
  name: string;
  email: string;
  password: string;
  role: UserRoleDTO;
  birthDate?: string;
  address?: string;
}

export interface UserPageDTO {
  content: UserProfileDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function listUsersPage(params?: {
  page?: number;
  size?: number;
  role?: UserRoleDTO;
  search?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 10),
  });

  if (params?.role) searchParams.set("role", params.role);
  if (params?.search?.trim()) searchParams.set("search", params.search.trim());

  return apiFetch<UserPageDTO>(`/users?${searchParams}`);
}

export async function listUsers(params?: {
  role?: UserRoleDTO;
  search?: string;
}) {
  const query: Record<string, string> = {};
  if (params?.role) query.role = params.role;
  if (params?.search) query.search = params.search;

  return fetchAllPages<UserProfileDTO>("/users", query);
}

export async function createUser(data: CreateUserRequestDTO) {
  return apiFetch<UserProfileDTO>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
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
