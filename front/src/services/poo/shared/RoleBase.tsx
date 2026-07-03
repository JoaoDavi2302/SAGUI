// helpers
import {
  ActivityCard,
  ActivityEntity,
  AttachmentEntity,
  CourseEntity,
  Database,
  DisciplineCard,
  DisciplineEntity,
  DisciplineProgress,
  EnrollmentEntity,
  LessonCard,
  LessonEntity,
  LoggedUser,
  MaterialCard,
  ModuleCard,
  ModuleDetailsCard,
  ModuleEntity,
  ModuleProgressEntity,
  StudentProgressCard,
  UserEntity,
} from "./types";

export abstract class RoleBase {
  constructor(
    protected database: Database,
    protected user: LoggedUser,
  ) {}

  /* acessar tabelas */
  protected users() {
    return this.database.usuarios;
  }

  protected courses(): CourseEntity[] {
    return this.database.cursos;
  }

  protected disciplines(): DisciplineEntity[] {
    return this.database.disciplinas;
  }

  protected modules(): ModuleEntity[] {
    return this.database.modulos;
  }

  protected lessons(): LessonEntity[] {
    return this.database.aulas;
  }

  protected activities(): ActivityEntity[] {
    return this.database.atividades;
  }

  protected attachments(): AttachmentEntity[] {
    return this.database.anexos;
  }

  protected enrollments(): EnrollmentEntity[] {
    return this.database.matriculas;
  }

  protected moduleProgress(): ModuleProgressEntity[] {
    return this.database.progresso_modulo;
  }

  // não existe ainda
  // protected attempts() {
  //   return this.database.tentativas_atividade;
  // }

  protected questions() {
    return this.database.questoes;
  }

  protected alternatives() {
    return this.database.alternativas;
  }

  // fim de acesso a tabelas

  /* cursos */
  protected getCourseById(courseId: number): CourseEntity | null {
    return this.courses().find((c) => c.id === courseId) ?? null;
  }

  protected getStudentCourseIds(): number[] {
    return this.enrollments()
      .filter((e) => e.aluno_id === this.user.id)
      .map((e) => e.curso_id);
  }

  protected getProfessorCourseIds(): number[] {
    return [
      ...new Set(
        this.disciplines()
          .filter((d) => d.professor_id === this.user.id)
          .map((d) => d.curso_id),
      ),
    ];
  }

  protected getAllCourseIds(): number[] {
    return this.courses().map((c) => c.id);
  }

  protected isStudentEnrolled(courseId: number): boolean {
    return this.getStudentCourseIds().includes(courseId);
  }
  // fim de cursos

  /* disciplinas */
  protected getDisciplineById(disciplineId: number): DisciplineEntity | null {
    return this.disciplines().find((d) => d.id === disciplineId) ?? null;
  }

  protected getDisciplinesByCourse(courseId: number): DisciplineEntity[] {
    return this.disciplines()
      .filter((d) => d.curso_id === courseId)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }
  // fim de disciplinas

  // professor
  protected getProfessorName(discipline: DisciplineEntity): string {
    return (
      this.users().find((u) => u.id === discipline.professor_id)?.nome ?? ""
    );
  }

  protected getProfessors(): UserEntity[] {
    return this.users().filter((user) => user.perfil === "PROFESSOR");
  }
  // fim professor

  /* modulos */
  protected getModulesByDiscipline(disciplineId: number): ModuleEntity[] {
    return this.modules()
      .filter((m) => m.disciplina_id === disciplineId)
      .sort((a, b) => a.ordem - b.ordem);
  }

  protected getModuleById(moduleId: number): ModuleEntity | null {
    return this.modules().find((m) => m.id === moduleId) ?? null;
  }
  // fim modulo

  /* aulas */
  protected getLessonsByModule(moduleId: number): LessonEntity[] {
    return this.lessons()
      .filter((l) => l.modulo_id === moduleId)
      .sort((a, b) => a.ordem - b.ordem);
  }

