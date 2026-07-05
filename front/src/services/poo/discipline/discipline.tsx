import { RoleBase } from "../shared/RoleBase";

import {
  CourseEntity,
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

  /* Lista cursos para identificar a disciplina que faz parte */
  abstract listCourses(): CourseEntity[];

  /* Retorna uma disciplina caso o usuário possua acesso*/
  abstract getDiscipline(id: number): DisciplineEntity | null;

  /* Lista disciplinas de um curso respeitando as permissões*/
  abstract getByCourse(courseId: number): DisciplineEntity[];

  /* Dados completos utilizados pela página /disciplinas */
  abstract getPageData(): DisciplinePageData;

  /* Dados da pagina de detalhes da disciplina */
  abstract getDetails(disciplineId: number): DisciplineDetailsPage;

  abstract listProfessors(): UserEntity[];

  /* editar disciplina */
  abstract updateDiscipline(
    id: number,
    data: Partial<DisciplineEntity>,
  ): DisciplineEntity;

  /* criar disciplina */
  abstract createDiscipline(data: CreateDisciplineDTO): DisciplineEntity;

  /* remover disciplina */
  abstract deleteDiscipline(id: number): boolean;
}

export interface CreateDisciplineDTO {
  curso_id: number;
  professor_id?: number;
  nome: string;
  descricao: string;
}
