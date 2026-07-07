import type {
  CourseDTO,
  CourseRequestDTO,
  DisciplineDTO,
} from "@/new-services/poo/shared/api/catalog";

export abstract class CourseService {
  abstract listCourses(): Promise<CourseDTO[]>;

  abstract getCourse(id: string): Promise<CourseDTO>;

  abstract getDisciplines(
    courseId: string,
  ): Promise<DisciplineDTO[]>;

  abstract createCourse(
    data: CourseRequestDTO,
  ): Promise<CourseDTO>;

  abstract updateCourse(
    id: string,
    data: CourseRequestDTO,
  ): Promise<CourseDTO>;
}