import { RoleBase } from "../shared/RoleBase";

import { Database, LoggedUser, CourseEntity } from "../shared/types";

export abstract class Course extends RoleBase{
  constructor(
    protected database: Database,
    protected user: LoggedUser,
  ) {
    super(database, user);
  }

  abstract listCourses(): CourseEntity[];

  abstract getCourse(id: string): CourseEntity | null;

  abstract getDisciplines(courseId: string): any[];
}
