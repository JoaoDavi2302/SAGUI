import type {
  LessonDTO,
  LessonRequestDTO,
} from "@/new-services/poo/shared/api/lessons";

export abstract class LessonService {
  abstract list(): Promise<LessonDTO[]>;

  abstract get(id: string): Promise<LessonDTO>;

  abstract listByModule(moduleId: string): Promise<LessonDTO[]>;

  abstract create(
    data: LessonRequestDTO,
  ): Promise<LessonDTO>;

  abstract update(
    id: string,
    data: LessonRequestDTO,
  ): Promise<LessonDTO>;

  protected filterByModule(
    lessons: LessonDTO[],
    moduleId: string,
  ) {
    return lessons.filter(
      (lesson) => lesson.moduleId === moduleId,
    );
  }
}