import { Dashboard } from "./dashboard";
import { DashboardData } from "./dashboard";

export class ProfessorDashboard extends Dashboard {
  getData(): DashboardData {
    const disciplines = this.database.disciplines.filter(
      (d: any) => d.professor_id === this.user.id
    );

    const disciplineIds = disciplines.map((d: any) => d.id);

    const courseIds = [...new Set(disciplines.map((d: any) => d.course_id))];

    const courses = this.database.courses.filter((c: any) =>
      courseIds.includes(c.id)
    );

    const modules = this.database.modules.filter((m: any) =>
      disciplineIds.includes(m.discipline_id)
    );

    return {
      stats: [
        { label: "Cursos", value: courses.length },
        { label: "Disciplinas", value: disciplines.length },
      ],

      courses,
      subjects: disciplines,
      modules,
    };
  }
}