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
} from "./requests";

import {
  CourseResponse,
  DisciplineResponse,
  LessonResponse,
  ModuleResponse,
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
export const apiAuth = {
  login: (data: LoginRequest) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* USERS */
export const apiUsers = {
  me: () => request("/api/users/me"),

  updateMe: (data: UpdateProfileRequest) =>
    request("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/* COURSES */
export const apiCourses = {
  list: (): Promise<CourseResponse[]> =>
    request<CourseResponse[]>("/api/courses"),

  get: (id: string): Promise<CourseResponse> =>
    request<CourseResponse>(`/api/courses/${id}`),

  create: (data: CourseRequest): Promise<CourseResponse> =>
    request<CourseResponse>("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const apiDisciplines = {
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

  delete: (id: string) =>
    request<boolean>(`/api/disciplines/${id}`, {
      method: "DELETE",
    }),
};

/* MODULES */
export const apiModules = {
  list: (): Promise<ModuleResponse[]> =>
    request<ModuleResponse[]>("/api/modules"),

  get: (id: string): Promise<ModuleResponse> =>
    request<ModuleResponse>(`/api/modules/${id}`),

  create: (data: ModuleRequest) =>
    request<ModuleCard>("/api/modules", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* LESSONS */
export const apiLessons = {
  listByModule: (moduleId: string): Promise<LessonResponse[]> =>
    request<LessonResponse[]>(`/api/lessons?moduleId=${moduleId}`),

  get: (id: string): Promise<LessonResponse> =>
    request<LessonResponse>(`/api/lessons/${id}`),

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
  request: (data: EnrollmentRequest) =>
    request("/api/enrollments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* para dashboard */
export const apiDashboard = {
  enrollments: () => request<any[]>("/api/enrollments"),
  courses: () => request<any[]>("/api/courses"),
  disciplines: () => request<any[]>("/api/disciplines"),
  modules: () => request<any[]>("/api/modules"),
  lessons: () => request<any[]>("/api/lessons"),
  users: () => request<any[]>("/api/users"),
  progress: () => request<any[]>("/api/module-progress"),
  activities: () => request<any[]>("/api/activities"),
};
