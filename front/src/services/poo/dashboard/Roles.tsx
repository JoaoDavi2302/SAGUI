import {
  AssignmentOutlined,
  EmojiEventsOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";
import { Dashboard } from "./dashboard";
import { DashboardData } from "./dashboard";

export class StudentDashboard extends Dashboard {
  getData(): DashboardData {
    const enrollment = this.database.matriculas.find(
      (e: any) => e.aluno_id === this.user?.id,
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

    const course = this.database.cursos.find(
      (c: any) => c.id === enrollment.curso_id,
    );

    const disciplines = this.database.disciplinas.filter(
      (d: any) => d.curso_id === course?.id,
    );

    const modules = this.database.modulos.filter((m: any) =>
      disciplines.some((d: any) => d.id === m.disciplina_id),
    );

    const moduleProgress = this.database.progresso_modulo.filter(
      (p: any) => p.aluno_id === this.user?.id,
    );

    const completedModules = moduleProgress.filter(
      (p: any) =>
        p.concluido &&
        modules.some((m: any) => m.id === p.modulo_id),
    ).length;

    const quizzes = this.database.atividades.filter((q: any) =>
      modules.some((m: any) => m.id === q.modulo_id),
    );

    const progressQuizzes = `${quizzes.length}/${quizzes.length}`;

    const moduleScores = moduleProgress.filter(
      (p: any) => p.nota != null,
    );

    const mediaQuizzesModule =
      moduleScores.length > 0
        ? (
            moduleScores.reduce(
              (sum: number, p: any) => sum + Number(p.nota),
              0,
            ) / moduleScores.length
          ).toFixed(1)
        : "0";

    const progressPercent =
      modules.length > 0
        ? Math.round((completedModules / modules.length) * 100)
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
          value: mediaQuizzesModule,
        },
        {
          icon: <EmojiEventsOutlined sx={{ color: "#1976d2" }} />,
          label: "Conclusão de curso",
          value: `${progressPercent}%`,
        },
      ],

      courses: course ? [course] : [],
      subjects: disciplines,
      modules,

      module_progress: moduleProgress,
      completedModules,
      progressPercent,
    };
  }
}

export class ProfessorDashboard extends Dashboard {
  getData(): DashboardData {
    const disciplines = this.database.disciplinas.filter(
      (d: any) => d.professor_id === this.user?.id,
    );

    const disciplineIds = disciplines.map((d: any) => d.id);

    const courseIds = [...new Set(disciplines.map((d: any) => d.curso_id))];

    const courses = this.database.cursos.filter((c: any) =>
      courseIds.includes(c.id),
    );

    const modules = this.database.modulos.filter((m: any) =>
      disciplineIds.includes(m.disciplina_id),
    );

    return {
      stats: [
        { label: "Cursos", value: courses.length },
        { label: "Disciplinas", value: disciplines.length },
        { label: "Módulos", value: modules.length },
      ],

      courses,
      subjects: disciplines,
      modules,
    };
  }
}

export class AdminDashboard extends Dashboard {
  getData(): DashboardData {
    const courses = this.database.cursos;
    const disciplines = this.database.disciplinas;
    const modules = this.database.modulos;
    const lessons = this.database.aulas;
    const users = this.database.usuarios;

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
    };
  }
}