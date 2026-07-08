import { ModuleService } from "./module";

import { listAllModules } from "@/new-services/poo/shared/api/modules";
import {
  createModule,
  updateModule,
  type ModuleDTO,
  type ModuleRequestDTO,
} from "@/new-services/poo/shared/api/catalog";

import { listDisciplines } from "@/new-services/poo/shared/api/catalog";

import { LoggedUser } from "../shared/types";

export class StudentModule extends ModuleService {
  async list() {
    return listAllModules();
  }

  async get(id: string) {
    const module = (await listAllModules()).find((module) => module.id === id);

    if (!module) {
      throw new Error("MODULE_NOT_FOUND");
    }

    return module;
  }

  async listByDiscipline(disciplineId: string) {
    const modules = await listAllModules();

    return this.filterByDiscipline(modules, disciplineId);
  }

  async create(data: ModuleRequestDTO): Promise<ModuleDTO> {
    throw new Error("Aluno não pode criar módulos");
  }

  async update(id: string, data: ModuleRequestDTO): Promise<ModuleDTO> {
    throw new Error("Aluno não pode atualizar módulos");
  }
}

export class ProfessorModule extends ModuleService {
  constructor(private readonly user: LoggedUser) {
    super();
  }

  async list() {
    const [disciplines, modules] = await Promise.all([
      listDisciplines(),
      listAllModules(),
    ]);

    const professorDisciplines = disciplines
      .filter(
        (discipline) => discipline.responsibleProfessorId === this.user.id,
      )
      .map((discipline) => discipline.id);

    return modules.filter((module) =>
      professorDisciplines.includes(module.disciplineId),
    );
  }

  async get(id: string) {
    const module = (await listAllModules()).find((module) => module.id === id);

    if (!module) {
      throw new Error("MODULE_NOT_FOUND");
    }

    const discipline = (await listDisciplines()).find(
      (discipline) => discipline.id === module.disciplineId,
    );

    if (!discipline || discipline.responsibleProfessorId !== this.user.id) {
      throw new Error("MODULE_NOT_FOUND");
    }

    return module;
  }

  async listByDiscipline(disciplineId: string) {
    const modules = await listAllModules();

    return this.filterByDiscipline(modules, disciplineId);
  }

  async create(data: ModuleRequestDTO): Promise<ModuleDTO> {
    throw new Error("Professor não pode criar módulos");
  }

  async update(id: string, data: ModuleRequestDTO): Promise<ModuleDTO> {
    return updateModule(id, data);
  }
}

export class AdminModule extends ModuleService {
  async list() {
    return listAllModules();
  }

  async get(id: string) {
    const module = (await listAllModules()).find((module) => module.id === id);

    if (!module) {
      throw new Error("MODULE_NOT_FOUND");
    }

    return module;
  }

  async listByDiscipline(disciplineId: string) {
    const modules = await listAllModules();

    return this.filterByDiscipline(modules, disciplineId);
  }

  async create(data: ModuleRequestDTO): Promise<ModuleDTO> {
    return createModule(data);
  }

  async update(id: string, data: ModuleRequestDTO): Promise<ModuleDTO> {
    return updateModule(id, data);
  }
}
