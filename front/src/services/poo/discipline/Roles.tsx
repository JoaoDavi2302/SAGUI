import { Discipline } from "./discipline";

import {
  DisciplineEntity,
  DisciplineGroup,
  DisciplinePageData,
  DisciplineDetailsPage,
  UserEntity,
} from "../shared/types";

/* aluno */
export class StudentDiscipline extends Discipline {
  listDisciplines(): DisciplineEntity[] {
    const courseIds = this.getStudentCourseIds();

    return this.disciplines().filter((d) => courseIds.includes(d.course_id));
  }

  getDiscipline(id: string): DisciplineEntity | null {
    const discipline = this.getDisciplineById(id);

    if (!discipline) {
      return null;
    }

    return this.isStudentEnrolled(discipline.course_id) ? discipline : null;
  }

  listProfessors(): UserEntity[] {
    return this.getProfessors();
  }

  getByCourse(courseId: string): DisciplineEntity[] {
    if (!this.isStudentEnrolled(courseId)) {
      return [];
    }

    return this.getDisciplinesByCourse(courseId);
  }

  getPageData(): DisciplinePageData {
    const groups: DisciplineGroup[] = [];

    this.getStudentCourseIds().forEach((courseId) => {
      const course = this.getCourseById(courseId);

      groups.push({
        course,

        subjects: this.getDisciplinesByCourse(courseId).map((d) =>
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

  protected getLessonsByDiscipline(disciplineId: string) {
    const modules = this.getModulesByDiscipline(disciplineId);

    return modules.flatMap((m) => this.getLessonsByModule(m.id));
  }

  getDetails(id: string): DisciplineDetailsPage {
    const discipline = this.buildDisciplineCard(this.getDisciplineById(id)!);

    const modules = this.getModulesByDiscipline(id)
      .map((m) => this.buildModuleDetailsSafe(m.id))
      .filter((m): m is NonNullable<typeof m> => m !== null);

    const lessons = this.getLessonsByDiscipline(id);

    const students = this.getStudentsByDiscipline(id).map((s: any) =>
      this.buildStudentProgress(s.id, lessons),
    );

    return {
      discipline,
      modules,
      students,
    };
  }

  // Ações bloqueadas: atualizar
  updateDiscipline(): DisciplineEntity {
    throw new Error("Permissão negada");
  }

  // Ações bloqueadas: criar
  createDiscipline(): DisciplineEntity {
    throw new Error("Permissão negada");
  }

  // Ações bloqueadas: deletar
  deleteDiscipline(): boolean {
    throw new Error("Permissão negada");
  }
}

/* professor */
export class ProfessorDiscipline extends Discipline {
  listDisciplines(): DisciplineEntity[] {
    return this.disciplines().filter((d) => d.professor_id === this.user.id);
  }

  getDiscipline(id: string): DisciplineEntity | null {
    const discipline = this.getDisciplineById(id);

    if (!discipline) {
      return null;
    }

    return discipline.professor_id === this.user.id ? discipline : null;
  }

  listProfessors(): UserEntity[] {
    return this.getProfessors();
  }

  getByCourse(courseId: string): DisciplineEntity[] {
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

  protected getLessonsByDiscipline(disciplineId: string) {
    const modules = this.getModulesByDiscipline(disciplineId);

    return modules.flatMap((m) => this.getLessonsByModule(m.id));
  }

  getDetails(id: string): DisciplineDetailsPage {
    const discipline = this.buildDisciplineCard(this.getDisciplineById(id)!);

    const modules = this.getModulesByDiscipline(id)
      .map((m) => this.buildModuleDetailsSafe(m.id))
      .filter((m): m is NonNullable<typeof m> => m !== null);

    const lessons = this.getLessonsByDiscipline(id);

    const students = this.getStudentsByDiscipline(id).map((s: any) =>
      this.buildStudentProgress(s.id, lessons),
    );

    return {
      discipline,
      modules,
      students,
    };
  }

  // pode atualizar dados da disciplina
  updateDiscipline(
    id: string,
    data: Partial<DisciplineEntity>,
  ): DisciplineEntity {
    const discipline = this.getDiscipline(id);

    if (!discipline) throw new Error("Disciplina não encontrada.");

    Object.assign(discipline, data);

    return discipline;
  }

  // ação bloqueada: criar disciplina
  createDiscipline(): DisciplineEntity {
    throw new Error("Professor não pode criar disciplinas.");
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

  getDiscipline(id: string): DisciplineEntity | null {
    return this.getDisciplineById(id);
  }

  getByCourse(courseId: string): DisciplineEntity[] {
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

  protected getLessonsByDiscipline(disciplineId: string) {
    const modules = this.getModulesByDiscipline(disciplineId);
    return modules.flatMap((m) => this.getLessonsByModule(m.id));
  }

  // detalhes da disciplina para criar card
  getDetails(id: string): DisciplineDetailsPage {
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

    return {
      discipline,
      modules,
      students,
    };
  }

  // pode atualizar disciplina
  updateDiscipline(
    id: string,
    data: Partial<DisciplineEntity>,
  ): DisciplineEntity {
    const discipline = this.getDisciplineById(id);

    if (!discipline) throw new Error("Disciplina não encontrada.");

    Object.assign(discipline, data);

    return discipline;
  }

  // pode criar disciplina
  createDiscipline(data: Omit<DisciplineEntity, "id">): DisciplineEntity {
    const discipline: DisciplineEntity = {
      id: crypto.randomUUID(),
      ...data,
    };

    this.database.disciplines.push(discipline);

    return discipline;
  }

  // pode deletar disciplina
  deleteDiscipline(id: string): boolean {
    const index = this.database.disciplines.findIndex((d) => d.id === id);

    if (index === -1) return false;

    this.database.disciplines.splice(index, 1);

    return true;
  }
}
