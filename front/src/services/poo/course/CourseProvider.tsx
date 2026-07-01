import { Course } from "./Course";
import { AdminCourse, ProfessorCourse, StudentCourse } from "./Roles";
import { Database, Role, User } from "../shared/types";

export class CourseProvider {
  static create(role: Role, database: Database, user: User): Course {
    switch (role) {
      case "ADMIN":
        return new AdminCourse(database, user);

      case "PROFESSOR":
        return new ProfessorCourse(database, user);

      default:
        return new StudentCourse(database, user);
    }
  }
}