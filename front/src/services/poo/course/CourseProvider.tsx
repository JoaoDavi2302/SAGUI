import { Course } from "./Course";
import { AdminCourse, ProfessorCourse, StudentCourse } from "./Roles";
import { Database, LoggedUser, Role } from "../shared/types";

export class CourseProvider {
  static create(role: Role, database: Database, user: LoggedUser): Course {
    switch (role) {
      case "ADMINISTRADOR":
        return new AdminCourse(database, user);

      case "PROFESSOR":
        return new ProfessorCourse(database, user);

      case "ALUNO":
        return new StudentCourse(database, user);

      default:
        return new StudentCourse(database, user);
    }
  }
}
