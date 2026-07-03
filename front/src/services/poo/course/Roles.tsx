import { Course } from "./Course";
import { RoleBase } from "../shared/RoleBase";
import { CourseCard, CourseEntity } from "../shared/types";

function getProfessorName(db: any, discipline: any) {
  if (!discipline) return "";

  const professor = db.users.find((u: any) => u.id === discipline.professor_id);

  return professor?.name ?? "";
}

function getCourseDisciplines(db: any, courseId: number) {
  return db.disciplines.filter((d: any) => d.course_id === courseId);
}

/* aluno */
export class StudentCourse extends Course {
  listCourses(): CourseCard[] {
    return this.database.cursos.map((course) => {
      const enrolled = this.isStudentEnrolled(course.id);

      return {
        ...course,
        enrolled,
        available: !enrolled,
        disciplinesCount: this.getDisciplinesByCourse(course.id).length,
      };
    });
  }

  getCourse(id: number) {
    return this.database.cursos.find((c: any) => c.id === id) || null;
  }

  getDisciplines(courseId: number) {
    return getCourseDisciplines(this.database, courseId);
  }
}

/* professor */
export class ProfessorCourse extends Course {
  listCourses(): CourseCard[] {
    const courseIds = this.getProfessorCourseIds();

    return (this.database.cursos ?? []).map((course) => ({
      ...course,
      enrolled: true,
      available: true,
      disciplinesCount: this.getDisciplinesByCourse(course.id).length,
    }));
  }
  getCourse(id: number) {
    const hasAccess = this.database.disciplinas.some(
      (d: any) => d.course_id === id && d.professor_id === this.user.id,
    );

    if (!hasAccess) return null;

    return this.database.cursos.find((c: any) => c.id === id) || null;
  }

  getDisciplines(courseId: number) {
    return this.database.disciplinas.filter(
      (d: any) => d.course_id === courseId && d.professor_id === this.user.id,
    );
  }
}

/* admin */
export class AdminCourse extends Course {
  listCourses(): CourseCard[] {
    return this.database.cursos.map((course) => ({
      ...course,
      enrolled: true,
      available: true,
      disciplinesCount: this.getDisciplinesByCourse(course.id).length,
    }));
  }

  getCourse(id: number) {
    return this.database.cursos.find((c: any) => c.id === id) || null;
  }

  getDisciplines(courseId: number) {
    return this.database.disciplinas.filter(
      (d: any) => d.course_id === courseId,
    );
  }
}
