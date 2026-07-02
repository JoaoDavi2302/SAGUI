import { Course } from "./Course";
import { RoleBase } from "../shared/RoleBase";
import { CourseCard, CourseEntity } from "../shared/types";

function getProfessorName(db: any, discipline: any) {
  if (!discipline) return "";

  const professor = db.users.find((u: any) => u.id === discipline.professor_id);

  return professor?.name ?? "";
}

function getCourseDisciplines(db: any, courseId: string) {
  return db.disciplines.filter((d: any) => d.course_id === courseId);
}

/* aluno */
export class StudentCourse extends Course {
  listCourses(): CourseCard[] {
    return this.database.courses.map((course) => {
      const enrolled = this.isStudentEnrolled(course.id);

      return {
        ...course,
        enrolled,
        available: !enrolled,
        disciplinesCount: this.getDisciplinesByCourse(course.id).length,
      };
    });
  }

  getCourse(id: string) {
    return this.database.courses.find((c: any) => c.id === id) || null;
  }

  getDisciplines(courseId: string) {
    return getCourseDisciplines(this.database, courseId);
  }
}

/* professor */
export class ProfessorCourse extends Course {
  listCourses(): CourseCard[] {
    const courseIds = this.getProfessorCourseIds();

    return this.database.courses
      .filter((c) => courseIds.includes(c.id))
      .map((course) => ({
        ...course,
        enrolled: true,
        available: false,
        disciplinesCount: this.getDisciplinesByCourse(course.id).length,
      }));
  }
  getCourse(id: string) {
    const hasAccess = this.database.disciplines.some(
      (d: any) => d.course_id === id && d.professor_id === this.user.id,
    );

    if (!hasAccess) return null;

    return this.database.courses.find((c: any) => c.id === id) || null;
  }

  getDisciplines(courseId: string) {
    return this.database.disciplines.filter(
      (d: any) => d.course_id === courseId && d.professor_id === this.user.id,
    );
  }
}

/* admin */
export class AdminCourse extends Course {
  listCourses(): CourseCard[] {
    return this.database.courses.map((course) => ({
      ...course,
      enrolled: true,
      available: true,
      disciplinesCount: this.getDisciplinesByCourse(course.id).length,
    }));
  }

  getCourse(id: string) {
    return this.database.courses.find((c: any) => c.id === id) || null;
  }

  getDisciplines(courseId: string) {
    return this.database.disciplines.filter(
      (d: any) => d.course_id === courseId,
    );
  }
}
