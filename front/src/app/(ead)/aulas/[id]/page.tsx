"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  AttachFileOutlined,
  CheckCircle,
  Description,
  MenuBookOutlined,
  NavigateNext,
  PlayCircleOutlined,
  QuizOutlined,
  Replay,
} from "@mui/icons-material";

import { useUser } from "@/new-services/auth/AuthContext";
import { AttachmentList } from "@/components/lesson/AttachmentList";
import { AttachmentForm } from "@/components/lesson/AttachmentForm";
import { ActivityTakeForm } from "@/components/student/ActivityTakeForm";
import { AttemptHistoryList } from "@/components/student/AttemptHistoryList";
import {
  listAttachments,
  type AttachmentDTO,
} from "@/new-services/poo/shared/api/attachments";
import {
  completeLesson,
  getLesson,
  listLessons,
  type LessonDTO,
} from "@/new-services/poo/shared/api/lessons";
import { getModule, listModules } from "@/new-services/poo/shared/api/modules";
import { getDiscipline } from "@/new-services/poo/shared/api/disciplines";
import { getDisciplineProgress } from "@/new-services/poo/shared/api/progress";
import { slugify } from "@/components/layout/headerConfig";
import {
  listStudentActivities,
  listMyActivityAttempts,
  type ActivityStudentSummaryResponse,
} from "@/new-services/poo/shared/api/activities";
import { ApiError } from "@/new-services/poo/shared/api/client";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const sectionCardSx = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

function SectionHeader({
  icon,
  title,
  chip,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  chip?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ mb: compact ? 1 : 1.5, alignItems: "center" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          borderRadius: 1.5,
          bgcolor: "primary.50",
          color: "primary.main",
          "& svg": { fontSize: compact ? 16 : 18 },
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: compact ? 14 : 16, flex: 1 }}>
        {title}
      </Typography>
      {chip}
    </Stack>
  );
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
<<<<<<< HEAD
  const { effectiveRole } = useUser();

  const lessonId = String(params.id);
=======
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const lessonId = Number(params.id);
>>>>>>> origin/develop
  const activityId = searchParams.get("atividade");
  const isValidLessonId = UUID_PATTERN.test(lessonId);

  const [lesson, setLesson] = useState<LessonDTO | null>(null);
  const [moduleName, setModuleName] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [disciplineName, setDisciplineName] = useState("");
  const [nextModule, setNextModule] = useState<{
    id: string;
    name: string;
    unlocked: boolean;
    firstLessonId: string | null;
  } | null>(null);
  const [siblings, setSiblings] = useState<LessonDTO[]>([]);
  const [activities, setActivities] = useState<ActivityStudentSummaryResponse[]>([]);
  const [attempts, setAttempts] = useState<Awaited<ReturnType<typeof listMyActivityAttempts>>>([]);
  const [minimumScore, setMinimumScore] = useState(0);
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

