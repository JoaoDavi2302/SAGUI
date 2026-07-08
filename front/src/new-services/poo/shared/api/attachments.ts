import { apiFetch } from "./client";

export type AttachmentType = "DOCUMENT" | "IMAGE" | "VIDEO";
export type EntityStatus = "Active" | "Inactive";

export interface AttachmentDTO {
  id: string;
  name: string;
  fileUrl: string;
  attachmentType: AttachmentType;
  lessonId: string;
  status: EntityStatus;
  videoId?: string;
}

export interface AttachmentRequest {
  name: string;
  fileUrl: string;
  attachmentType: AttachmentType;
  lessonId: string;
}

export async function listAttachments(
  lessonId: string,
  status?: EntityStatus,
): Promise<AttachmentDTO[]> {
  const params = new URLSearchParams({ lessonId });
  if (status) {
    params.set("status", status);
  }

  return apiFetch<AttachmentDTO[]>(`/attachments?${params}`);
}

export async function getAttachment(id: string): Promise<AttachmentDTO> {
  return apiFetch<AttachmentDTO>(`/attachments/${id}`);
}

export async function createAttachment(
  data: AttachmentRequest,
): Promise<AttachmentDTO> {
  return apiFetch<AttachmentDTO>("/attachments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAttachment(
  id: string,
  data: AttachmentRequest,
): Promise<AttachmentDTO> {
  return apiFetch<AttachmentDTO>(`/attachments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changeAttachmentStatus(
  id: string,
  status: EntityStatus,
): Promise<void> {
  return apiFetch<void>(`/attachments/${id}/status?status=${status}`, {
    method: "PATCH",
  });
}

export async function deleteAttachment(id: string): Promise<void> {
  return apiFetch<void>(`/attachments/${id}`, {
    method: "DELETE",
  });
}
