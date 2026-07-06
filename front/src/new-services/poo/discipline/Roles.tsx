import { DisciplineService } from "./discipline";
import { apiDisciplines, apiCourses } from "../shared/api";
import { DisciplineRequest } from "../shared/requests";
import { DisciplineEntity } from "../shared/types";

export class StudentDiscipline extends DisciplineService {
  async list() {
    return apiDisciplines.list();
  }

  async get(id: string) {
    return apiDisciplines.get(id);
  }

  async listByCourse(courseId: string) {
    const disciplines = await apiDisciplines.list();
    return this.filterByCourse(disciplines, courseId);
  }

  async create(data: DisciplineRequest): Promise<DisciplineEntity> {
    throw new Error("Aluno não pode criar disciplina");
  }

  async update(
    id: string,
    data: Partial<DisciplineEntity>,
  ): Promise<DisciplineEntity> {
    throw new Error("Aluno não pode atualizar disciplina");
  }
}

export class ProfessorDiscipline extends DisciplineService {
  constructor(private user: any) {
    super();
  }

  async list() {
    const disciplines = await apiDisciplines.list();
    return disciplines.filter((d) => d.responsibleProfessorId === this.user.id);
  }

  async get(id: string): Promise<DisciplineEntity | null> {
    const d = await apiDisciplines.get(id);

    if (!d) return null;

    return d.responsibleProfessorId === this.user.id ? d : null;
  }

  async listByCourse(courseId: string) {
    const disciplines = await apiDisciplines.list();
    return this.filterByCourse(disciplines, courseId);
  }

  async create(data: DisciplineRequest): Promise<DisciplineEntity> {
    throw new Error("Professor não pode criar disciplina");
  }

  async update(
    id: string,
    data: Partial<DisciplineEntity>,
  ): Promise<DisciplineEntity> {
    return apiDisciplines.update(id, data);
  }
}
export class AdminDiscipline extends DisciplineService {
  async list() {
    return apiDisciplines.list();
  }

  async get(id: string) {
    return apiDisciplines.get(id);
  }

  async listByCourse(courseId: string) {
    const disciplines = await apiDisciplines.list();
    return this.filterByCourse(disciplines, courseId);
  }

  async create(data: DisciplineRequest): Promise<DisciplineEntity> {
    return apiDisciplines.create(data);
  }

  async update(
    id: string,
    data: Partial<DisciplineEntity>,
  ): Promise<DisciplineEntity> {
    return apiDisciplines.update(id, data);
  }
}
