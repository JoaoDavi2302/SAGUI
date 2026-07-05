
import { RoleBase } from "../shared/RoleBase";
import {
  ActivityCard,
  ModuleActivityCard,
  ActivityEntity,
  Database,
  LoggedUser,
} from "../shared/types";

export abstract class Activity extends RoleBase {
  constructor(
    protected database: Database,
   protected user: LoggedUser,
  ) {
    super(database, user);
  }

  abstract listModules(): ModuleActivityCard[];

  abstract listActivities(moduleId: number): ActivityCard[];

  abstract getActivity(id: number): ActivityEntity | null;

  abstract updateActivity(
    id: number,
    data: Partial<ActivityEntity>,
  ): ActivityEntity | null;
}