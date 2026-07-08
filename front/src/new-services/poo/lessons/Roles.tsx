import { LessonService } from "./lesson";

import {
  createLesson,
  updateLesson,
  listLessons,
  type LessonDTO,
  type LessonRequestDTO,
} from "@/new-services/poo/shared/api/lessons";

import { LoggedUser } from "../shared/types";

import {
  listModules,
  listDisciplines,
} from "@/new-services/poo/shared/api/catalog";

export class StudentLesson extends LessonService {
  async list() {
    const modules = await listModules();

    const lessons = await Promise.all(
      modules.map((module) => listLessons(module.id)),
    );

    return lessons.flat();
  }

  async get(id: string) {
    const lessons = await this.list();

    const lesson = lessons.find((lesson) => lesson.id === id);

    if (!lesson) {
      throw new Error("LESSON_NOT_FOUND");
    }

    return lesson;
  }

  async listByModule(moduleId: string) {
    const lessons = await listLessons(moduleId);

    return this.filterByModule(lessons, moduleId);
  }

  async create(data: LessonRequestDTO): Promise<LessonDTO> {
    throw new Error("Aluno não pode criar aulas");
  }

  async update(id: string, data: LessonRequestDTO): Promise<LessonDTO> {
    throw new Error("Aluno não pode atualizar aulas");
  }
}

export class ProfessorLesson extends LessonService {
  constructor(private readonly user: LoggedUser) {
    super();
  }

  async list() {
    const [disciplines, modules] = await Promise.all([
      listDisciplines(),
      listModules(),
    ]);

    const professorDisciplines = disciplines
      .filter(
        (discipline) =>
          discipline.responsibleProfessorId === this.user.id,
      )
      .map((discipline) => discipline.id);

    const professorModules = modules
      .filter((module) =>
        professorDisciplines.includes(module.disciplineId),
      )
      .map((module) => module.id);

    const lessons = await Promise.all(
      professorModules.map((moduleId) => listLessons(moduleId)),
    );

    return lessons.flat();
  }

  async get(id: string) {
    const lessons = await this.list();

    const lesson = lessons.find((lesson) => lesson.id === id);

    if (!lesson) {
      throw new Error("LESSON_NOT_FOUND");
    }

    return lesson;
  }

  async listByModule(moduleId: string) {
    const [disciplines, modules] = await Promise.all([
      listDisciplines(),
      listModules(),
    ]);

    const module = modules.find((m) => m.id === moduleId);

    if (!module) {
      return [];
    }

    const discipline = disciplines.find(
      (d) => d.id === module.disciplineId,
    );

    if (
      !discipline ||
      discipline.responsibleProfessorId !== this.user.id
    ) {
      return [];
    }

    return listLessons(moduleId);
  }

  async create(data: LessonRequestDTO): Promise<LessonDTO> {
    throw new Error("Professor não pode criar aulas");
  }

  async update(id: string, data: LessonRequestDTO): Promise<LessonDTO> {
    return updateLesson(id, data);
  }
}

export class AdminLesson extends LessonService {
  async list() {
    const modules = await listModules();

    const lessons = await Promise.all(
      modules.map((module) => listLessons(module.id)),
    );

    return lessons.flat();
  }

  async get(id: string): Promise<LessonDTO> {
    const lessons = await this.list();

    const lesson = lessons.find((lesson) => lesson.id === id);

    if (!lesson) {
      throw new Error("LESSON_NOT_FOUND");
    }

    return lesson;
  }

  async listByModule(moduleId: string) {
    return listLessons(moduleId);
  }

  async create(data: LessonRequestDTO): Promise<LessonDTO> {
    return createLesson(data);
  }

  async update(id: string, data: LessonRequestDTO): Promise<LessonDTO> {
    return updateLesson(id, data);
  }
}