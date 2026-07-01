import {
  Database,
  User,
  CourseEntity
} from "../shared/types";

export abstract class Course {
  constructor(
    protected database: Database,
    protected user: User
  ) {}

  abstract listCourses(): CourseEntity[];

  abstract getCourse(id: string): CourseEntity | null;

  abstract getDisciplines(courseId: string): any[];
}