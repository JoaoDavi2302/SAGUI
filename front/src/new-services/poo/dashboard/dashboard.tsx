import type {
  CourseDTO,
  DisciplineDTO,
  ModuleDTO,
  UserProfileDTO,
} from "@/services/api/catalog";
import type { LessonDTO } from "@/new-services/poo/shared/api/lessons";
import type { LoggedUser } from "@/new-services/poo/shared/types";

export interface StatCard {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
}

export interface StudentPerformance {
  studentId: string;
  disciplineId: string;
  progressPercent: number;
  grade: number;
}

export interface DashboardData {
  stats: StatCard[];

  courses: CourseDTO[];
  subjects: DisciplineDTO[];
  modules: ModuleDTO[];

  lessons?: LessonDTO[];

  moduleProgress?: unknown[];

  progressPercent?: number;

  completedModules?: number;

  studentPerformance?: StudentPerformance[];

  users?: UserProfileDTO[];
}

export abstract class Dashboard {
  protected readonly user: LoggedUser;

  constructor(user: LoggedUser) {
    this.user = user;
  }

  abstract getData(): Promise<DashboardData>;
}