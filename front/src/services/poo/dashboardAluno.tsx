// falta completar
import { Dashboard } from "./dashboard";

export class StudentDashboard extends Dashboard {

  getData() {

    const enrollment =
      this.database.enrollments.find(
        (e: any) => e.student_id === this.user.id
      );

    if (!enrollment) {
      return {
        stats: [],
        courses: [],
        subjects: []
      };
    }

    const course =
      this.database.courses.find(
        (c: any) => c.id === enrollment.course_id
      );

    const disciplines =
      this.database.disciplines.filter(
        (d: any) => d.course_id === course.id
      );

    return {
      stats: [
        {
          label: "Curso",
          value: 1,
        },
        {
          label: "Disciplinas",
          value: disciplines.length
        }
      ],

      courses: [course],

      subjects: disciplines
    };
  }
}