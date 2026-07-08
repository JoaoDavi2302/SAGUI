import { Material } from "./material";
import {
  AdminMaterial,
  ProfessorMaterial,
  StudentMaterial,
} from "./Roles";

import {
  Database,
  LoggedUser,
  Role,
} from "../shared/types";

export class MaterialProvider {
  static create(
    role: Role,
    database: Database,
    user: LoggedUser,
  ): Material {
    switch (role) {
<<<<<<< HEAD
      case "Admin":
        return new AdminMaterial(database, user);

      case "Professor":
        return new ProfessorMaterial(database, user);

      case "Aluno":
=======
      case "ADMINISTRADOR":
        return new AdminMaterial(database, user);

      case "PROFESSOR":
        return new ProfessorMaterial(database, user);

      case "ALUNO":
>>>>>>> origin/develop
        return new StudentMaterial(database, user);

      default:
        return new StudentMaterial(database, user);
    }
  }
}