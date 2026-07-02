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
      case "ADMIN":
        return new AdminMaterial(database, user);

      case "PROFESSOR":
        return new ProfessorMaterial(database, user);

      case "ALUNO":
        return new StudentMaterial(database, user);

      default:
        return new StudentMaterial(database, user);
    }
  }
}