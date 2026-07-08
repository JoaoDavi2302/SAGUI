import { Activity } from "./activity";
import {
  AdminActivity,
  ProfessorActivity,
  StudentActivity,
} from "./Roles";

import {
  Database,
  LoggedUser,
  Role,
} from "../shared/types";

export class ActivityProvider {
  static create(
    role: Role,
    database: Database,
    user: LoggedUser,
  ): Activity {
    switch (role) {
      case "Admin":
        return new AdminActivity(database, user);

      case "Professor":
        return new ProfessorActivity(database, user);

      default:
        return new StudentActivity(database, user);
    }
  }
}