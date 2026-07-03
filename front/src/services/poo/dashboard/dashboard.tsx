import { Course } from "../course/Course";
import { UserEntity } from "../shared/types"; // Importe a interface User correta
import { Discipline, Lesson, Module, StudentPerformance } from "./types/database"; // Ajuste conforme seu arquivo de tipos

// Adicione uma interface para os dados estatísticos se necessário
export interface StatCard {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
}

// Para dashboard e (ead)
export interface DashboardData {
  stats: StatCard[];
  courses: Course[];
  subjects: Discipline[];
  modules: Module[];
  lessons?: Lesson[];
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