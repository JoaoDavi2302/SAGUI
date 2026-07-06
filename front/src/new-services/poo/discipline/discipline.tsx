import { DisciplineEntity } from "../shared/types";
import { DisciplineRequest } from "../shared/requests";

export abstract class DisciplineService {
  abstract list(): Promise<DisciplineEntity[]>;

  abstract get(id: string): Promise<DisciplineEntity | null>;

  abstract listByCourse(courseId: string): Promise<DisciplineEntity[]>;

  abstract create(data: DisciplineRequest): Promise<DisciplineEntity>;

  abstract update(
    id: string,
    data: Partial<DisciplineEntity>,
  ): Promise<DisciplineEntity>;

  protected filterByCourse(disciplines: DisciplineEntity[], courseId: string) {
    return disciplines.filter((d) => d.courseId === courseId);
  }
}
