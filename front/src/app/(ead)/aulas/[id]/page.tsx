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
import { getModule } from "@/new-services/poo/shared/api/modules";
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
  const { effectiveRole } = useUser();

  const lessonId = String(params.id);
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
      const moduleList = (await listModules(currentDisciplineId, "Active")).filter(
        (module) => module.status === "Active",
      );
      const sortedModules = [...moduleList].sort((a, b) => a.orderIndex - b.orderIndex);
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

  const goToLesson = (id: string) => {
    router.push(`/aulas/${id}`);
  };

  const openActivity = (id: string) => {
    router.push(`/aulas/${lessonId}?atividade=${id}`);
  };

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
