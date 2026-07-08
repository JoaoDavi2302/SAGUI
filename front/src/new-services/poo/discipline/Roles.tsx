import { DisciplineService } from "./discipline";
import {
  listDisciplines,
  updateDiscipline,
  createDiscipline,
  type DisciplineDTO,
  type DisciplineRequestDTO,
} from "@/new-services/poo/shared/api/catalog";
import { LoggedUser } from "../shared/types";

export class StudentDiscipline extends DisciplineService {
  async list() {
    return listDisciplines();
  }

  async get(id: string) {
    const disciplines = await listDisciplines();
    return disciplines.find((d) => d.id === id)!;
  }

  async listByCourse(courseId: string) {
    const disciplines = await listDisciplines();
    return this.filterByCourse(disciplines, courseId);
  }

  async create(data: DisciplineRequestDTO): Promise<DisciplineDTO> {
    throw new Error("Aluno não pode criar disciplina");
  }

  async update(id: string, data: DisciplineRequestDTO): Promise<DisciplineDTO> {
    throw new Error("Aluno não pode atualizar disciplina");
  }
}

export class ProfessorDiscipline extends DisciplineService {
  constructor(private readonly user: LoggedUser) {
    super();
  }

  async list() {
    const disciplines = await listDisciplines();

    return disciplines.filter(
      (discipline) => discipline.responsibleProfessorId === this.user.id,
    );
  }

  async get(id: string) {
    const disciplines = await listDisciplines();

    const discipline = disciplines.find((d) => d.id === id);

    if (!discipline || discipline.responsibleProfessorId !== this.user.id) {
      throw new Error("DISCIPLINE_NOT_FOUND");
    }

    return discipline;
  }

  async listByCourse(courseId: string) {
    const disciplines = await listDisciplines();
    return this.filterByCourse(disciplines, courseId);
  }

  async create(data: DisciplineRequestDTO): Promise<DisciplineDTO> {
    throw new Error("Professor não pode criar disciplina");
  }

  async update(id: string, data: DisciplineRequestDTO) {
    return updateDiscipline(id, data);
  }
}
export class AdminDiscipline extends DisciplineService {
  async list() {
    return listDisciplines();
  }

  async get(id: string): Promise<DisciplineDTO> {
    const disciplines = await listDisciplines();

    const discipline = disciplines.find((d) => d.id === id);

    if (!discipline) {
      throw new Error("DISCIPLINE_NOT_FOUND");
    }

    return discipline;
  }

  async listByCourse(courseId: string) {
    const disciplines = await listDisciplines();
    return this.filterByCourse(disciplines, courseId);
  }

  async create(data: DisciplineRequestDTO): Promise<DisciplineDTO> {
    return createDiscipline(data);
  }

  async update(id: string, data: DisciplineRequestDTO): Promise<DisciplineDTO> {
    return updateDiscipline(id, data);
  }
}
