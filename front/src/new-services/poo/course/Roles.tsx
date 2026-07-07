import { CourseService } from "./course";

import type {
  CourseDTO,
  CourseRequestDTO,
  DisciplineDTO,
} from "@/new-services/poo/shared/api/catalog";

import {
  createCourse,
  getCourse,
  listCourses,
  listDisciplines,
  updateCourse,
} from "@/new-services/poo/shared/api/catalog";
import { getDashboardCourses } from "../shared/api/dashboard";

export class StudentCourse extends CourseService {
  async listCourses(): Promise<CourseDTO[]> {
    return listCourses();
  }

  async getCourse(id: string): Promise<CourseDTO> {
    const courses = await listCourses();

    const course = courses.find((course) => course.id === id);

    if (!course) {
      throw new Error("COURSE_NOT_FOUND");
    }

    return course;
  }

  async getDisciplines(courseId: string): Promise<DisciplineDTO[]> {
    const disciplines = await listDisciplines();

    return disciplines.filter((discipline) => discipline.courseId === courseId);
  }

  async createCourse(_: CourseRequestDTO): Promise<CourseDTO> {
    throw new Error("Aluno não pode criar curso");
  }

  async updateCourse(id: string, data: CourseRequestDTO): Promise<CourseDTO> {
    throw new Error("Aluno não pode atualizar curso");
  }
}

export class ProfessorCourse extends CourseService {
  async listCourses(): Promise<CourseDTO[]> {
    return listCourses();
  }

  async getCourse(id: string): Promise<CourseDTO> {
    const courses = await listCourses();

    const course = courses.find((course) => course.id === id);

    if (!course) {
      throw new Error("COURSE_NOT_FOUND");
    }

    return course;
  }

  async getDisciplines(courseId: string): Promise<DisciplineDTO[]> {
    const disciplines = await listDisciplines();

    return disciplines.filter((discipline) => discipline.courseId === courseId);
  }

  async createCourse(_: CourseRequestDTO): Promise<CourseDTO> {
    throw new Error("Professor não pode criar curso");
  }

  async updateCourse(id: string, data: CourseRequestDTO): Promise<CourseDTO> {
    throw new Error("Professor não pode atualizar curso");
  }
}

export class AdminCourse extends CourseService {
  async listCourses(): Promise<CourseDTO[]> {
    return listCourses();
  }

  async getCourse(id: string): Promise<CourseDTO> {
    return getCourse(id);
  }

  async getDisciplines(courseId: string): Promise<DisciplineDTO[]> {
    const disciplines = await listDisciplines();

    return disciplines.filter((discipline) => discipline.courseId === courseId);
  }

  async createCourse(data: CourseRequestDTO): Promise<CourseDTO> {
    return createCourse(data);
  }

  async updateCourse(id: string, data: CourseRequestDTO): Promise<CourseDTO> {
    return updateCourse(id, data);
  }
}
