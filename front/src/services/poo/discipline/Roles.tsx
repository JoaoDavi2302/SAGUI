import { Discipline } from "./discipline";

import {
  DisciplineEntity,
  DisciplineGroup,
  DisciplinePageData,
  DisciplineDetailsPage,
  UserEntity,
  ModuleDetailsCard,
} from "../shared/types";

/* aluno */
export class StudentDiscipline extends Discipline {
  listDisciplines(): DisciplineEntity[] {
    const courseIds = this.getStudentCourseIds();

    return this.disciplines().filter((d) => courseIds.includes(d.curso_id));
  }

  getDiscipline(id: number): DisciplineEntity | null {
    const discipline = this.getDisciplineById(id);

    if (!discipline) {
      return null;
    }

    return this.isStudentEnrolled(discipline.curso_id) ? discipline : null;
  }

  listProfessors(): UserEntity[] {
    return this.getProfessors();
  }

  getByCourse(courseId: number): DisciplineEntity[] {
    if (!this.isStudentEnrolled(courseId)) {
      return [];
    }

    return this.getDisciplinesByCourse(courseId);
  }

  getPageData(): DisciplinePageData {
    const groups: DisciplineGroup[] = [];

    this.getStudentCourseIds().forEach((courseId) => {
      groups.push({
        course: this.getCourseById(courseId),

        subjects: this.getDisciplinesByCourse(courseId).map((discipline) =>
          this.buildDisciplineCard(discipline),
        ),
      });
    });

    return {
      grouped: groups,

      modules: this.modules(),

      lessons: this.lessons(),

      moduleProgress: this.moduleProgress(),
    };
  }

  protected getLessonsByDiscipline(disciplineId: number) {
    return this.getModulesByDiscipline(disciplineId).flatMap((module) =>
      this.getLessonsByModule(module.id),
    );
  }

  getDetails(id: number): DisciplineDetailsPage {
    const disciplineEntity = this.getDisciplineById(id);

    if (!disciplineEntity) {
      throw new Error("Disciplina não encontrada.");
    }

    const discipline = this.buildDisciplineCard(disciplineEntity);

    const modules = this.getModulesByDiscipline(id)
      .map((module) => this.buildModuleDetailsSafe(module.id))
      .filter((module): module is ModuleDetailsCard => module !== null);

    const lessons = this.getLessonsByDiscipline(id);

    const students = this.getStudentsByDiscipline(id).map((student) =>
      this.buildStudentProgress(student.id, lessons),
    );

    const moduleIds = this.getModulesByDiscipline(id).map(
      (module) => module.id,
    );

    const lessonIds = this.lessons()
      .filter((lesson) => moduleIds.includes(lesson.modulo_id))
      .map((lesson) => lesson.id);

    const materials = this.attachments()
      .filter(
        (attachment) =>
          attachment.aula_id != null && lessonIds.includes(attachment.aula_id),
      )
      .map((attachment) => this.buildAttachmentCard(attachment, id));

    const activities = this.getActivitiesByDiscipline(id);

    return {
      discipline,
      modules,
      students,
      materials,
      activities,
    };
  }

  // Ações bloqueadas: atualizar
  updateDiscipline(
    id: number,
    data: Partial<DisciplineEntity>,
  ): DisciplineEntity {
    throw new Error("Permissão negada.");
  }

  // Ações bloqueadas: criar
  createDiscipline(data: Omit<DisciplineEntity, "id">): DisciplineEntity {
    throw new Error("Permissão negada.");
  }

  // Ações bloqueadas: deletar
  deleteDiscipline(id: number): boolean {
    throw new Error("Permissão negada.");
  }
}

/* professor */
export class ProfessorDiscipline extends Discipline {
  listDisciplines(): DisciplineEntity[] {
    return this.disciplines().filter((d) => d.professor_id === this.user.id);
  }

  getDiscipline(id: number): DisciplineEntity | null {
    const discipline = this.getDisciplineById(id);

    if (!discipline) {
      return null;
    }

    return discipline.professor_id === this.user.id ? discipline : null;
  }

  listProfessors(): UserEntity[] {
    return this.getProfessors();
  }

  getByCourse(courseId: number): DisciplineEntity[] {
    return this.getDisciplinesByCourse(courseId).filter(
      (d) => d.professor_id === this.user.id,
    );
  }

  getPageData(): DisciplinePageData {
    const groups: DisciplineGroup[] = [];

    this.getProfessorCourseIds().forEach((courseId) => {
      const course = this.getCourseById(courseId);

      groups.push({
        course,

        subjects: this.getByCourse(courseId).map((d) =>
          this.buildDisciplineCard(d),
        ),
      });
    });

    return {
      grouped: groups,
      modules: this.modules(),
      lessons: this.lessons(),
      moduleProgress: [],
    };
  }

  protected getLessonsByDiscipline(disciplineId: number) {
    const modules = this.getModulesByDiscipline(disciplineId);

    return modules.flatMap((m) => this.getLessonsByModule(m.id));
  }