  protected getLessonsCount(moduleId: number): number {
    return this.getLessonsByModule(moduleId).length;
  }

  /* progresso de modulo */
  protected isModuleCompleted(moduleId: number): boolean {
    return this.moduleProgress().some(
      (p) =>
        p.aluno_id === this.user.id && p.modulo_id === moduleId && p.concluido,
    );
  }

  /* progresso de disciplina */
  protected getDisciplineProgress(disciplineId: number): DisciplineProgress {
    const modules = this.getModulesByDiscipline(disciplineId);

    const completed = modules.filter((m) =>
      this.isModuleCompleted(m.id),
    ).length;

    return {
      completedModules: completed,
      totalModules: modules.length,
      percentage: modules.length
        ? Math.round((completed * 100) / modules.length)
        : 0,
    };
  }

  // CONTINUA

  protected isLessonDone(studentId: number, lessonId: number): boolean {
    const lesson = this.lessons().find((lesson) => lesson.id === lessonId);

    if (!lesson) {
      return false;
    }

    return this.moduleProgress().some(
      (progress) =>
        progress.aluno_id === studentId &&
        progress.modulo_id === lesson.modulo_id &&
        progress.concluido,
    );
  }

  /* card de aulas */
  protected buildLessonCard(lesson: LessonEntity): LessonCard {
    return {
      ...lesson,
      completed: this.isLessonDone(this.user.id, lesson.id),
    };
  }

  /* card de modulo */
  protected buildModuleCard(module: ModuleEntity): ModuleCard {
    const lessons = this.getLessonsByModule(module.id);

    const lessonCards = lessons.map((lesson) => this.buildLessonCard(lesson));

    const completedLessons = lessonCards.filter(
      (lesson) => lesson.completed,
    ).length;

    return {
      ...module,

      lessons: lessonCards,

      lessonsCount: lessons.length,

      completedLessons,

      percentage:
        lessons.length === 0
          ? 0
          : Math.round((completedLessons * 100) / lessons.length),
    };
  }

  /* progresso do aluno em disciplina */
  // tentativas_atividade
  protected buildStudentProgress(
    studentId: number,
    lessons: LessonEntity[],
  ): StudentProgressCard {
    const completed = lessons.filter((lesson) =>
      this.isLessonDone(studentId, lesson.id),
    ).length;

    // ESPERAR CRIAR
    // const attempts = this.attempts().filter(
    //   (attempt) => attempt.aluno_id === studentId,
    // );

    // const average =
    //   attempts.length === 0
    //     ? 0
    //     : attempts.reduce((sum, attempt) => sum + attempt.nota, 0) /
    //       attempts.length;

    return {
      id: studentId,

      name: this.users().find((user) => user.id === studentId)?.nome ?? "",

      completedLessons: completed,

      totalLessons: lessons.length,

      percentage:
        lessons.length === 0
          ? 0
          : Math.round((completed * 100) / lessons.length),

      // average: Number(average.toFixed(1)),
    };
  }

  /* card de pagina de disciplina */
  protected buildDisciplineCard(discipline: DisciplineEntity): DisciplineCard {
    const modules = this.getModulesByDiscipline(discipline.id);

    return {
      ...discipline,

      professorName: this.getProfessorName(discipline),

      modules: modules.map((module) => this.buildModuleCard(module)),

      progress: this.getDisciplineProgress(discipline.id),

      courseName: this.getCourseById(discipline.curso_id)?.nome ?? "",
    };
  }

  // antigo buildMaterialCard
  protected buildAttachmentCard(
    attachment: AttachmentEntity,
    disciplineId: number,
  ): MaterialCard {
    const discipline = this.getDisciplineById(disciplineId);

    const course = discipline ? this.getCourseById(discipline.curso_id) : null;

    const lesson =
      attachment.aula_id != null
        ? this.lessons().find((lesson) => lesson.id === attachment.aula_id)
        : null;

    const module = lesson ? this.getModuleById(lesson.modulo_id) : null;

    return {
      ...attachment,

      courseId: course?.id ?? 0,
      courseName: course?.nome ?? "",

      disciplineId: discipline?.id ?? 0,
      disciplineName: discipline?.nome ?? "",

      moduleId: module?.id ?? 0,
      moduleName: module?.nome ?? "",

      lessonId: lesson?.id ?? 0,
      lessonName: lesson?.titulo ?? "",
    };
  }

