import { RoleBase } from "../shared/RoleBase";

import {
  Database,
  DisciplineDetailsPage,
  DisciplineEntity,
  DisciplinePageData,
  LoggedUser,
  UserEntity,
} from "../shared/types";

export abstract class Discipline extends RoleBase {
  constructor(
    protected database: Database,
    protected user: LoggedUser,
  ) {
    super(database, user);
  }
  /* Lista todas as disciplinas visíveis para o perfil*/
  abstract listDisciplines(): DisciplineEntity[];

  /* Retorna uma disciplina caso o usuário possua acesso*/
  abstract getDiscipline(id: string): DisciplineEntity | null;

  /* Lista disciplinas de um curso respeitando as permissões*/
  abstract getByCourse(courseId: string): DisciplineEntity[];

  /* Dados completos utilizados pela página /disciplinas */
  abstract getPageData(): DisciplinePageData;

  /* Dados da pagina de detalhes da disciplina */
  abstract getDetails(disciplineId: string): DisciplineDetailsPage;

  abstract listProfessors(): UserEntity[];

  /* editar disciplina */
  abstract updateDiscipline(
    id: string,
    data: Partial<DisciplineEntity>,
  ): DisciplineEntity;

  /* criar disciplina */
  abstract createDiscipline(
    data: Omit<DisciplineEntity, "id">,
  ): DisciplineEntity;

  /* remover disciplina */
  abstract deleteDiscipline(id: string): boolean;
}
