import { RoleBase } from "../shared/roles";
import { CourseResponse, DisciplineResponse } from "../shared/responses";

import { CourseRequest } from "../shared/requests";
import { CourseCard } from "../shared/cards";

export abstract class Course extends RoleBase {
  abstract listCourses(): Promise<CourseCard[]>;

  abstract getCourse(id: string): Promise<CourseResponse | null>;

  abstract getDisciplines(courseId: string): Promise<DisciplineResponse[]>;

  abstract createCourse(data: CourseRequest): Promise<CourseResponse>;
}
