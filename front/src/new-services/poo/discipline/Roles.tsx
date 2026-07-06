import { Discipline } from "./discipline";
import { apiDisciplines, apiCourses } from "../shared/api";
import {
  CourseEntity,
  DisciplineEntity,
  UserEntity,
} from "../shared/types";
import { DisciplineRequest } from "../shared/requests";

export class StudentDiscipline extends Discipline {
  async listDisciplines(): Promise<DisciplineEntity[]> {
    return apiDisciplines.list();
  }

  async listCourses(): Promise<CourseEntity[]> {
    const courses = await apiCourses.list();
    return courses.filter((c) => c.status === "Active");
  }

  async getDiscipline(id: number): Promise<DisciplineEntity | null> {
    const discipline = await apiDisciplines.get(String(id));
    return discipline ?? null;
  }

  async getByCourse(courseId: number): Promise<DisciplineEntity[]> {
    const disciplines = await apiDisciplines.list();
    return disciplines.filter((d) => d.courseId === String(courseId));
  }

  async listProfessors(): Promise<UserEntity[]> {
    return [];
  }

  async getPageData(): Promise<any> {
    const disciplines = await this.listDisciplines();
    const courses = await this.listCourses();

    return {
      grouped: courses.map((course) => ({
        course,
        subjects: disciplines.filter(
          (d) => d.courseId === course.id
        ),
      })),
    };
  }

  async getDetails(id: number): Promise<any> {
    const discipline = await apiDisciplines.get(String(id));

    return {
      discipline,
      modules: [],
      students: [],
      materials: [],
      activities: [],
    };
  }

  async updateDiscipline(): Promise<DisciplineEntity> {
    throw new Error("Permissão negada.");
  }

  async createDiscipline(): Promise<DisciplineEntity> {
    throw new Error("Permissão negada.");
  }

  async deleteDiscipline(): Promise<boolean> {
    throw new Error("Permissão negada.");
  }
}

export class ProfessorDiscipline extends Discipline {
  async listDisciplines(): Promise<DisciplineEntity[]> {
    const disciplines = await apiDisciplines.list();

    return disciplines.filter(
      (d) => d.responsibleProfessorId === this.user.id
    );
  }

  async listCourses(): Promise<CourseEntity[]> {
    return [];
  }

  async getDiscipline(id: number): Promise<DisciplineEntity | null> {
    const discipline = await apiDisciplines.get(String(id));

    return discipline.responsibleProfessorId === this.user.id
      ? discipline
      : null;
  }

  async getByCourse(courseId: number): Promise<DisciplineEntity[]> {
    const disciplines = await apiDisciplines.list();

    return disciplines.filter(
      (d) =>
        d.courseId === String(courseId) &&
        d.responsibleProfessorId === this.user.id
    );
  }

  async listProfessors(): Promise<UserEntity[]> {
    return [];
  }

  async getPageData(): Promise<any> {
    const disciplines = await this.listDisciplines();

    return {
      grouped: [],
      disciplines,
    };
  }

  async getDetails(id: number): Promise<any> {
    const discipline = await this.getDiscipline(id);

    if (!discipline) throw new Error("Disciplina não encontrada");

    return {
      discipline,
      modules: [],
      students: [],
      materials: [],
      activities: [],
    };
  }

  async updateDiscipline(
    id: number,
    data: Partial<DisciplineEntity>
  ): Promise<DisciplineEntity> {
    return apiDisciplines.update(String(id), data);
  }

  async createDiscipline(
    data: DisciplineRequest
  ): Promise<DisciplineEntity> {
    return apiDisciplines.create(data);
  }

  async deleteDiscipline(): Promise<boolean> {
    throw new Error("Professor não pode remover disciplinas.");
  }
}

export class AdminDiscipline extends Discipline {
  async listDisciplines(): Promise<DisciplineEntity[]> {
    return apiDisciplines.list();
  }

  async listCourses(): Promise<CourseEntity[]> {
    return [];
  }

  async getDiscipline(id: number): Promise<DisciplineEntity | null> {
    const discipline = await apiDisciplines.get(String(id));
    return discipline ?? null;
  }

  async getByCourse(courseId: number): Promise<DisciplineEntity[]> {
    const disciplines = await apiDisciplines.list();

    return disciplines.filter(
      (d) => d.courseId === String(courseId)
    );
  }

  async listProfessors(): Promise<UserEntity[]> {
    return [];
  }

  async getPageData(): Promise<any> {
    const disciplines = await this.listDisciplines();

    return {
      grouped: [],
      disciplines,
    };
  }

  async getDetails(id: number): Promise<any> {
    const discipline = await apiDisciplines.get(String(id));

    return {
      discipline,
      modules: [],
      students: [],
      materials: [],
      activities: [],
    };
  }

  async updateDiscipline(
    id: number,
    data: Partial<DisciplineEntity>
  ): Promise<DisciplineEntity> {
    return apiDisciplines.update(String(id), data);
  }

  async createDiscipline(
    data: DisciplineRequest
  ): Promise<DisciplineEntity> {
    return apiDisciplines.create(data);
  }

  async deleteDiscipline(id: number): Promise<boolean> {
    return apiDisciplines.delete(String(id));
  }
}