<<<<<<< HEAD
  const activeActivity = useMemo(
    () => activities.find((a) => a.id === activityId),
    [activities, activityId],
  );

  const loadAttachments = useCallback(async () => {
    if (!isValidLessonId) return;

    setAttachmentsLoading(true);
    setAttachmentsError(null);

    try {
      const active = await listAttachments(lessonId);

      if (effectiveRole === "Professor" || effectiveRole === "Admin") {
        const inactive = await listAttachments(lessonId, "Inactive");
        setAttachments([...active, ...inactive]);
      } else {
        setAttachments(active);
      }
    } catch (err) {
      setAttachments([]);
      setAttachmentsError(
        err instanceof ApiError ? err.message : "Não foi possível carregar os materiais",
      );
    } finally {
      setAttachmentsLoading(false);
    }
  }, [effectiveRole, isValidLessonId, lessonId]);

  const refreshNextModule = useCallback(
    async (currentModuleId: string, currentDisciplineId: string) => {
      const modulesPage = await listModules(currentDisciplineId, "Active", 0, 100);
      const sortedModules = modulesPage.content.sort((a, b) => a.orderIndex - b.orderIndex);
      const currentModuleIndex = sortedModules.findIndex((m) => m.id === currentModuleId);

      if (currentModuleIndex < 0 || currentModuleIndex >= sortedModules.length - 1) {
        setNextModule(null);
        return;
      }

      const nextMod = sortedModules[currentModuleIndex + 1];
      let unlocked = effectiveRole !== "Aluno";

      if (effectiveRole === "Aluno") {
        const progress = await getDisciplineProgress(currentDisciplineId);
        const nextProgress = progress.modules.find((m) => m.moduleId === nextMod.id);
        unlocked = nextProgress?.unlocked ?? false;
      }

      let firstLessonId: string | null = null;
      if (unlocked || effectiveRole !== "Aluno") {
        const nextLessons = await listLessons(nextMod.id, "Active");
        firstLessonId =
          nextLessons.sort((a, b) => a.orderIndex - b.orderIndex)[0]?.id ?? null;
      }

      setNextModule({
        id: nextMod.id,
        name: nextMod.name,
        unlocked,
        firstLessonId,
      });
    },
    [effectiveRole],
  );

  const loadLesson = useCallback(async () => {
    if (!isValidLessonId) {
      setError("Identificador de aula inválido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lessonData = await getLesson(lessonId);
      setLesson(lessonData);

      const [moduleData, moduleLessons] = await Promise.all([
        getModule(lessonData.moduleId),
        listLessons(lessonData.moduleId, "Active"),
      ]);

      setModuleName(moduleData.name);
      const discipline = await getDiscipline(moduleData.disciplineId);
      setDisciplineId(discipline.id);
      setDisciplineName(discipline.name);

      const sortedLessons = moduleLessons.sort((a, b) => a.orderIndex - b.orderIndex);
      setSiblings(sortedLessons);

      await refreshNextModule(lessonData.moduleId, moduleData.disciplineId);

      if (effectiveRole === "Aluno") {
        const moduleActivities = await listStudentActivities(lessonData.moduleId);
        setActivities(moduleActivities);

        if (activityId) {
          const activityAttempts = await listMyActivityAttempts(activityId);
          setAttempts(activityAttempts);
          const current = moduleActivities.find((a) => a.id === activityId);
          setMinimumScore(current?.minimumScore ?? 0);
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activityId, effectiveRole, isValidLessonId, lessonId, refreshNextModule]);

  useEffect(() => {
    void loadLesson();
  }, [loadLesson]);

  useEffect(() => {
    void loadAttachments();
  }, [loadAttachments]);

  const activeAttachments = useMemo(
    () => attachments.filter((attachment) => attachment.status === "Active"),
    [attachments],
  );

  const currentIndex = siblings.findIndex((l) => l.id === lessonId);
  const prev = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;

  const handleCompleteLesson = async () => {
    setCompleting(true);
    try {
      const result = await completeLesson(lessonId);
      setCompleted(result.completed);
      setSnackbar("Aula concluída com sucesso!");
      if (lesson?.moduleId && disciplineId) {
        await refreshNextModule(lesson.moduleId, disciplineId);
      }
    } catch (err) {
      setSnackbar(getApiErrorMessage(err));
    } finally {
      setCompleting(false);
    }
  };
=======
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    const url = urlMatch?.[0];

    if (!url) return null;

    const match = url.match(/v=([^&]+)/);
    return match ? match[1] : null;
  };

  // aulas
  const lesson = database.aulas.find((l: any) => l.id === lessonId);

  const videoId = getYouTubeId(lesson?.conteudo);

  const playerRef = useRef<any>(null);

  const [playing, setPlaying] = useState(false);

  const [progress, setProgress] = useState(0);

  const [duration, setDuration] = useState(0);

  const format = (value: number) => {
    const min = Math.floor(value / 60);

    const sec = Math.floor(value % 60);

    return `${min}:${String(sec).padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const current = playerRef.current.getCurrentTime();

        setProgress(current);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const onReady = (e: any) => {
    playerRef.current = e.target;

    setDuration(e.target.getDuration());
  };

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }

    setPlaying(!playing);
  };

  const seek = (_: any, value: any) => {
    playerRef.current?.seekTo(value);

    setProgress(value);
  };

  if (!lesson) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Aula não encontrada</Typography>
      </Box>
    );
  }

  // mdoulo
  const module = database.modulos.find((m) => m.id === lesson.modulo_id);

  const discipline = database.disciplinas.find(
    (d: any) => d.id === module?.disciplina_id,
  );

  // aulas do modulo
  const siblings = useMemo(() => {
    return database.aulas
      .filter((l) => l.modulo_id === lesson.modulo_id)
      .sort((a: any, b: any) => a.ordem - b.ordem);
  }, [lesson.modulo_id]);

  const currentIndex = siblings.findIndex((l: any) => l.id === lesson.id);
  const prev = siblings[currentIndex - 1];
  const next = siblings[currentIndex + 1];

  const activities =
    database.atividades?.filter((a: any) => a.modulo_id === lesson.modulo_id) ??
    [];

  const activeActivity = activityId
    ? activities.find((a) => a.id === Number(activityId))
    : null;
>>>>>>> origin/develop

  const goToLesson = (id: number) => {
    router.push(`/aulas/${id}`);
  };

  const openActivity = (id: number) => {
    router.push(`/aulas/${lessonId}?atividade=${id}`);
  };

<<<<<<< HEAD
  const disciplineHref = disciplineId
    ? `/disciplinas/${slugify(disciplineName)}?id=${disciplineId}`
    : "/disciplinas";

  const goToNextModule = () => {
    if (!nextModule) return;

    if (nextModule.firstLessonId) {
      router.push(`/aulas/${nextModule.firstLessonId}`);
      return;
    }

    router.push(disciplineHref);
  };

  const pageTitle =
    activityId && activeActivity ? activeActivity.title : lesson?.name ?? "";

  if (!isValidLessonId) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: "auto" }}>
        <Alert severity="warning">
          Aula não encontrada. Use o link da disciplina para acessar aulas válidas.
        </Alert>
        <Button component={Link} href="/disciplinas" sx={{ mt: 2 }}>
          Ir para disciplinas
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !lesson) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: "auto" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? "Aula não encontrada."}
        </Alert>
        <Button component={Link} href="/disciplinas">
          Voltar para disciplinas
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1.5, md: 2 }, py: { xs: 1.5, md: 2 }, maxWidth: 1280, mx: "auto" }}>
      <Stack spacing={1.5}>
        {/* Cabeçalho em largura total — alinha colunas abaixo */}
        <Box sx={{ px: 0.5 }}>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 1, fontSize: "0.8125rem" }}
          >
            {[
              <Link
                key="disciplinas"
                href="/disciplinas"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Typography variant="body2" color="text.secondary">
                  Disciplinas
                </Typography>
              </Link>,
              disciplineId ? (
                <Link
                  key="discipline"
                  href={disciplineHref}
                  style={{ textDecoration: "none", color: "inherit" }}
=======
  const lessonMaterials = useMemo(() => {
    return null;
    // return database.anexos.filter((a) => a.aula_id === lesson.id);
  }, [lesson.id]);

  const quizQuestions = activeActivity
    ? database.questoes
        .filter((q) => q.atividade_id === activeActivity.id)
        .sort((a, b) => a.ordem - b.ordem)
    : [];

  const attempt =
    database.tentativas_atividade?.find(
      (a: any) => a.quiz_id === activeActivity?.id,
    ) ?? null;

  // const approved = attempt?.status === "FINISHED" && attempt?.is_approved;

  // const answers =
  //   database.respostas_aluno?.filter(
  //     (a: any) => a.quiz_attempt_id === attempt?.id,
  //   ) ?? [];

  const getAlternatives = (questionId: number) =>
    database.alternativas
      .filter((a) => a.questao_id === questionId)
      .sort((a, b) => a.ordem - b.ordem);

  const selectedAlternative = (questionId: number) => answers[questionId] ?? "";

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="h6">{lesson.titulo}</Typography>

          <Typography variant="body2" color="text.secondary">
            {module?.nome} • {discipline?.nome}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* <Typography variant="body2">{lesson.description}</Typography> */}
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "2fr 380px",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              {!activeActivity ? (
                <>
                  <Typography sx={{ fontWeight: 600, mb: 2 }}>
                    Aula em vídeo
                  </Typography>

                  {videoId && (
                    <Card
                      sx={{
                        overflow: "hidden",
                        bgcolor: "#111",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "16 / 9",
                          bgcolor: "#000",

                          "& iframe": {
                            position: "absolute",
                            inset: 0,
                            width: "100% !important",
                            height: "100% !important",
                            border: 0,
                          },
                        }}
                      >
                        <YouTube
                          videoId={videoId}
                          onReady={onReady}
                          opts={{
                            playerVars: {
                              controls: 0,
                              modestbranding: 1,
                              rel: 0,
                            },
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          px: 3,
                          py: 2,
                          bgcolor: "#fff",
                        }}
                      >
                        <Slider
                          value={progress}
                          max={duration}
                          onChange={seek}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <IconButton onClick={togglePlay}>
                            {playing ? <Pause /> : <PlayArrow />}
                          </IconButton>

                          <Typography variant="caption">
                            {format(progress)} / {format(duration)}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  )}
                </>
              ) : (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {activeActivity.titulo}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {activeActivity.descricao}
                  </Typography>

                  <Stack spacing={3}>
                    {quizQuestions.map((question: any, index) => {
                      const alternatives = getAlternatives(question.id);

                      return (
                        <Card
                          key={question.id}
                          variant="outlined"
                          sx={{
                            borderRadius: 3,
                          }}
                        >
                          <CardContent>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                mb: 2,
                              }}
                            >
                              {index + 1}. {question.enunciado}
                            </Typography>

                            <RadioGroup
                              value={selectedAlternative(question.id)}
                              onChange={(e) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [question.id]: Number(e.target.value),
                                }))
                              }
                            >
                              <Stack spacing={1}>
                                {alternatives.map((alt: any) => {
                                  const selected =
                                    selectedAlternative(question.id) === alt.id;

                                  const isWrong = selected && !alt.correta;

                                  const isRight = selected && alt.correta;

                                  const professorCorrect =
                                    effectiveRole === "PROFESSOR" &&
                                    alt.correta;

                                  return (
                                    <Box
                                      key={alt.id}
                                      sx={{
                                        px: 2,
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: isWrong
                                          ? "#ef5350"
                                          : isRight || professorCorrect
                                            ? "#43a047"
                                            : "#eee",

                                        bgcolor: isWrong
                                          ? "#ffebee"
                                          : isRight || professorCorrect
                                            ? "#e8f5e9"
                                            : "#fff",

                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <FormControlLabel
                                        value={alt.id}
                                        control={<Radio />}
                                        label={
                                          <Typography
                                            sx={{ userSelect: "none" }}
                                          >
                                            {alt.texto}
                                          </Typography>
                                        }
                                      />
                                    </Box>
                                  );
                                })}
                              </Stack>
                            </RadioGroup>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* {attempt && (
                      <Card
                        sx={{
                          borderRadius: 3,
                          bgcolor: approved ? "#f1f8e9" : "#fff3e0",
                        }}
                      >
                        <CardContent>
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            Nota: {attempt.score}
                          </Typography>

                          <Typography>
                            Resultado: {approved ? "Aprovado" : "Reprovado"}
                          </Typography>
                        </CardContent>
                      </Card>
                    )} */}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
          {!activeActivity && (
            <Card
              sx={{
                borderRadius: 4,
                my: 3,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 3,
                  }}
>>>>>>> origin/develop
                >
                  <Typography variant="body2" color="text.secondary">
                    {disciplineName}
                  </Typography>
                </Link>
              ) : null,
              <Typography key="module" variant="body2" color="text.secondary">
                {moduleName}
              </Typography>,
              ...(activityId
                ? [
                    <Link
                      key="lesson-link"
                      href={`/aulas/${lessonId}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {lesson.name}
                      </Typography>
                    </Link>,
                    <Typography
                      key="activity"
                      variant="body2"
                      color="text.primary"
                      sx={{ fontWeight: 600 }}
                    >
                      {activeActivity?.title ?? "Atividade"}
                    </Typography>,
                  ]
                : [
                    <Typography
                      key="lesson"
                      variant="body2"
                      color="text.primary"
                      sx={{ fontWeight: 600 }}
                    >
                      {lesson.name}
                    </Typography>,
                  ]),
            ].filter(Boolean)}
          </Breadcrumbs>

