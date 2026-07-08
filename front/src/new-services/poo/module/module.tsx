import type {
  ModuleDTO,
  ModuleRequestDTO,
} from "@/new-services/poo/shared/api/catalog";

export abstract class ModuleService {
  abstract list(): Promise<ModuleDTO[]>;

  abstract get(id: string): Promise<ModuleDTO>;

  abstract listByDiscipline(
    disciplineId: string,
  ): Promise<ModuleDTO[]>;

  abstract create(
    data: ModuleRequestDTO,
  ): Promise<ModuleDTO>;

  abstract update(
    id: string,
    data: ModuleRequestDTO,
  ): Promise<ModuleDTO>;

  protected filterByDiscipline(
    modules: ModuleDTO[],
    disciplineId: string,
  ) {
    return modules.filter(
      (module) => module.disciplineId === disciplineId,
    );
  }
}