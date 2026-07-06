import { CourseRequest } from "../shared/requests";
import { CourseResponse, DisciplineResponse } from "../shared/responses";
import { CourseCard } from "../shared/cards";

export abstract class CourseService {
  abstract listCourses(): Promise<CourseCard[]>;

  abstract getCourse(id: string): Promise<CourseResponse | null>;

  abstract getDisciplines(courseId: string): Promise<DisciplineResponse[]>;

  abstract createCourse(data: CourseRequest): Promise<CourseResponse>;
}