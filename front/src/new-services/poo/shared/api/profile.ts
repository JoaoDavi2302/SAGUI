import { apiFetch } from "./client";

import type { UserProfileDTO } from "./catalog";

export interface UpdateProfileRequestDTO {
  name?: string;
  birthDate?: string;
  address?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function getProfile() {
  return apiFetch<UserProfileDTO>("/users/me");
}

export async function updateProfile(
  data: UpdateProfileRequestDTO,
) {
  return apiFetch<UserProfileDTO>("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}