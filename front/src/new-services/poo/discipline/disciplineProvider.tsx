import { Discipline } from "./discipline";
import {
  AdminDiscipline,
  ProfessorDiscipline,
  StudentDiscipline,
} from "./Roles";
import { LoggedUser, Role } from "../shared/types";

export class DisciplineProvider {
  static create(role: Role, user: LoggedUser): Discipline {
    switch (role) {
      case "Admin":
        return new AdminDiscipline(role, user);

      case "Professor":
        return new ProfessorDiscipline(role, user);

      case "Aluno":
        return new StudentDiscipline(role, user);

      default:
        return new StudentDiscipline(role, user);
    }
  }
}