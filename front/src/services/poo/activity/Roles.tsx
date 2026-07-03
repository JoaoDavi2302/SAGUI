import { Activity } from "./activity";

import {
  ActivityCard,
  ModuleActivityCard,
  QuestionsEntity,
} from "../shared/types";

function buildActivityCard(
  db: any,
  activity: any,
): ActivityCard {
  const module = db.modulos.find(
    (m: any) => m.id === activity.modulo_id,
  );

  const discipline = db.disciplinas.find(
    (d: any) => d.id === module?.disciplina_id,
  );

  const course = db.cursos.find(
    (c: any) => c.id === discipline?.curso_id,
  );

  const questionCount =
    db.questions?.filter(
      (q: any) => q.quiz_id === activity.id,
    ).length ?? 0;

  return {
    ...activity,

    moduleId: module?.id ?? "",
    moduleName: module?.name ?? "",

    disciplineId: discipline?.id ?? "",
    disciplineName: discipline?.name ?? "",

    courseId: course?.id ?? "",
    courseName: course?.name ?? "",

    questionCount,
  };
}

function buildModuleCard(
  db: any,
  module: any,
): ModuleActivityCard {
  const discipline = db.disciplinas.find(
    (d: any) => d.id === module.disciplina_id,
  );

  const course = db.cursos.find(
    (c: any) => c.id === discipline?.curso_id,
  );

  const quizzes = db.atividades
    .filter((q: any) => q.modulo_id === module.id)
    .map((q: any) => buildActivityCard(db, q));

  return {
    moduleId: module.id,
    moduleName: module.nome,

    disciplineId: discipline?.id ?? "",
    disciplineName: discipline?.nome ?? "",

    courseId: course?.id ?? "",
    courseName: course?.nome ?? "",

    quizzes,
  };
}

export class StudentActivity extends Activity {
  listModules(): ModuleActivityCard[] {
  const courseIds = this.getStudentCourseIds();

  return this.database.modulos
    .filter((module: any) => {
      const discipline = this.getDisciplineById(module.disciplina_id);

      if (!discipline) return false;

      if (!courseIds.includes(discipline.curso_id))
        return false;

      return this.database.atividades.some(
        (q: any) => q.modulo_id === module.id,
      );
    })
    .map((module: any) => buildModuleCard(this.database, module));
}

listActivities(moduleId: number): ActivityCard[] {
  const courseIds = this.getStudentCourseIds();

  return this.database.atividades
    .filter((quiz: any) => {
      if (quiz.modulo_id !== moduleId) return false;

      const module = this.getModuleById(quiz.modulo_id);
      if (!module) return false;

      const discipline = this.getDisciplineById(module.disciplina_id);
      if (!discipline) return false;

      return courseIds.includes(discipline.curso_id);
    })
    .map((q: any) => buildActivityCard(this.database, q));
}

  getActivity(id: number) {
    return (
      this.database.atividades.find(
        (q: any) => q.id === id,
      ) ?? null
    );
  }

  updateActivity() {
    return null;
  }
}

export class ProfessorActivity extends Activity {
  listModules(): ModuleActivityCard[] {
  const courseIds = this.getProfessorCourseIds();

  return this.database.modulos
    .filter((module: any) => {
      const discipline = this.getDisciplineById(module.disciplina_id);

      if (!discipline) return false;

      if (!courseIds.includes(discipline.curso_id))
        return false;

      return this.database.atividades.some(
        (q: any) => q.modulo_id === module.id,
      );
    })
    .map((module: any) => buildModuleCard(this.database, module));
}

listActivities(moduleId: number): ActivityCard[] {
  const courseIds = this.getStudentCourseIds();

  return this.database.atividades
    .filter((quiz: any) => {
      if (quiz.modulo_id !== moduleId) return false;

      const module = this.getModuleById(quiz.modulo_id);
      if (!module) return false;

      const discipline = this.getDisciplineById(module.disciplina_id);
      if (!discipline) return false;

      return courseIds.includes(discipline.curso_id);
    })
    .map((q: any) => buildActivityCard(this.database, q));
}

  getActivity(id: number) {
    return (
      this.database.atividades.find(
        (q: any) => q.id === id,
      ) ?? null
    );
  }

  updateActivity(
    id: number,
    data: Partial<QuestionsEntity>,
  ) {
    const activity =
      this.database.atividades.find(
        (q: any) => q.id === id,
      );

    if (!activity) return null;

    Object.assign(activity, data);

    return activity;
  }
}

export class AdminActivity extends Activity {
  listModules(): ModuleActivityCard[] {
 const courseIds = this.getAllCourseIds();

  return this.database.modulos
    .filter((module: any) => {
      const discipline = this.getDisciplineById(module.modulo_id);

      if (!discipline) return false;

      if (!courseIds.includes(discipline.curso_id))
        return false;

      return this.database.atividades.some(
        (q: any) => q.modulo_id === module.id,
      );
    })
    .map((module: any) => buildModuleCard(this.database, module));
}

listActivities(moduleId: number): ActivityCard[] {
  const courseIds = this.getStudentCourseIds();

  return this.database.atividades
    .filter((quiz: any) => {
      if (quiz.modulo_id !== moduleId) return false;

      const module = this.getModuleById(quiz.modulo_id);
      if (!module) return false;

      const discipline = this.getDisciplineById(module.disciplina_id);
      if (!discipline) return false;

      return courseIds.includes(discipline.curso_id);
    })
    .map((q: any) => buildActivityCard(this.database, q));
}

  getActivity(id: number) {
    return (
      this.database.atividades.find(
        (q: any) => q.id === id,
      ) ?? null
    );
  }

  updateActivity(
    id: number,
    data: Partial<QuestionsEntity>,
  ) {
    const activity =
      this.database.atividades.find(
        (q: any) => q.id === id,
      );

    if (!activity) return null;

    Object.assign(activity, data);

    return activity;
  }
}