  protected buildActivityCard(activity: ActivityEntity): ActivityCard {
    const module = this.getModuleById(activity.modulo_id);

    const discipline = module
      ? this.getDisciplineById(module.disciplina_id)
      : null;

    const course = discipline ? this.getCourseById(discipline.curso_id) : null;

    return {
      ...activity,

      courseId: course?.id ?? 0,
      courseName: course?.nome ?? "",

      disciplineId: discipline?.id ?? 0,
      disciplineName: discipline?.nome ?? "",

      moduleId: module?.id ?? 0,
      moduleName: module?.nome ?? "",

      questionCount: this.questions().filter(
        (question) => question.atividade_id === activity.id,
      ).length,
    };
  }

  // AQUI --------------------------------

  //disciplina id
  protected getStudentsByDiscipline(disciplineId: number): UserEntity[] {
    const discipline = this.getDisciplineById(disciplineId);

    if (!discipline) {
      return [];
    }

    const studentIds = [
      ...new Set(
        this.enrollments()
          .filter((enrollment) => enrollment.curso_id === discipline.curso_id)
          .map((enrollment) => enrollment.aluno_id),
      ),
    ];

    return this.users().filter((user) => studentIds.includes(user.id));
  }

  protected buildModuleDetails(moduleId: number): ModuleDetailsCard | null {
    const module = this.getModuleById(moduleId);

    if (!module) {
      return null;
    }

    const lessons = this.getLessonsByModule(moduleId).map((lesson) => ({
      ...lesson,
      completed: false,
    }));

    return {
      ...module,

      lessons,

      progress: 0,
    };
  }

  protected buildModuleDetailsSafe(moduleId: number): ModuleDetailsCard | null {
    const module = this.getModuleById(moduleId);

    if (!module) {
      return null;
    }

    const lessons = this.getLessonsByModule(moduleId).map((lesson) => ({
      ...lesson,
      completed: this.isLessonDone(this.user.id, lesson.id),
    }));

    const completed = lessons.filter((lesson) => lesson.completed).length;

    return {
      ...module,

      lessons,

      progress:
        lessons.length === 0
          ? 0
          : Math.round((completed * 100) / lessons.length),
    };
  }

  // para admin
  protected getAllStudents(): UserEntity[] {
    return this.users().filter((user) => user.perfil === "ALUNO");
  }

  // não usado
  // protected getMaterialsByDiscipline(disciplineId: string): MaterialCard[] {
  //   const modules = this.getModulesByDiscipline(disciplineId);

  //   return (this.database.materials ?? [])
  //     .filter((m: any) => modules.some((mod) => mod.id === m.module_id))
  //     .map((m: any) => {
  //       const module = this.getModuleById(m.module_id);
  //       const discipline = module
  //         ? this.getDisciplineById(module.discipline_id)
  //         : null;
  //       const course = discipline
  //         ? this.getCourseById(discipline.course_id)
  //         : null;

  //       return {
  //         ...m,

  //         courseId: course?.id ?? "",
  //         courseName: course?.name ?? "",

  //         disciplineId: discipline?.id ?? "",
  //         disciplineName: discipline?.name ?? "",

  //         moduleId: module?.id ?? "",
  //         moduleName: module?.name ?? "",
  //       };
  //     });
  // }

  // antigo getQuizzesByDiscipline
  protected getActivitiesByDiscipline(disciplineId: number): ActivityCard[] {
    const modules = this.getModulesByDiscipline(disciplineId);

    return this.activities()
      .filter((activity) =>
        modules.some((module) => module.id === activity.modulo_id),
      )
      .map((activity) => this.buildActivityCard(activity));
  }
}
