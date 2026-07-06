import { Dashboard, DashboardData } from "./dashboard";
import {
  apiCourses,
  apiDisciplines,
  apiModules,
  apiLessons,
  apiEnrollments,
  apiUsers,
} from "../shared/api";

import {
  AssignmentOutlined,
  EmojiEventsOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";


export class StudentDashboard extends Dashboard {
  async getData(): Promise<DashboardData> {
    const [enrollments, courses, disciplines, modules] =
      await Promise.all([
        apiEnrollments.my(),
        apiCourses.list(),
        apiDisciplines.list(),
        apiModules.list(),
      ]);

    const enrollment = enrollments.find(
      (e: any) => e.studentId === this.user.id
    );

    if (!enrollment) {
      return {
        stats: [],
        courses: [],
        disciplines: [],
        modules: [],
        moduleProgress: [],
        progressPercent: 0,
        completedModules: 0,
      };
    }

    const course = courses.find(
      (c) => c.id === enrollment.courseId
    );

    const courseDisciplines = disciplines.filter(
      (d) => d.courseId === course?.id
    );

    const courseModules = modules.filter((m) =>
      courseDisciplines.some((d) => d.id === m.disciplineId)
    );

    const moduleProgress = await Promise.all(
      courseModules.map((m) => apiModules.progress(m.id))
    );

    const completedModules = moduleProgress.filter(
      (p: any) => p.completed
    ).length;

    const progressPercent =
      courseModules.length > 0
        ? Math.round((completedModules / courseModules.length) * 100)
        : 0;

    const lessons = await Promise.all(
      courseModules.map((m) =>
        apiLessons.listByModule(m.id)
      )
    );

    const totalLessons = lessons.flat().length;

    const stats = [
      {
        icon: <AssignmentOutlined sx={{ color: "#1976d2" }} />,
        label: "Aulas",
        value: totalLessons,
      },
      {
        icon: <ShowChartOutlined sx={{ color: "#1976d2" }} />,
        label: "Progresso",
        value: `${progressPercent}%`,
      },
      {
        icon: <EmojiEventsOutlined sx={{ color: "#1976d2" }} />,
        label: "Módulos concluídos",
        value: completedModules,
      },
    ];

    return {
      stats,
      courses: course ? [course] : [],
      disciplines: courseDisciplines,
      modules: courseModules,
      moduleProgress,
      progressPercent,
      completedModules,
    };
  }
}

export class ProfessorDashboard extends Dashboard {
  async getData(): Promise<DashboardData> {
    const [disciplines, courses, modules] = await Promise.all([
      apiDisciplines.list(),
      apiCourses.list(),
      apiModules.list(),
    ]);

    const myDisciplines = disciplines.filter(
      (d: any) => d.professorId === this.user.id
    );

    const disciplineIds = myDisciplines.map((d) => d.id);

    const courseIds = [...new Set(myDisciplines.map((d) => d.courseId))];

    const myCourses = courses.filter((c) =>
      courseIds.includes(c.id)
    );

    const myModules = modules.filter((m) =>
      disciplineIds.includes(m.disciplineId)
    );

    return {
      stats: [
        { label: "Cursos", value: myCourses.length },
        { label: "Disciplinas", value: myDisciplines.length },
        { label: "Módulos", value: myModules.length },
      ],
      courses: myCourses,
      disciplines: myDisciplines,
      modules: myModules,
    };
  }
}

export class AdminDashboard extends Dashboard {
  async getData(): Promise<DashboardData> {
    const [courses, disciplines, modules, users] = await Promise.all([
      apiCourses.list(),
      apiDisciplines.list(),
      apiModules.list(),
      apiUsers.list(),
    ]);

    const lessonsNested = await Promise.all(
      modules.map((m) => apiLessons.listByModule(m.id))
    );

    const lessons = lessonsNested.flat();

    return {
      stats: [
        { label: "Cursos", value: courses.length },
        { label: "Disciplinas", value: disciplines.length },
        { label: "Módulos", value: modules.length },
        { label: "Usuários", value: users.totalElements ?? users.content.length },
      ],
      courses,
      disciplines,
      modules,
      lessons,
      users: users.content,
    };
  }
}