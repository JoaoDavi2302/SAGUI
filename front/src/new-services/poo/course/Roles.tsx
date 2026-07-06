import { Course } from "./course";
import { LoggedUser } from "../shared/types";
import { CourseRequest } from "../shared/requests";

import { CourseResponse, DisciplineResponse } from "../shared/responses";

import { apiCourses, apiDisciplines } from "../shared/api";

/* util opcional */
async function safeRequest<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw new Error("API error: " + (err as Error).message);
  }
}

/* STUDENT */
export class StudentCourse extends Course {
  async listCourses(): Promise<CourseResponse[]> {
    return safeRequest(() => apiCourses.list());
  }

  async getCourse(id: string): Promise<CourseResponse | null> {
    const courses = await apiCourses.list();
    return courses.find((c) => c.id === id) ?? null;
  }

  async getDisciplines(courseId: string): Promise<DisciplineResponse[]> {
    const disciplines = await apiDisciplines.list();
    return disciplines.filter((d) => d.courseId === courseId);
  }

  async createCourse(_: CourseRequest): Promise<CourseResponse> {
    throw new Error("Aluno não pode criar curso");
  }
}

/* PROFESSOR */
export class ProfessorCourse extends Course {
  async listCourses(): Promise<CourseResponse[]> {
    return apiCourses.list();
  }

  async getCourse(id: string): Promise<CourseResponse | null> {
    const course = await apiCourses.get(id);
    return course ?? null;
  }

  async getDisciplines(courseId: string): Promise<DisciplineResponse[]> {
    const disciplines = await apiDisciplines.list();
    return disciplines.filter((d) => d.courseId === courseId);
  }

  async createCourse(_: CourseRequest): Promise<CourseResponse> {
    throw new Error("Professor não pode criar curso");
  }
}

/* ADMIN */
export class AdminCourse extends Course {
  async listCourses(): Promise<CourseResponse[]> {
    return apiCourses.list();
  }

  async getCourse(id: string): Promise<CourseResponse | null> {
    return apiCourses.get(id);
  }

  async getDisciplines(courseId: string): Promise<DisciplineResponse[]> {
    const disciplines = await apiDisciplines.list();
    return disciplines.filter((d) => d.courseId === courseId);
  }

  async createCourse(data: CourseRequest): Promise<CourseResponse> {
    return apiCourses.create(data);
  }
}
