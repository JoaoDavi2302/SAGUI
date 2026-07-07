import {
  type DisciplineDTO,
  listCourses,
  listDisciplines,
  listModules,
  listProfessors,
} from "@/new-services/poo/shared/api/catalog";

export type AdminDisciplineItem = DisciplineDTO & {
  courseName: string;
  professorName: string;
  moduleCount: number;
};

export async function fetchAdminDisciplines(): Promise<AdminDisciplineItem[]> {
  const [disciplines, courses, modules, professors] = await Promise.all([
    listDisciplines(),
    listCourses(),
    listModules(),
    listProfessors(),
  ]);

  const coursesMap = Object.fromEntries(courses.map((course) => [course.id, course]));
  const professorsMap = Object.fromEntries(
    professors.map((professor) => [professor.id, professor]),
  );
  const moduleCountByDiscipline = modules.reduce<Record<string, number>>(
    (counts, module) => {
      counts[module.disciplineId] = (counts[module.disciplineId] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return disciplines
    .map((discipline) => ({
      ...discipline,
      courseName: coursesMap[discipline.courseId]?.name ?? "Sem curso",
      professorName:
        professorsMap[discipline.responsibleProfessorId]?.name ?? "Sem professor",
      moduleCount: moduleCountByDiscipline[discipline.id] ?? 0,
    }))
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"));
}

export function filterAdminDisciplines(
  disciplines: AdminDisciplineItem[],
  query: string,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return disciplines;

  return disciplines.filter((discipline) => {
    const name = (discipline.name ?? "").toLowerCase();
    const description = (discipline.description ?? "").toLowerCase();
    const courseName = discipline.courseName.toLowerCase();
    const professorName = discipline.professorName.toLowerCase();
    return (
      name.includes(normalized) ||
      description.includes(normalized) ||
      courseName.includes(normalized) ||
      professorName.includes(normalized)
    );
  });
}
