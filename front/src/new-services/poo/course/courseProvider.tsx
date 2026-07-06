import { Course } from "./course";
import { AdminCourse, ProfessorCourse, StudentCourse } from "./Roles";
import { LoggedUser, Role } from "../shared/types";

export class CourseProvider {
  static create(role: Role, user: LoggedUser): Course {
    switch (role) {
      case "Admin":
        return new AdminCourse(role, user);

      case "Professor":
        return new ProfessorCourse(role, user);

      case "Aluno":
        return new StudentCourse(role, user);

      default:
        return new StudentCourse(role, user);
    }
  }
}
