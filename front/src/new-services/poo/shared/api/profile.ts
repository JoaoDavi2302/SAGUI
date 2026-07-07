import { apiFetch } from "./client";

import type { Role } from "@/new-services/poo/shared/types";
import type { UserProfileDTO } from "./catalog";

export interface ProfileDTO extends UserProfileDTO {
  birthDate: string | null;
  address: string | null;
}

export interface UpdateProfileRequestDTO {
  name?: string;
  birthDate?: string;
  address?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function getProfile() {
  return apiFetch<ProfileDTO>("/users/me");
}

export async function updateProfile(
  data: UpdateProfileRequestDTO,
) {
  return apiFetch<ProfileDTO>("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getRoleLabel(role: Role) {
  const labels: Record<Role, string> = {
    Admin: "Administrador",
    Professor: "Professor",
    Aluno: "Aluno",
  };
  return labels[role];
}