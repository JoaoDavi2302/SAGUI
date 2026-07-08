import { Discipline } from "./discipline";

import {
  AdminDiscipline,
  ProfessorDiscipline,
  StudentDiscipline,
} from "./Roles";

import { Database, LoggedUser, Role } from "../shared/types";

export class DisciplineProvider {
  static create(role: Role, database: Database, user: LoggedUser): Discipline {
    switch (role) {
      case "Admin":
        return new AdminDiscipline(database, user);

      case "Professor":
        return new ProfessorDiscipline(database, user);

      case "Aluno":
        return new StudentDiscipline(database, user);

      default:
        return new StudentDiscipline(database, user);
    }
  }
}
