import { CourseService } from "../course/course";
import { DisciplineProgressResponse, ModuleProgressResponse } from "../shared/responses";
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
  disciplines: DisciplineEntity[];
  modules: ModuleEntity[];

  lessons?: LessonEntity[];
  users?: UserEntity[];

  disciplineProgress?: DisciplineProgressResponse;
  moduleProgress?: ModuleProgressResponse[];

  progressPercent?: number;
  completedModules?: number;
}

export abstract class Dashboard {
  protected user: UserEntity;
  protected courseService: CourseService;

  constructor(user: UserEntity, courseService: CourseService) {
    this.user = user;
    this.courseService = courseService;
  }

  abstract getData(): Promise<DashboardData>;
}