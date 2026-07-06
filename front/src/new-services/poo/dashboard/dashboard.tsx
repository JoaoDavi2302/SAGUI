import { CourseEntity, DisciplineEntity, LessonEntity, ModuleEntity, UserEntity } from "../shared/types";

export interface StatCard {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
}

export interface StudentPerformance {
  student_id: string;
  discipline_id: string;
  progress_percent: number;
  grade: number;
}

export interface DashboardData {
  stats: StatCard[];
  courses: CourseEntity[];
  subjects: DisciplineEntity[];
  modules: ModuleEntity[];
  lessons?: LessonEntity[];
  module_progress?: any[];
  progressPercent?: number;
  completedModules?: number;
  student_performance?: StudentPerformance[];
  users?: UserEntity[];
}

export abstract class Dashboard {
  protected user: UserEntity;

  constructor(user: UserEntity) {
    this.user = user;
  }

  abstract getData(): Promise<DashboardData>;
}