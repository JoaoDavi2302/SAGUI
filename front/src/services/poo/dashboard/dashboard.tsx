import { Course } from "../course/Course";
import { CourseEntity, DisciplineEntity, LessonEntity, ModuleEntity, UserEntity } from "../shared/types"; // Importe a interface User correta

// Adicione uma interface para os dados estatísticos se necessário
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

// Para dashboard e (ead)
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
  protected user: UserEntity | null;
  protected database: any; // Se possível, substitua 'any' pelo tipo do seu banco de dados

  constructor(user: UserEntity | null, database: any) {
    this.user = user;
    this.database = database;
  }

  abstract getData(): DashboardData;
}