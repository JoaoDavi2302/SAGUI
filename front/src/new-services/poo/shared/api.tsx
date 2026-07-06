// requisição api
import { LessonCard, ModuleCard } from "./cards";
import {
  CourseRequest,
  DisciplineRequest,
  LessonRequest,
  LoginRequest,
  RegisterRequest,
  ModuleRequest,
  EnrollmentRequest,
  UpdateProfileRequest,
  RefreshTokenRequest,
} from "./requests";

import {
  CourseResponse,
  DisciplineProgressResponse,
  DisciplineResponse,
  EnrollmentResponse,
  LessonCompletionResponse,
  LessonResponse,
  LoginResponse,
  ModuleProgressResponse,
  ModuleResponse,
  Page,
  UserProfileResponse,
} from "./responses";

const BASE_URL = "http://localhost:8080";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

/* AUTH */
// OK
export const apiAuth = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest): Promise<LoginResponse> =>
    request<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refresh: (data: RefreshTokenRequest) =>
    request("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (refreshToken: string): Promise<void> =>
    request("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({
        refreshToken,
      }),
    }),
};

/* USERS */
// OK
export const apiUsers = {
  me: (): Promise<UserProfileResponse> => request("/api/users/me"),

  list: (): Promise<Page<UserProfileResponse>> => request("/api/users"),

  updateMe: (data: UpdateProfileRequest) =>
    request("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  activate: (id: string) =>
    request(`/api/users/${id}/activate`, {
      method: "PATCH",
    }),

  deactivate: (id: string) =>
    request(`/api/users/${id}/deactivate`, {
      method: "PATCH",
    }),

  changeRole: (id: string, role: "ADMIN" | "PROFESSOR" | "ALUNO") =>
    request(`/api/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
};

/* COURSES */
// OK
export const apiCourses = {
  list: (): Promise<CourseResponse[]> =>
    request<CourseResponse[]>("/api/courses"),

  get: (id: string): Promise<CourseResponse> =>
    request<CourseResponse>(`/api/courses/${id}`),

  update: (id: string, data: Partial<CourseRequest>): Promise<CourseResponse> =>
    request(`/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changeStatus: (id: string, status: "Active" | "Inactive") =>
    request(`/api/courses/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  assignProfessor: (courseId: string, professorId: string) =>
    request(`/api/courses/${courseId}/professors/${professorId}`, {
      method: "POST",
    }),

  create: (data: CourseRequest): Promise<CourseResponse> =>
    request<CourseResponse>("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// OK
export const apiDisciplines = {
  progress: (disciplineId: string): Promise<DisciplineProgressResponse> =>
    request(`/api/disciplines/${disciplineId}/progress`),

  list: (): Promise<DisciplineResponse[]> =>
    request<DisciplineResponse[]>("/api/disciplines"),

  get: (id: string): Promise<DisciplineResponse> =>
    request<DisciplineResponse>(`/api/disciplines/${id}`),

  create: (data: Partial<DisciplineResponse>): Promise<DisciplineResponse> =>
    request<DisciplineResponse>("/api/disciplines", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<DisciplineResponse>) =>
    request<DisciplineResponse>(`/api/disciplines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changeStatus: (id: string, status: "Active" | "Inactive") =>
    request(`/api/disciplines/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

/* MODULES */
// OK
export const apiModules = {
  list: (): Promise<ModuleResponse[]> => request("/api/modules"),

  get: (id: string): Promise<ModuleResponse> => request(`/api/modules/${id}`),

  create: (data: ModuleRequest) =>
    request("/api/modules", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ModuleRequest>) =>
    request(`/api/modules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  progress: (moduleId: string): Promise<ModuleProgressResponse> =>
    request(`/api/modules/${moduleId}/progress`),

  access: (moduleId: string) => request(`/api/modules/${moduleId}/access`),

  changeStatus: (id: string, status: "Active" | "Inactive") =>
    request(`/api/modules/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

/* LESSONS */
// OK
export const apiLessons = {
  listByModule: (moduleId: string): Promise<LessonResponse[]> =>
    request<LessonResponse[]>(`/api/lessons?moduleId=${moduleId}`),

  get: (id: string): Promise<LessonResponse> =>
    request<LessonResponse>(`/api/lessons/${id}`),

  complete: (id: string): Promise<LessonCompletionResponse> =>
    request(`/api/lessons/${id}/complete`, {
      method: "PUT",
    }),

  changeStatus: (id: string, status: "Active" | "Inactive") =>
    request(`/api/lessons/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  create: (data: LessonRequest): Promise<LessonResponse> =>
    request<LessonResponse>("/api/lessons", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<LessonRequest>): Promise<LessonResponse> =>
    request<LessonResponse>(`/api/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/* ENROLLMENTS */
export const apiEnrollments = {
  my: (): Promise<EnrollmentResponse[]> =>
    request<EnrollmentResponse[]>("/api/enrollments/my"),

  pending: () => request("/api/enrollments/pending"),

  request: (data: EnrollmentRequest): Promise<EnrollmentResponse> =>
    request("/api/enrollments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id: string) =>
    request(`/api/enrollments/${id}/approve`, {
      method: "PUT",
    }),

  reject: (id: string) =>
    request(`/api/enrollments/${id}/reject`, {
      method: "PUT",
    }),

  cancel: (id: string) =>
    request(`/api/enrollments/${id}/cancel`, {
      method: "PUT",
    }),
};
