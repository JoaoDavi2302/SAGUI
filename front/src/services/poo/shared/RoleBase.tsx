// helpers
import {
  CourseEntity,
  Database,
  DisciplineEntity,
  DisciplineProgress,
  LessonEntity,
  LoggedUser,
  ModuleEntity,
  ModuleProgressEntity,
} from "./types";

export abstract class RoleBase {
  constructor(
    protected database: Database,
    protected user: LoggedUser,
  ) {}

  /* acessar tabelas */
  protected courses(): CourseEntity[] {
    return this.database.courses;
  }

  protected disciplines(): DisciplineEntity[] {
    return this.database.disciplines;
  }

  protected modules(): ModuleEntity[] {
    return this.database.modules;
  }

  protected lessons(): LessonEntity[] {
    return this.database.lessons;
  }

  protected enrollments() {
    return this.database.enrollments;
  }

  protected users() {
    return this.database.users;
  }

  protected userRoles() {
    return this.database.user_roles;
  }

  protected moduleProgress(): ModuleProgressEntity[] {
    return this.database.module_progress ?? [];
  }

  /* cursos */
  protected getCourseById(courseId: string): CourseEntity | null {
    return this.courses().find((c) => c.id === courseId) ?? null;
  }

  protected getStudentCourseIds(): string[] {
    return this.enrollments()
      .filter((e: any) => e.student_id === this.user.id)
      .map((e: any) => e.course_id);
  }

  protected getProfessorCourseIds(): string[] {
    return [
      ...new Set(
        this.disciplines()
          .filter((d) => d.professor_id === this.user.id)
          .map((d) => d.course_id),
      ),
    ];
  }

  protected isStudentEnrolled(courseId: string): boolean {
    return this.getStudentCourseIds().includes(courseId);
  }

  /* disciplinas */
  protected getDisciplineById(disciplineId: string): DisciplineEntity | null {
    return this.disciplines().find((d) => d.id === disciplineId) ?? null;
  }

