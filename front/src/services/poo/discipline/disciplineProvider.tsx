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
<<<<<<< HEAD
      case "Admin":
        return new AdminDiscipline(database, user);

      case "Professor":
        return new ProfessorDiscipline(database, user);

      case "Aluno":
=======
      case "ADMINISTRADOR":
        return new AdminDiscipline(database, user);

      case "PROFESSOR":
        return new ProfessorDiscipline(database, user);

      case "ALUNO":
>>>>>>> origin/develop
        return new StudentDiscipline(database, user);

      default:
        return new StudentDiscipline(database, user);
    }
  }
}
