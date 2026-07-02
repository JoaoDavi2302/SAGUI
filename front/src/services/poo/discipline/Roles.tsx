import { Discipline } from "./discipline";

import {
  DisciplineEntity,
  DisciplineGroup,
  DisciplinePageData,
  DisciplineDetailsPage,
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
}

/* admin */
export class AdminDiscipline extends Discipline {
  listDisciplines(): DisciplineEntity[] {
    return this.disciplines();
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

    // 🔥 ADMIN = TODOS os alunos (sem filtro)
    const students = this.getAllStudents().map((s) =>
      this.buildStudentProgress(s.id, lessons),
    );

    return {
      discipline,
      modules,
      students,
    };
  }
}