  protected getDisciplinesByCourse(courseId: string): DisciplineEntity[] {
    return this.disciplines()
      .filter((d) => d.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  protected getProfessorName(discipline: DisciplineEntity): string {
    const professor = this.users().find(
      (u: any) => u.id === discipline.professor_id,
    );

    return professor?.name ?? "";
  }

  /* modulos */
  protected getModulesByDiscipline(disciplineId: string): ModuleEntity[] {
    return this.modules()
      .filter((m) => m.discipline_id === disciplineId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  protected getModuleById(moduleId: string): ModuleEntity | null {
    return this.modules().find((m) => m.id === moduleId) ?? null;
  }

  /* aulas */
  protected getLessonsByModule(moduleId: string): LessonEntity[] {
    return this.lessons()
      .filter((l) => l.module_id === moduleId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  protected getLessonsCount(moduleId: string): number {
    return this.getLessonsByModule(moduleId).length;
  }

  /* progresso de modulo */
  protected isModuleCompleted(moduleId: string): boolean {
    return this.moduleProgress().some(
      (p) =>
        p.student_id === this.user.id &&
        p.module_id === moduleId &&
        p.status === "COMPLETED",
    );
  }

  /* progresso de disciplina */
  protected getDisciplineProgress(disciplineId: string): DisciplineProgress {
    const modules = this.getModulesByDiscipline(disciplineId);

    if (modules.length === 0) {
      return {
        completedModules: 0,
        totalModules: 0,
        percentage: 0,
      };
    }

    const completedModules = modules.filter((m) =>
      this.isModuleCompleted(m.id),
    ).length;

    return {
      completedModules,
      totalModules: modules.length,
      percentage: Math.round((completedModules / modules.length) * 100),
    };
  }

  /* card de aulas */
  protected buildLessonCard(lesson: LessonEntity) {
    const completed = this.moduleProgress().some(
      (p) =>
        p.student_id === this.user.id &&
        p.module_id === lesson.module_id &&
        p.status === "COMPLETED",
    );

    return {
      ...lesson,
      completed,
    };
  }

  /* card de modulo */
  protected buildModuleCard(module: ModuleEntity) {
    const lessons = this.getLessonsByModule(module.id);

    const completedLessons = lessons.filter(
      (l) => this.buildLessonCard(l).completed,
    ).length;

    const totalLessons = lessons.length;

    return {
      ...module,

      lessons: lessons.map((l) => this.buildLessonCard(l)),

      lessonsCount: totalLessons,

      completedLessons,

      percentage: totalLessons
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0,
    };
  }

  /* progresso do aluno em disciplina */
  protected buildStudentProgress(studentId: string, lessons: LessonEntity[]) {
    const completed = lessons.filter((l) =>
      this.isLessonDone(studentId, l.id),
    ).length;

    const total = lessons.length;

    const attempts =
      this.database.quiz_attempts?.filter((q) => q.student_id === studentId) ??
      [];

    const avg =
      attempts.length > 0
        ? attempts.reduce((a, b) => a + (b.score ?? 0), 0) / attempts.length
        : 0;

    return {
      id: studentId,
      name: this.users().find((u) => u.id === studentId)?.name ?? "",

      completedLessons: completed,
      totalLessons: total,

      percentage: total ? Math.round((completed / total) * 100) : 0,

      average: Number(avg.toFixed(1)), //fix number
    };
  }

  /* card de pagina de disciplina */
  protected buildDisciplineCard(discipline: DisciplineEntity) {
    const modules = this.getModulesByDiscipline(discipline.id);

    return {
      ...discipline,

      professorName: this.getProfessorName(discipline),

      modules: modules.map((m) => this.buildModuleCard(m)),

      progress: this.getDisciplineProgress(discipline.id),
    };
  }

  //disciplina id
  protected getStudentsByDiscipline(disciplineId: string) {
    const modules = this.getModulesByDiscipline(disciplineId);

    const enrollments = this.enrollments().filter((e) =>
      modules.some((m) => m.discipline_id === disciplineId),
    );

    const ids = [...new Set(enrollments.map((e) => e.student_id))];

    return ids
      .map((id) => this.users().find((u) => u.id === id))
      .filter(Boolean);
  }

  protected isLessonDone(studentId: string, lessonId: string) {
    return (this.database.lesson_progress ?? []).some(
      (p) =>
        p.student_id === studentId &&
        p.lesson_id === lessonId &&
        p.completed === true,
    );
  }

  protected buildModuleDetails(moduleId: string) {
    const module = this.getModuleById(moduleId);
    if (!module) return null;

    const lessons = this.getLessonsByModule(moduleId).map((l) => ({
      ...l,
      completed: false,
    }));

    const completed = lessons.filter((l) => l.completed).length;

    return {
      ...module,
      lessons,
      progress: lessons.length
        ? Math.round((completed / lessons.length) * 100)
        : 0,
    };
  }

  protected buildModuleDetailsSafe(moduleId: string) {
    const module = this.getModuleById(moduleId);
    if (!module) return null;

    const lessons = this.getLessonsByModule(moduleId).map((l) => ({
      ...l,
      completed: this.isLessonDone(this.user.id, l.id),
    }));

    const completed = lessons.filter((l) => l.completed).length;

    return {
      ...module,
      lessons,
      progress: lessons.length
        ? Math.round((completed / lessons.length) * 100)
        : 0,
    };
  }

  // para admin
  protected getAllStudents(): any[] {
    const studentRoleId = this.database.roles.find(
      (r) => r.name === "ALUNO",
    )?.id;

    if (!studentRoleId) return [];

    const studentIds = this.userRoles()
      .filter((ur) => ur.role_id === studentRoleId)
      .map((ur) => ur.user_id);

    return this.users().filter((u) => studentIds.includes(u.id));
  }
}
