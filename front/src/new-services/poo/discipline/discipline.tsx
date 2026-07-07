import { RoleBase } from "../shared/roles";
import {
  CourseEntity,
  DisciplineEntity,
  LoggedUser,
  UserEntity,
} from "../shared/types";

import { DisciplineRequest } from "../shared/requests";

export abstract class Discipline extends RoleBase {
  abstract listDisciplines(): Promise<DisciplineEntity[]>;

  abstract listCourses(): Promise<CourseEntity[]>;

  abstract getDiscipline(id: number): Promise<DisciplineEntity | null>;

  abstract getByCourse(courseId: number): Promise<DisciplineEntity[]>;

  abstract getPageData(): Promise<any>;

  abstract getDetails(disciplineId: number): Promise<any>;

  abstract listProfessors(): Promise<UserEntity[]>;

  abstract updateDiscipline(
    id: number,
    data: Partial<DisciplineEntity>
  ): Promise<DisciplineEntity>;

  abstract createDiscipline(
    data: DisciplineRequest
  ): Promise<DisciplineEntity>;

  abstract deleteDiscipline(id: number): Promise<boolean>;
}