  getDetails(id: number): DisciplineDetailsPage {
    const discipline = this.buildDisciplineCard(this.getDisciplineById(id)!);

    const modules = this.getModulesByDiscipline(id)
      .map((m) => this.buildModuleDetailsSafe(m.id))
      .filter((m): m is NonNullable<typeof m> => m !== null);

    const lessons = this.getLessonsByDiscipline(id);

    const students = this.getStudentsByDiscipline(id).map((s: any) =>
      this.buildStudentProgress(s.id, lessons),
    );

    const moduleIds = this.getModulesByDiscipline(id).map((m) => m.id);

    const lessonIds = this.lessons()
      .filter((lesson) => moduleIds.includes(lesson.modulo_id))
      .map((lesson) => lesson.id);

    const materials = this.attachments()
      .filter(
        (attachment) =>
          attachment.aula_id != null && lessonIds.includes(attachment.aula_id),
      )
      .map((attachment) => this.buildAttachmentCard(attachment, id));

    const activities = this.getActivitiesByDiscipline(id);

    return {
      discipline,
      modules,
      students,
      materials,
      activities,
    };
  }

  // pode atualizar dados da disciplina
  updateDiscipline(
    id: number,
    data: Partial<DisciplineEntity>,
  ): DisciplineEntity {
    const discipline = this.getDiscipline(id);

    if (!discipline) throw new Error("Disciplina não encontrada.");

    Object.assign(discipline, data);

    return discipline;
  }

  // ação bloqueada: criar disciplina
  createDiscipline(data: Omit<DisciplineEntity, "id">): DisciplineEntity {
    const id =
      Math.max(...this.disciplines().map((discipline) => discipline.id)) + 1;

    const discipline = {
      id,
      ...data,
    };

    this.database.disciplinas.push(discipline);

    return discipline;
  }

  // ação bloqueada: deletar disciplina
  deleteDiscipline(): boolean {
    throw new Error("Professor não pode remover disciplinas.");
  }
}

/* admin */
export class AdminDiscipline extends Discipline {
  listDisciplines(): DisciplineEntity[] {
    return this.disciplines();
  }

  listProfessors(): UserEntity[] {
    return this.getProfessors();
  }

  getDiscipline(id: number): DisciplineEntity | null {
    return this.getDisciplineById(id);
  }

  getByCourse(courseId: number): DisciplineEntity[] {
    return this.getDisciplinesByCourse(courseId);
  }

  getPageData(): DisciplinePageData {
    const groups: DisciplineGroup[] = [];

    this.courses().forEach((course) => {
      groups.push({
        course,
        subjects: this.getDisciplinesByCourse(course.id).map((d) =>
          this.buildDisciplineCard(d),
        ),
      });
    });

    return {
      grouped: groups,
      modules: this.modules(),
      lessons: this.lessons(),
      moduleProgress: this.moduleProgress(),
    };
  }

  protected getLessonsByDiscipline(disciplineId: number) {
    const modules = this.getModulesByDiscipline(disciplineId);
    return modules.flatMap((m) => this.getLessonsByModule(m.id));
  }

  // detalhes da disciplina para criar card
  getDetails(id: number): DisciplineDetailsPage {
    const disciplineEntity = this.getDisciplineById(id);

    if (!disciplineEntity) {
      throw new Error("Discipline not found");
    }

    const discipline = this.buildDisciplineCard(disciplineEntity);

    const modules = this.getModulesByDiscipline(id)
      .map((m) => this.buildModuleDetailsSafe(m.id))
      .filter((m): m is NonNullable<typeof m> => m !== null);

    const lessons = this.getLessonsByDiscipline(id);

    // visualiza todos os alunos (sem filtro)
    const students = this.getAllStudents().map((s) =>
      this.buildStudentProgress(s.id, lessons),
    );

    const moduleIds = this.getModulesByDiscipline(id).map((m) => m.id);

    const lessonIds = this.lessons()
      .filter((lesson) => moduleIds.includes(lesson.modulo_id))
      .map((lesson) => lesson.id);

    const materials = this.attachments()
      .filter(
        (attachment) =>
          attachment.aula_id != null && lessonIds.includes(attachment.aula_id),
      )
      .map((attachment) => this.buildAttachmentCard(attachment, id));

    const activities = this.getActivitiesByDiscipline(id);

    return {
      discipline,
      modules,
      students,
      materials,
      activities,
    };
  }

  // pode atualizar disciplina
  updateDiscipline(
    id: number,
    data: Partial<DisciplineEntity>,
  ): DisciplineEntity {
    const discipline = this.getDisciplineById(id);

    if (!discipline) throw new Error("Disciplina não encontrada.");

    Object.assign(discipline, data);

    return discipline;
  }

  // pode criar disciplina
  createDiscipline(data: Omit<DisciplineEntity, "id">): DisciplineEntity {
    const id =
      Math.max(...this.disciplines().map((discipline) => discipline.id)) + 1;

    const discipline = {
      id,
      ...data,
    };

    this.database.disciplinas.push(discipline);

    return discipline;
  }

  // pode deletar disciplina
  deleteDiscipline(id: number): boolean {
    const index = this.database.disciplinas.findIndex(
      (discipline) => discipline.id === id,
    );

    if (index < 0) {
      return false;
    }

    this.database.disciplinas.splice(index, 1);

    return true;
  }
}
