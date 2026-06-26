import { Dashboard } from "./dashboard";
import { DashboardData } from "./dashboard";

export class StudentDashboard extends Dashboard {
  getData(): DashboardData {
    const enrollment = this.database.enrollments.find(
      (e: any) => e.student_id === this.user.id
    );

    if (!enrollment) {
      return {
        stats: [],
        courses: [],
        subjects: [],
        modules: [],
        module_progress: [],
        progressPercent: 0,
        completedModules: 0,
      };
    }

    const course = this.database.courses.find(
      (c: any) => c.id === enrollment.course_id
    );

    const disciplines = this.database.disciplines.filter(
      (d: any) => d.course_id === course.id
    );

    const disciplineIds = disciplines.map((d: any) => d.id);

    const modules = this.database.modules.filter((m: any) =>
      disciplineIds.includes(m.discipline_id)
    );

    const moduleProgress = this.database.module_progress.filter(
      (p: any) => p.student_id === this.user.id
    );

    const completedModules = moduleProgress.filter(
      (p: any) =>
        p.status === "COMPLETED" &&
        modules.find((m: any) => m.id === p.module_id)
    ).length;

    const progressPercent =
      modules.length > 0
        ? Math.round((completedModules / modules.length) * 100)
        : 0;

    return {
      stats: [
        { label: "Curso", value: 1 },
        { label: "Disciplinas", value: disciplines.length },
        { label: "Progresso", value: `${progressPercent}%` },
      ],

      courses: [course],
      subjects: disciplines,
      modules,

      module_progress: moduleProgress,
      completedModules,
      progressPercent,
    };
  }
}