import { apiFetch } from "./client";

// === TIPOS ===

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
export type AttemptStatus = 'DRAFT' | 'SUBMITTED';

export interface AlternativeResponse {
  id: string;
  text: string;
  correct?: boolean;
}

export interface QuestionResponse {
  id: string;
  statement: string;
  questionType: QuestionType;
  score: number;
  alternatives: AlternativeResponse[];
}

export interface ActivityResponse {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  attemptLimit: number;
  minimumScore: number;
  status: string;
  questions: QuestionResponse[];
}

export interface ActivityStudentSummaryResponse {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
  disciplineId: string;
  disciplineName: string;
  attemptsUsed: number;
  attemptLimit: number;
  bestScore: number | null;
  hasApprovedAttempt: boolean;
  minimumScore: number;
}

export interface ActivityAttemptResultResponse {
  attemptId: string;
  attemptNumber: number;
  score: number;
  approved: boolean;
  message: string;
}

export interface StudentAnswerRequest {
  questionId: string;
  selectedAlternativeIds: string[];
}

export interface ActivitySubmissionRequest {
  answers: StudentAnswerRequest[];
}

export interface ActivityAttemptSummaryResponse {
  attemptId: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  score: number;
  approved: boolean;
  status: AttemptStatus;
  submittedAt: string;
}

/**
 * Lista atividades de um módulo para o aluno
 * GET /activities?moduleId={moduleId}
 */
export async function listStudentActivities(
  moduleId: string
): Promise<ActivityStudentSummaryResponse[]> {
  const response = await apiFetch<{ content: ActivityStudentSummaryResponse[] }>(
    `/activities?moduleId=${moduleId}`
  );
  return response.content || [];
}

/**
 * Obtém uma atividade para o aluno responder (com questões e alternativas)
 * GET /activities/{id}/take
 */
export async function getActivityForTake(activityId: string): Promise<ActivityResponse> {
  return apiFetch<ActivityResponse>(`/activities/${activityId}/take`);
}

/**
 * Lista as tentativas do aluno para uma atividade
 * GET /activities/{id}/my-attempts
 */
export async function listMyActivityAttempts(
  activityId: string
): Promise<ActivityAttemptSummaryResponse[]> {
  const response = await apiFetch<{ content: ActivityAttemptSummaryResponse[] }>(
    `/activities/${activityId}/my-attempts`
  );
  return response.content || [];
}

/**
 * Submete respostas para uma atividade
 * POST /activities/{id}/submissions
 */
export async function submitActivity(
  activityId: string,
  answers: StudentAnswerRequest[]
): Promise<ActivityAttemptResultResponse> {
  return apiFetch<ActivityAttemptResultResponse>(
    `/activities/${activityId}/submissions`,
    {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }
  );
}

// ===== TIPOS PARA PROFESSOR =====

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

export interface PendingActivityPageResponse {
  content: PendingActivityDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * Lista atividades pendentes de correção/avaliação em uma disciplina (para professor)
 * GET /disciplines/{disciplineId}/pending-activities
 */
export async function listPendingActivities(
  disciplineId: string,
  page: number = 0,
  size: number = 20
): Promise<PendingActivityPageResponse> {
  return apiFetch<PendingActivityPageResponse>(
    `/disciplines/${disciplineId}/pending-activities?page=${page}&size=${size}`
  );
}

/**
 * Lista tentativas de uma atividade (para professor/admin)
 * GET /activities/{id}/attempts
 */
export async function listActivityAttempts(
  activityId: string,
  page: number = 0,
  size: number = 20,
  studentId?: string,
  approved?: boolean
): Promise<{
  content: Array<{
    attemptId: string;
    studentId: string;
    studentName: string;
    attemptNumber: number;
    score: number | null;
    approved: boolean | null;
    status: string;
    submittedAt: string;
  }>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('size', String(size));
  if (studentId) params.append('studentId', studentId);
  if (approved !== undefined) params.append('approved', String(approved));

  return apiFetch(`/activities/${activityId}/attempts?${params.toString()}`);
}

/**
 * Obtém detalhe de uma tentativa com gabarito (para professor/admin)
 * GET /activities/{id}/attempts/{attemptId}
 */
export async function getAttemptDetail(
  activityId: string,
  attemptId: string
): Promise<{
  attemptId: string;
  activityId: string;
  activityTitle: string;
  minimumScore: number;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  score: number | null;
  approved: boolean | null;
  status: string;
  submittedAt: string;
  answers: Array<{
    questionId: string;
    statement: string;
    selectedAlternatives: Array<{ id: string; text: string }>;
    correctAlternatives: Array<{ id: string; text: string }>;
    correct: boolean;
    questionScore: number;
  }>;
}> {
  return apiFetch(`/activities/${activityId}/attempts/${attemptId}`);
}
