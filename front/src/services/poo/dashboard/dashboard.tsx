import { Course } from "../course/Course";
import { User } from "../shared/types"; // Importe a interface User correta
import { Discipline, Lesson, Module, StudentPerformance, UserRole } from "./types/database"; // Ajuste conforme seu arquivo de tipos

// Adicione uma interface para os dados estatísticos se necessário
export interface Stats {
  totalStudents: number;
  activeTeachers: number;
  registeredCourses: number;
  disciplinesCount: number;
}

// para homepage de dashboard e (ead)
export interface DashboardData {
  stats: Stats; 
  courses: Course[];
  subjects: Discipline[];
  modules: Module[];
  lessons?: Lesson[];
  module_progress?: any[]; // Ou uma interface específica para progresso
  progressPercent?: number;
  completedModules?: number;
  student_performance?: StudentPerformance[];
  users?: User[];
}

export abstract class Dashboard {
  protected user: User | null;
  protected database: any; // Se possível, substitua 'any' pelo tipo do seu banco de dados

  constructor(user: User | null, database: any) {
    this.user = user;
    this.database = database;
  }

  abstract getData(): DashboardData;
}