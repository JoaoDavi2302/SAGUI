import { apiFetch } from "./client";

export type EntityStatus = "Active" | "Inactive";

export type AttemptStatus = "IN_PROGRESS" | "FINISHED";

export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";

export interface QuestionDTO {
  id: string;
  statement: string;
  questionType: QuestionType;
  score: number;
  alternatives: AlternativeDTO[];
}

export interface ActivityDetailDTO {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  attemptLimit: number;
  minimumScore: number;
  status: EntityStatus;
  questions: QuestionDTO[];
}

export interface AlternativeRequestDTO {
  text: string;
  correct: boolean;
}

export interface QuestionRequestDTO {
  statement: string;
  questionType: QuestionType;
  score: number;
  alternatives: AlternativeRequestDTO[];
}

export interface ActivityRequestDTO {
  moduleId: string;
  title: string;
  description?: string;
  questions: QuestionRequestDTO[];
}

export interface ActivityDTO {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  attemptLimit: number;
  minimumScore: number;
  status: EntityStatus;
}

export interface AlternativeDTO {
  id: string;
  text: string;
  correct: boolean;
}

export interface ActivityAttemptSummaryDTO {
  attemptId: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  score: number;
  approved: boolean;
  status: AttemptStatus;
  submittedAt: string;
}

export interface ActivityAttemptPageDTO {
  content: ActivityAttemptSummaryDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface StudentAnswerDetailDTO {
  questionId: string;
  statement: string;
  selectedAlternatives: AlternativeDTO[];
  correctAlternatives: AlternativeDTO[];
  correct: boolean;
  questionScore: number;
}

export interface ActivityAttemptDetailDTO {
  attemptId: string;
  activityId: string;
  activityTitle: string;
  minimumScore: number;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  score: number;
  approved: boolean;
  status: AttemptStatus;
  submittedAt: string;
  answers: StudentAnswerDetailDTO[];
}

export interface PendingActivityDTO {
  studentId: string;
  studentName: string;
  activityId: string;
  activityTitle: string;
  moduleId: string;
  moduleName: string;
  attemptsUsed: number;
  attemptLimit: number;
  bestScore: number | null;
}

export interface PendingActivityPageDTO {
  content: PendingActivityDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function listActivities(moduleId: string) {
  const params = new URLSearchParams({ moduleId });
  return apiFetch<ActivityDTO[]>(`/activities?${params}`);
}

export async function listActivityAttempts(
  activityId: string,
  params?: { studentId?: string; approved?: boolean; page?: number; size?: number },
) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 20),
  });

  if (params?.studentId) {
    searchParams.set("studentId", params.studentId);
  }
  if (params?.approved !== undefined) {
    searchParams.set("approved", String(params.approved));
  }

  return apiFetch<ActivityAttemptPageDTO>(
    `/activities/${activityId}/attempts?${searchParams}`,
  );
}

export async function getActivityAttemptDetail(activityId: string, attemptId: string) {
  return apiFetch<ActivityAttemptDetailDTO>(
    `/activities/${activityId}/attempts/${attemptId}`,
  );
}

export async function listPendingActivities(
  disciplineId: string,
  params?: { page?: number; size?: number },
) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 20),
  });

  return apiFetch<PendingActivityPageDTO>(
    `/disciplines/${disciplineId}/pending-activities?${searchParams}`,
  );
}

export async function getActivity(id: string) {
  return apiFetch<ActivityDetailDTO>(`/activities/${id}`);
}

export async function createActivity(data: ActivityRequestDTO) {
  return apiFetch<ActivityDetailDTO>("/activities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateActivity(id: string, data: ActivityRequestDTO) {
  return apiFetch<ActivityDetailDTO>(`/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteActivity(id: string) {
  return apiFetch<void>(`/activities/${id}`, { method: "DELETE" });
}