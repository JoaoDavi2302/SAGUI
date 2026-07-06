import { Role, Status } from "./types";

/* AUTH */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/* USER */
export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  perfil: Role;
  status: Status;
  birthDate?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

/* COURSE */
export interface CourseResponse {
  id: string;
  name: string;
  description?: string;
  status: Status;
}

/* DISCIPLINE */
export interface DisciplineResponse {
  id: string;
  name: string;
  description?: string;
  status: Status;
  courseId: string;
  responsibleProfessorId: string;
}

/* MODULE */
export interface ModuleResponse {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
  status: Status;
  disciplineId: string;
}

/* LESSON */
export interface LessonResponse {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
  status: Status;
  moduleId: string;
}

export interface LessonCompletionResponse {
  lessonId: string;
  completed: boolean;
  moduleProgress: ModuleProgressResponse;
}

/* ENROLLMENT */
// incompleto no back
export interface EnrollmentResponse {
  id: string;
  studentId: string;
  courseId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface EnrollmentDetailResponse {
  id: string;
  status: string;
  studentId: string;
  studentName: string;
  disciplineId: string;
  disciplineName: string;
  courseId: string;
}

/* PROGRESS */
export interface ModuleProgressResponse {
  moduleId: string;
  moduleName: string;
  orderIndex: number;
  progressPercentage: number;
  completed: boolean;
  unlocked: boolean;
}

export interface DisciplineProgressResponse {
  disciplineId: string;
  disciplineName: string;
  totalModules: number;
  completedModules: number;
  overallPercentage: number;
  modules: ModuleProgressResponse[];
}

/* PAGINATION */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}