<<<<<<< HEAD
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
              <Tooltip title="Voltar à disciplina">
                <IconButton
                  onClick={() => router.push(disciplineHref)}
                  aria-label="Voltar à disciplina"
                  size="small"
                  sx={{ flexShrink: 0 }}
                >
                  <ArrowBack fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {pageTitle}
              </Typography>
            </Stack>

            {nextModule ? (
              <Tooltip
                title={
                  effectiveRole === "Aluno" && !nextModule.unlocked
                    ? "Conclua as aulas e atividades deste módulo para liberar o próximo"
                    : nextModule.firstLessonId
                      ? `Ir para ${nextModule.name}`
                      : `Ver ${nextModule.name} na disciplina`
                }
              >
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={goToNextModule}
                    disabled={effectiveRole === "Aluno" && !nextModule.unlocked}
                    sx={{ borderRadius: 2, flexShrink: 0, alignSelf: { xs: "flex-start", sm: "center" } }}
                  >
                    Próximo módulo
                  </Button>
                </span>
              </Tooltip>
=======
                  {/* <Chip size="small" label={lessonMaterials.length} /> */}
                </Box>

                <Typography>A desenvolver materiais</Typography>
              </CardContent>
            </Card>
          )}

          {/* NAVIGATION */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            {prev ? (
              <Button
                onClick={() => goToLesson(prev.id)}
                startIcon={<ArrowBack />}
              >
                Anterior
              </Button>
>>>>>>> origin/develop
            ) : (
              <Tooltip title="Você está no último módulo desta disciplina.">
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled
                    startIcon={<CheckCircle />}
                    sx={{ borderRadius: 2, flexShrink: 0, alignSelf: { xs: "flex-start", sm: "center" } }}
                  >
                    Curso finalizado
                  </Button>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 280px" },
            gap: { xs: 1.5, md: 2 },
            alignItems: "start",
          }}
        >
          {/* Main content */}
          <Stack spacing={1.5}>
            {activityId ? (
            <>
              <Card sx={sectionCardSx}>
                <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: { xs: 1.5, md: 2 } } }}>
                  <SectionHeader
                    compact
                    icon={<QuizOutlined fontSize="small" />}
                    title="Responder atividade"
                      chip={
                        activeActivity?.hasApprovedAttempt ? (
                          <Chip size="small" color="success" label="Aprovado" />
                        ) : activeActivity ? (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${activeActivity.attemptsUsed}/${activeActivity.attemptLimit} tentativas`}
                          />
                        ) : undefined
                      }
                    />
                    <ActivityTakeForm
                      activityId={activityId}
                      onSuccess={async () => {
                        const [activityAttempts, moduleActivities] = await Promise.all([
                          listMyActivityAttempts(activityId),
                          listStudentActivities(lesson.moduleId),
                        ]);
                        setAttempts(activityAttempts);
                        setActivities(moduleActivities);
                        if (disciplineId) {
                          await refreshNextModule(lesson.moduleId, disciplineId);
                        }
                      }}
                    />
                  </CardContent>
                </Card>

<<<<<<< HEAD
                <Card sx={sectionCardSx}>
                  <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: { xs: 1.5, md: 2 } } }}>
                    <SectionHeader
                      compact
                      icon={<Replay fontSize="small" />}
                      title="Histórico de tentativas"
                    />
                    <AttemptHistoryList attempts={attempts} minimumScore={minimumScore} />
                  </CardContent>
                </Card>
              </>
          ) : (
            <>
              <Card sx={sectionCardSx}>
                <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: { xs: 1.5, md: 2 } } }}>
                  <SectionHeader
                    compact
                    icon={<AttachFileOutlined fontSize="small" />}
                    title="Material da aula"
                    chip={<Chip size="small" label={activeAttachments.length} />}
                  />
                  <AttachmentList
                    attachments={activeAttachments}
                    loading={attachmentsLoading}
                    error={attachmentsError}
                    compact
                  />
                  {(effectiveRole === "Professor" || effectiveRole === "Admin") && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <AttachmentForm
                        lessonId={lessonId}
                        attachments={attachments}
                        onChanged={loadAttachments}
                      />
                    </>
                  )}
=======
              <List dense>
                {siblings.map((l: any) => (
                  <ListItem key={l.id} disablePadding>
                    <ListItemButton
                      selected={l.id === lessonId}
                      onClick={() => goToLesson(l.id)}
                    >
                      <PlayCircle sx={{ mr: 1, fontSize: 18 }} />
                      <ListItemText primary={l.titulo} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
>>>>>>> origin/develop

                  {/* Ações: concluir + navegação na mesma barra */}
                  {(effectiveRole === "Aluno" || prev || next) && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        sx={{
                          alignItems: { xs: "stretch", sm: "center" },
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
<<<<<<< HEAD
                        {effectiveRole === "Aluno" ? (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleCompleteLesson}
                            disabled={completing || completed}
                            startIcon={completed ? <CheckCircle /> : undefined}
                            sx={{ borderRadius: 2, flexShrink: 0 }}
                          >
                            {completed ? "Aula concluída" : completing ? "Salvando..." : "Concluir aula"}
                          </Button>
                        ) : (
                          <Box />
=======
                        <Description sx={{ mr: 1, fontSize: 18 }} />
                        <ListItemText primary={a.titulo} />
                        {a.id === activityId && (
                          <Chip size="small" label="ativa" />
>>>>>>> origin/develop
                        )}

                        {(prev || next) && (
                          <Stack direction="row" spacing={1} sx={{ ml: { sm: "auto" } }}>
                            {prev && (
                              <Button
                                onClick={() => goToLesson(prev.id)}
                                startIcon={<ArrowBack />}
                                size="small"
                              >
                                Anterior
                              </Button>
                            )}
                            {next && (
                              <Button
                                onClick={() => goToLesson(next.id)}
                                endIcon={<ArrowForward />}
                                size="small"
                                variant="outlined"
                              >
                                Próxima
                              </Button>
                            )}
                          </Stack>
                        )}
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Stack>

        {/* Sidebar */}
        <Stack spacing={1.5} sx={{ position: { lg: "sticky" }, top: { lg: 16 } }}>
          <Card sx={sectionCardSx}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <SectionHeader
                compact
                icon={<PlayCircleOutlined fontSize="small" />}
                title="Aulas do módulo"
                chip={<Chip size="small" label={siblings.length} />}
              />
                <List dense disablePadding>
                  {siblings.map((l, index) => (
                    <ListItem key={l.id} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        selected={l.id === lessonId && !activityId}
                        onClick={() => goToLesson(l.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Typography variant="caption" color="text.secondary">
                            {String(index + 1).padStart(2, "0")}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: l.id === lessonId ? 600 : 400 }}
                            >
                              {l.name}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

          {effectiveRole === "Aluno" && activities.length > 0 && (
            <Card sx={sectionCardSx}>
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <SectionHeader
                  compact
                  icon={<MenuBookOutlined fontSize="small" />}
                  title="Atividades"
                  chip={<Chip size="small" label={activities.length} />}
                />
                  <List dense disablePadding>
                    {activities.map((activity) => {
                      const isActive = activity.id === activityId;
                      return (
                        <ListItem key={activity.id} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            selected={isActive}
                            onClick={() => openActivity(activity.id)}
                            sx={{ borderRadius: 2 }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Description fontSize="small" color={isActive ? "primary" : "action"} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: isActive ? 600 : 400 }}
                                >
                                  {activity.title}
                                </Typography>
                              }
                              secondary={
                                activity.hasApprovedAttempt
                                  ? "Aprovado"
                                  : `${activity.attemptsUsed}/${activity.attemptLimit} tentativas`
                              }
                              slotProps={{
                                secondary: { variant: "caption" },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            )}
        </Stack>
      </Box>
      </Stack>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

// Para materiais
// {lessonMaterials.length === 0 ? (
//                   <Box
//                     sx={{
//                       py: 4,
//                       textAlign: "center",
//                       color: "text.secondary",
//                     }}
//                   >
//                     Nenhum material disponível.
//                   </Box>
//                 ) : (
//                   <Stack spacing={1.5}>
//                     {/* {lessonMaterials.map((material: any) => (
//                       <Card
//                         key={material.id}
//                         variant="outlined"
//                         sx={{
//                           borderRadius: 3,
//                           transition: ".2s",

//                           "&:hover": {
//                             borderColor: "#2e507d",
//                             bgcolor: "#fafafa",
//                           },
//                         }}
//                       >
//                         <Button
//                           fullWidth
//                           href={material.url ?? "#"}
//                           target="_blank"
//                           sx={{
//                             p: 2,
//                             color: "inherit",

//                             display: "flex",
//                             justifyContent: "space-between",

//                             alignItems: "center",

//                             textTransform: "none",
//                           }}
//                         >
//                           <Box
//                             sx={{
//                               display: "flex",
//                               gap: 2,
//                               alignItems: "center",
//                             }}
//                           >
//                             <Box
//                               sx={{
//                                 width: 42,
//                                 height: 42,

//                                 borderRadius: 2,

//                                 bgcolor: "#e8f0f5",

//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                               }}
//                             >
//                               <DescriptionOutlined
//                                 sx={{
//                                   color: "#2e507d",
//                                 }}
//                               />
//                             </Box>

//                             <Box
//                               sx={{
//                                 textAlign: "left",
//                               }}
//                             >
//                               <Typography
//                                 sx={{
//                                   fontWeight: 600,
//                                 }}
//                               >
//                                 {material.title}
//                               </Typography>

//                               <Typography
//                                 variant="body2"
//                                 color="text.secondary"
//                               >
//                                 {material.description}
//                               </Typography>

//                               <Typography
//                                 variant="caption"
//                                 sx={{
//                                   color: "#2e507d",
//                                 }}
//                               >
//                                 {material.type}
//                               </Typography>
//                             </Box>
//                           </Box>

//                           <DownloadOutlined />
//                         </Button>
//                       </Card>
//                     ))} */}
//                     <Typography>Criando material</Typography>
//                   </Stack>
//                 )}
