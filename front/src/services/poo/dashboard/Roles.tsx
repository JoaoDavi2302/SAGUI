import { AssignmentOutlined, EmojiEventsOutlined, MenuBookOutlined, SchoolOutlined, ShowChartOutlined } from "@mui/icons-material";
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

    const lessons = this.database.lessons.filter((l: any) =>
      modules.some((m: any) => m.id === l.module_id)
    );

    const lessonProgress = this.database.lesson_progress.filter(
      (lp: any) => lp.student_id === this.user.id
    );

    const completedLessons = lessonProgress.filter(
      (lp: any) =>
        lp.completed &&
        lessons.some((l: any) => l.id === lp.lesson_id)
    ).length;

    // progresso das aulas
    const progressLessons = `${completedLessons}/${lessons.length}`;

    const quizzes = this.database.quizzes.filter((q: any) =>
      modules.some((m: any) => m.id === q.module_id)
    );


    const quizIds = quizzes.map((q: any) => q.id);

    const quizAttempts = this.database.quiz_attempts.filter(
      (qa: any) =>
        qa.student_id === this.user.id &&
        quizIds.includes(qa.quiz_id)
    );

    // progresso das atividades concluidas
    const completedQuizzes = new Set(
      quizAttempts
        .filter((qa: any) => qa.is_approved)
        .map((qa: any) => qa.quiz_id)
    ).size;

    const progressQuizzes = `${completedQuizzes}/${quizzes.length}`;


    // media de acerto das atividades realizadas (não necessáriamente as que acertou o necessário para passar)
    const mediaQuizzes =
      quizAttempts.length > 0
        ? (
          quizAttempts.reduce(
            (sum: number, q: any) => sum + Number(q.score ?? 0),
            0
          ) / quizAttempts.length
        ).toFixed(1)
        : "0";

    // não usado
    // media de acerto de atividades de modulos concluidos
    const moduleScores = moduleProgress.filter(
      (p: any) => p.final_score != null
    );

    const mediaQuizzesModule =
      moduleScores.length > 0
        ? (
          moduleScores.reduce(
            (sum: number, p: any) => sum + p.final_score,
            0
          ) / moduleScores.length
        ).toFixed(1)
        : "0";

    // progresso do curso
    const progressPercent =
      modules.length > 0
        ? Math.round((completedModules / modules.length) * 100)
        : 0;


    // progresso de aula, atividade, media geral e conclusão de curso 
    return {
      stats: [
        { icon:<MenuBookOutlined sx={{ color: "#1976d2" }} /> , label: "Aulas", value: progressLessons },
        { icon:<AssignmentOutlined sx={{ color: "#1976d2" }} /> ,label: "Atividades", value: progressQuizzes },
        { icon:<ShowChartOutlined sx={{ color: "#1976d2" }} /> ,label: "Média de atividades", value: mediaQuizzes },
        { icon:<EmojiEventsOutlined sx={{ color: "#1976d2" }} /> ,label: "Conclusão de curso", value: `${progressPercent}%` },
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

export class AdminDashboard extends Dashboard {
  getData(): DashboardData {
    const courses = this.database.courses;

    const disciplines = this.database.disciplines;

    const modules = this.database.modules;

    const lessons = this.database.lessons;

    const users = this.database.users;

    // const enrollments = this.database.enrollments;

    // const moduleProgress = this.database.module_progress ?? [];

    // const quizAttempts = this.database.quiz_attempts ?? [];

    return {
      stats: [
        { label: "Cursos", value: courses.length },
        { label: "Disciplinas", value: disciplines.length },
        { label: "Módulos", value: modules.length },
        { icon:<MenuBookOutlined sx={{ color: "#1976d2" }} /> ,label: "Aulas", value: lessons.length },
        { label: "Usuários", value: users.length },
      ],

      courses,
      subjects: disciplines,
      modules,
      lessons,
    };
  }
}