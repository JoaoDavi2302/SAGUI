import {
  CourseEntity,
  DisciplineEntity,
  LessonEntity,
  ModuleEntity,
} from "./types";

import {
  DisciplineProgressResponse,
  ModuleProgressResponse,
} from "./responses";

/* DISCIPLINE CARD */
export interface DisciplineCard extends DisciplineEntity {
  professorName: string;
  courseName: string;
  modules: ModuleCard[];
  progress: DisciplineProgressResponse;
}

/* MODULE CARD */
export interface ModuleCard extends ModuleEntity {
  lessons: LessonCard[];
  lessonsCount: number;
  completedLessons: number;
  percentage: number;
}

/* LESSON CARD */
export interface LessonCard extends LessonEntity {
  completed: boolean;
}

/* COURSE CARD */
export interface CourseCard extends CourseEntity {
  disciplinesCount?: number;
  enrolled?: boolean;
}

/* PROGRESS STUDENT */
export interface StudentProgressCard {
  id: string;
  name: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

/* MODULE DETAILS */
export interface ModuleDetailsCard extends ModuleEntity {
  lessons: LessonCard[];
  progress: number;
}