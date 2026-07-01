import { Course } from "./Course";
import { RoleBase } from "../shared/RoleBase";
import { CourseEntity } from "../shared/types";

function getProfessorName(db: any, discipline: any) {
  if (!discipline) return "";

  const professor = db.users.find(
    (u: any) => u.id === discipline.professor_id
  );

  return professor?.name ?? "";
}

function getCourseDisciplines(db: any, courseId: string) {
  return db.disciplines.filter(
    (d: any) => d.course_id === courseId
  );
}

/* aluno */
export class StudentCourse extends Course {
  listCourses(): CourseEntity[] {
    return this.database.courses.map((course: any) => {
      const enrolled = this.database.enrollments.some(
        (e: any) =>
          e.course_id === course.id &&
          e.student_id === this.user.id
      );

      return {
        id: course.id,
        name: course.name,
        area: course.area,
        workload: course.workload,

        enrolled,
        available: !enrolled
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
  listCourses(): CourseEntity[] {
    const disciplines = this.database.disciplines.filter(
      (d: any) => d.professor_id === this.user.id
    );

    const courseIds = [...new Set(disciplines.map((d: any) => d.course_id))];

    return this.database.courses
      .filter((c: any) => courseIds.includes(c.id))
      .map((course: any) => ({
        id: course.id,
        name: course.name,
        area: course.area,
        workload: course.workload
      }));
  }

  getCourse(id: string) {
    const hasAccess = this.database.disciplines.some(
      (d: any) =>
        d.course_id === id &&
        d.professor_id === this.user.id
    );

    if (!hasAccess) return null;

    return this.database.courses.find((c: any) => c.id === id) || null;
  }

  getDisciplines(courseId: string) {
    return this.database.disciplines.filter(
      (d: any) =>
        d.course_id === courseId &&
        d.professor_id === this.user.id
    );
  }
}

/* admin */
export class AdminCourse extends Course {
  listCourses(): CourseEntity[] {
    return this.database.courses;
  }

  getCourse(id: string) {
    return this.database.courses.find((c: any) => c.id === id) || null;
  }

  getDisciplines(courseId: string) {
    return this.database.disciplines.filter(
      (d: any) => d.course_id === courseId
    );
  }
}