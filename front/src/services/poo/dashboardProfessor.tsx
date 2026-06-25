// falta completar
import { Dashboard } from "./dashboard";

export class ProfessorDashboard extends Dashboard {

  getData() {

    const disciplines =
      this.database.disciplines.filter(
        (d: any) => d.professor_id === this.user.id
      );

    const courseIds =
      [...new Set(
        disciplines.map(
          (d: any) => d.course_id
        )
      )];

    const courses =
      this.database.courses.filter(
        (c: any) => courseIds.includes(c.id)
      );

    return {
      stats: [
        {
          label: "Cursos",
          value: courses.length
        },
        {
          label: "Disciplinas",
          value: disciplines.length
        }
      ],

      courses,

      subjects: disciplines
    };
  }
}