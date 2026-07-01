import {
  CourseDTO,
  DisciplineDTO,
  LessonDTO,
  ModuleDTO,
} from "./catalog";
import {
  Course,
  Discipline,
  Lesson,
  Module,
} from "../types/database";

export function mapCourse(course: CourseDTO): Course {
  return {
    id: course.id ?? "",
    name: course.name ?? "",
    area: course.description ?? "",
    workload: 0,
  };
}

export function mapDiscipline(discipline: DisciplineDTO): Discipline {
  return {
    id: discipline.id ?? "",
    course_id: discipline.courseId ?? "",
    professor_id: discipline.responsibleProfessorId ?? "",
    name: discipline.name ?? "",
    description: discipline.description ?? "",
    workload: 0,
    order_index: 0,
  };
}

export function mapModule(module: ModuleDTO): Module {
  return {
    id: module.id ?? "",
    discipline_id: module.disciplineId ?? "",
    name: module.name ?? "",
    description: module.description ?? "",
    order_index: module.orderIndex ?? 0,
  };
}

export function mapLesson(lesson: LessonDTO): Lesson {
  return {
    id: lesson.id ?? "",
    module_id: lesson.moduleId ?? "",
    name: lesson.name ?? "",
    content: lesson.description ?? "",
    order_index: lesson.orderIndex ?? 0,
  };
}

export function toCatalogDatabase(
  courses: CourseDTO[],
  disciplines: DisciplineDTO[],
  modules: ModuleDTO[],
  lessons: LessonDTO[],
) {
  return {
    courses: courses.map(mapCourse),
    disciplines: disciplines.map(mapDiscipline),
    modules: modules.map(mapModule),
    lessons: lessons.map(mapLesson),
  };
}
