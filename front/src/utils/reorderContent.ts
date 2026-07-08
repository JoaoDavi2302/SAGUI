import { updateModule, type ModuleDTO } from "@/new-services/poo/shared/api/catalog";
import { updateLesson, type LessonDTO } from "@/new-services/poo/shared/api/lessons";

export function sortByOrderIndex<T extends { orderIndex: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getActiveItems<T extends { orderIndex: number; status: string }>(
  items: T[],
): T[] {
  const activeItems = items.filter((item) => item.status === "Active");
  return sortByOrderIndex(activeItems);
}

export async function swapModuleOrder(moduleA: ModuleDTO, moduleB: ModuleDTO) {
  const orderA = moduleA.orderIndex;
  const orderB = moduleB.orderIndex;

  await Promise.all([
    updateModule(moduleA.id, {
      name: moduleA.name,
      description: moduleA.description ?? undefined,
      orderIndex: orderB,
      disciplineId: moduleA.disciplineId,
    }),
    updateModule(moduleB.id, {
      name: moduleB.name,
      description: moduleB.description ?? undefined,
      orderIndex: orderA,
      disciplineId: moduleB.disciplineId,
    }),
  ]);
}

export async function swapLessonOrder(lessonA: LessonDTO, lessonB: LessonDTO) {
  const orderA = lessonA.orderIndex;
  const orderB = lessonB.orderIndex;

  await Promise.all([
    updateLesson(lessonA.id, {
      name: lessonA.name,
      description: lessonA.description ?? undefined,
      orderIndex: orderB,
      moduleId: lessonA.moduleId,
    }),
    updateLesson(lessonB.id, {
      name: lessonB.name,
      description: lessonB.description ?? undefined,
      orderIndex: orderA,
      moduleId: lessonB.moduleId,
    }),
  ]);
}
