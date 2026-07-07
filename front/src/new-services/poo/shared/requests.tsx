// payloads de entrada (POST/PUT/PATCH)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  address?: string;
}

export interface CourseRequest {
  name: string;
  description?: string;
}

export interface DisciplineRequest {
  name: string;
  description?: string;
  courseId: string;
  responsibleProfessorId: string;
}

export interface ModuleRequest {
  name: string;
  description?: string;
  orderIndex: number;
  disciplineId: string;
}

export interface LessonRequest {
  name: string;
  description?: string;
  orderIndex: number;
  moduleId: string;
}

export interface EnrollmentRequest {
  disciplineId: string;
  courseId?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  birthDate?: string;
  address?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}