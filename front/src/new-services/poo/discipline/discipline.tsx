import type {
  DisciplineDTO,
  DisciplineRequestDTO,
} from "@/new-services/poo/shared/api/catalog";

export abstract class DisciplineService {
  abstract list(): Promise<DisciplineDTO[]>;

  abstract get(id: string): Promise<DisciplineDTO>;

  abstract listByCourse(courseId: string): Promise<DisciplineDTO[]>;

  abstract create(
    data: DisciplineRequestDTO,
  ): Promise<DisciplineDTO>;

  abstract update(
    id: string,
    data: DisciplineRequestDTO,
  ): Promise<DisciplineDTO>;

  protected filterByCourse(
    disciplines: DisciplineDTO[],
    courseId: string,
  ) {
    return disciplines.filter(
      (discipline) => discipline.courseId === courseId,
    );
  }
}