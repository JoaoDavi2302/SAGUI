import { Activity } from "./activity";

import {
  ActivityCard,
  ModuleActivityCard,
  QuizEntity,
} from "../shared/types";

function buildActivityCard(
  db: any,
  activity: any,
): ActivityCard {
  const module = db.modules.find(
    (m: any) => m.id === activity.module_id,
  );

  const discipline = db.disciplines.find(
    (d: any) => d.id === module?.discipline_id,
  );

  const course = db.courses.find(
    (c: any) => c.id === discipline?.course_id,
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
  const discipline = db.disciplines.find(
    (d: any) => d.id === module.discipline_id,
  );

  const course = db.courses.find(
    (c: any) => c.id === discipline?.course_id,
  );

  const quizzes = db.quizzes
    .filter((q: any) => q.module_id === module.id)
    .map((q: any) => buildActivityCard(db, q));

  return {
    moduleId: module.id,
    moduleName: module.name,

    disciplineId: discipline?.id ?? "",
    disciplineName: discipline?.name ?? "",

    courseId: course?.id ?? "",
    courseName: course?.name ?? "",

    quizzes,
  };
}

export class StudentActivity extends Activity {
  listModules(): ModuleActivityCard[] {
  const courseIds = this.getStudentCourseIds();

  return this.database.modules
    .filter((module: any) => {
      const discipline = this.getDisciplineById(module.discipline_id);

      if (!discipline) return false;

      if (!courseIds.includes(discipline.course_id))
        return false;

      return this.database.quizzes.some(
        (q: any) => q.module_id === module.id,
      );
    })
    .map((module: any) => buildModuleCard(this.database, module));
}

listActivities(moduleId: string): ActivityCard[] {
  const courseIds = this.getStudentCourseIds();

  return this.database.quizzes
    .filter((quiz: any) => {
      if (quiz.module_id !== moduleId) return false;

      const module = this.getModuleById(quiz.module_id);
      if (!module) return false;

      const discipline = this.getDisciplineById(module.discipline_id);
      if (!discipline) return false;

      return courseIds.includes(discipline.course_id);
    })
    .map((q: any) => buildActivityCard(this.database, q));
}

  getActivity(id: string) {
    return (
      this.database.quizzes.find(
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

  return this.database.modules
    .filter((module: any) => {
      const discipline = this.getDisciplineById(module.discipline_id);

      if (!discipline) return false;

      if (!courseIds.includes(discipline.course_id))
        return false;

      return this.database.quizzes.some(
        (q: any) => q.module_id === module.id,
      );
    })
    .map((module: any) => buildModuleCard(this.database, module));
}

listActivities(moduleId: string): ActivityCard[] {
  const courseIds = this.getStudentCourseIds();

  return this.database.quizzes
    .filter((quiz: any) => {
      if (quiz.module_id !== moduleId) return false;

      const module = this.getModuleById(quiz.module_id);
      if (!module) return false;

      const discipline = this.getDisciplineById(module.discipline_id);
      if (!discipline) return false;

      return courseIds.includes(discipline.course_id);
    })
    .map((q: any) => buildActivityCard(this.database, q));
}

  getActivity(id: string) {
    return (
      this.database.quizzes.find(
        (q: any) => q.id === id,
      ) ?? null
    );
  }

  updateActivity(
    id: string,
    data: Partial<QuizEntity>,
  ) {
    const activity =
      this.database.quizzes.find(
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

  return this.database.modules
    .filter((module: any) => {
      const discipline = this.getDisciplineById(module.discipline_id);

      if (!discipline) return false;

      if (!courseIds.includes(discipline.course_id))
        return false;

      return this.database.quizzes.some(
        (q: any) => q.module_id === module.id,
      );
    })
    .map((module: any) => buildModuleCard(this.database, module));
}

listActivities(moduleId: string): ActivityCard[] {
  const courseIds = this.getStudentCourseIds();

  return this.database.quizzes
    .filter((quiz: any) => {
      if (quiz.module_id !== moduleId) return false;

      const module = this.getModuleById(quiz.module_id);
      if (!module) return false;

      const discipline = this.getDisciplineById(module.discipline_id);
      if (!discipline) return false;

      return courseIds.includes(discipline.course_id);
    })
    .map((q: any) => buildActivityCard(this.database, q));
}

  getActivity(id: string) {
    return (
      this.database.quizzes.find(
        (q: any) => q.id === id,
      ) ?? null
    );
  }

  updateActivity(
    id: string,
    data: Partial<QuizEntity>,
  ) {
    const activity =
      this.database.quizzes.find(
        (q: any) => q.id === id,
      );

    if (!activity) return null;

    Object.assign(activity, data);

    return activity;
  }
}