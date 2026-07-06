// entidades base
export type Role = "ADMIN" | "PROFESSOR" | "ALUNO";
export type Status = "Active" | "Inactive";

export interface Database {
  usuarios: UserEntity[];
  cursos: CourseEntity[];
  disciplinas: DisciplineEntity[];
  modulos: ModuleEntity[];
  aulas: LessonEntity[];
  anexos: AttachmentEntity[];
  atividades: ActivityEntity[];
  questoes: QuestionEntity[];
  alternativas: AlternativeEntity[];
  matriculas: EnrollmentEntity[];
  progresso_modulo: ModuleProgressEntity[];
}

/* USERS */
export interface UserEntity {
  id: number;
  name: string;
  email: string;
  perfil: Role,
  status: Status;
  birthDate?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoggedUser {
  id: number;
  name: string;
  email: string;
  perfil: Role;
}

/* COURSE */
export interface CourseEntity {
  id: string;
  name: string;
  description?: string;
  status: Status;
}

/* DISCIPLINE */
export interface DisciplineEntity {
  id: string;
  courseId: string;
  responsibleProfessorId: string;
  name: string;
  description?: string;
  status: Status;
}

/* MODULE */
export interface ModuleEntity {
  id: string;
  disciplineId: string;
  name: string;
  description?: string;
  orderIndex: number;
  status: Status;
}

/* LESSON */
export interface LessonEntity {
  id: string;
  moduleId: string;
  name: string;
  description?: string;
  orderIndex: number;
  status: Status;
}

/* ENROLLMENT */
export interface EnrollmentEntity {
  id: string;
  studentId: string;
  disciplineId: string;
  courseId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
}

/* PROGRESS */
export interface ModuleProgressEntity {
  moduleId: string;
  moduleName: string;
  progressPercentage: number;
  completed: boolean;
  unlocked: boolean;
}

/* ACTIVITY */
export interface ActivityEntity {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
}

/* QUESTIONS */
export interface QuestionEntity {
  id: string;
  activityId: string;
  statement: string;
}

/* não usado */
export interface AlternativeEntity {
  id: number;
  questionId: number;
  text: string;
  right: boolean;
  order: number;
}

/* não usado ainda */
export interface AttachmentEntity {
  id: number;
  moduleId?: number | null;
  lessonId?: number | null;
  activityId?: number | null;
  type: string;
  name_file: string;
  url: string;
  byte_size: number;
  criado_em: string;
}


