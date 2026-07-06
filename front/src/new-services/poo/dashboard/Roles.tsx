import { Dashboard, DashboardData } from "./dashboard";
import { apiDashboard } from "../shared/api";
import {
  AssignmentOutlined,
  EmojiEventsOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";

export class StudentDashboard extends Dashboard {
  async getData(): Promise<DashboardData> {
    const [enrollments, courses, disciplines, modules, progress, activities] =
      await Promise.all([
        apiDashboard.enrollments(),
        apiDashboard.courses(),
        apiDashboard.disciplines(),
        apiDashboard.modules(),
        apiDashboard.progress(),
        apiDashboard.activities(),
      ]);

    const enrollment = enrollments.find(
      (e: any) => e.aluno_id === this.user.id
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

    const course = courses.find(
      (c: any) => c.id === enrollment.curso_id
    );

    const courseDisciplines = disciplines.filter(
      (d: any) => d.curso_id === course?.id
    );

    const courseModules = modules.filter((m: any) =>
      courseDisciplines.some((d: any) => d.id === m.disciplina_id)
    );

    const moduleProgress = progress.filter(
      (p: any) => p.aluno_id === this.user.id
    );

    const completedModules = moduleProgress.filter(
      (p: any) =>
        p.concluido &&
        courseModules.some((m: any) => m.id === p.modulo_id)
    ).length;

    const quizzes = activities.filter((a: any) =>
      courseModules.some((m: any) => m.id === a.modulo_id)
    );

    const progressQuizzes = `${quizzes.length}/${quizzes.length}`;

    const moduleScores = moduleProgress.filter((p: any) => p.nota != null);

    const media =
      moduleScores.length > 0
        ? (
            moduleScores.reduce((sum: number, p: any) => sum + Number(p.nota), 0) /
            moduleScores.length
          ).toFixed(1)
        : "0";

    const progressPercent =
      courseModules.length > 0
        ? Math.round((completedModules / courseModules.length) * 100)
        : 0;

    return {
      stats: [
        {
          icon: <AssignmentOutlined sx={{ color: "#1976d2" }} />,
          label: "Atividades",
          value: progressQuizzes,
        },
        {
          icon: <ShowChartOutlined sx={{ color: "#1976d2" }} />,
          label: "Média de atividades",
          value: media,
        },
        {
          icon: <EmojiEventsOutlined sx={{ color: "#1976d2" }} />,
          label: "Conclusão de curso",
          value: `${progressPercent}%`,
        },
      ],
      courses: course ? [course] : [],
      subjects: courseDisciplines,
      modules: courseModules,
      module_progress: moduleProgress,
      completedModules,
      progressPercent,
    };
  }
}

export class ProfessorDashboard extends Dashboard {
  async getData(): Promise<DashboardData> {
    const [disciplines, courses, modules] = await Promise.all([
      apiDashboard.disciplines(),
      apiDashboard.courses(),
      apiDashboard.modules(),
    ]);

    const myDisciplines = disciplines.filter(
      (d: any) => d.professor_id === this.user.id
    );

    const disciplineIds = myDisciplines.map((d: any) => d.id);

    const courseIds = [...new Set(myDisciplines.map((d: any) => d.curso_id))];

    const myCourses = courses.filter((c: any) =>
      courseIds.includes(c.id)
    );

    const myModules = modules.filter((m: any) =>
      disciplineIds.includes(m.disciplina_id)
    );

    return {
      stats: [
        { label: "Cursos", value: myCourses.length },
        { label: "Disciplinas", value: myDisciplines.length },
        { label: "Módulos", value: myModules.length },
      ],
      courses: myCourses,
      subjects: myDisciplines,
      modules: myModules,
    };
  }
}

export class AdminDashboard extends Dashboard {
  async getData(): Promise<DashboardData> {
    const [courses, disciplines, modules, lessons, users] =
      await Promise.all([
        apiDashboard.courses(),
        apiDashboard.disciplines(),
        apiDashboard.modules(),
        apiDashboard.lessons(),
        apiDashboard.users(),
      ]);

    return {
      stats: [
        { label: "Cursos", value: courses.length },
        { label: "Disciplinas", value: disciplines.length },
        { label: "Módulos", value: modules.length },
        { label: "Aulas", value: lessons.length },
        { label: "Usuários", value: users.length },
      ],
      courses,
      subjects: disciplines,
      modules,
      lessons,
      users,
    };
  }
}