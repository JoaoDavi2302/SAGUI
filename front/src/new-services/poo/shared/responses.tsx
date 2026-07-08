import { Role } from "./types";

/* AUTH */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/* usuarios */
export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: boolean;
  birthDate?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

/* cursos */
export interface CourseResponse {
  id: string;
  name: string;
  description?: string;
  status: boolean;
}

/* disciplinas */
export interface DisciplineResponse {
  id: string;
  name: string;
  description?: string;
  status: boolean;
  courseId: string;
  responsibleProfessorId: string;
}

/* modulos */
export interface ModuleResponse {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
  status: boolean;
  disciplineId: string;
}

/* aulas */
export interface LessonResponse {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
  status: boolean;
  moduleId: string;
}

export interface LessonCompletionResponse {
  lessonId: string;
  completed: boolean;
  moduleProgress: any;
}

/* enrollement */
export interface EnrollmentResponse {
  id: string;
  status: string;
  message?: string;
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

/* progressos */
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

/* paginação */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}