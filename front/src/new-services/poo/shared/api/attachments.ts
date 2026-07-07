import { apiFetch } from "./client";
import { fetchAllPages } from "./pagination";

export async function listAttachments(lessonId?: string) {
  return fetchAllPages("/attachments", lessonId ? { lessonId } : {});
}

export async function uploadAttachment(data: FormData) {
  return apiFetch("/attachments", {
    method: "POST",
    body: data,
  });
}

export async function deleteAttachment(id: string) {
  return apiFetch<void>(`/attachments/${id}`, {
    method: "DELETE",
  });
}