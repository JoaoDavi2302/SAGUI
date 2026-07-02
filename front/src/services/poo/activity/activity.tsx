
import { RoleBase } from "../shared/RoleBase";
import {
  ActivityCard,
  ModuleActivityCard,
  QuizEntity,
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

  abstract listActivities(moduleId: string): ActivityCard[];

  abstract getActivity(id: string): QuizEntity | null;

  abstract updateActivity(
    id: string,
    data: Partial<QuizEntity>,
  ): QuizEntity | null;
}