import { Discipline } from "./discipline";

import {
  AdminDiscipline,
  ProfessorDiscipline,
  StudentDiscipline,
} from "./Roles";

import { Database, LoggedUser, Role, User } from "../shared/types";

export class DisciplineProvider {
  static create(role: Role, database: Database, user: LoggedUser): Discipline {
    switch (role) {
      case "ADMIN":
        return new AdminDiscipline(database, user);

      case "PROFESSOR":
        return new ProfessorDiscipline(database, user);

      case "ALUNO":
        return new StudentDiscipline(database, user);

      default:
        return new StudentDiscipline(database, user);
    }
  }
}
