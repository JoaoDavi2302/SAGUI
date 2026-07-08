"use client";

<<<<<<< HEAD
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Circle,
  ExpandMore,
  LayersOutlined,
  Lock,
} from "@mui/icons-material";

import { useUser } from "@/new-services/auth/AuthContext";
import { getDiscipline } from "@/new-services/poo/shared/api/disciplines";
import { listModules } from "@/new-services/poo/shared/api/modules";
import { listLessons } from "@/new-services/poo/shared/api/lessons";
import { getDisciplineProgress } from "@/new-services/poo/shared/api/progress";
import type { LessonDTO } from "@/new-services/poo/shared/api/lessons";
import type { ModuleProgressResponse } from "@/new-services/poo/shared/api/progress";
import { StudentProgressBar } from "@/components/student/StudentProgressBar";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";

import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";
import ProfessorDisciplineDetailsPage from "./professorDisciplineDetailsPage";
import AdminDisciplineDetailsPage from "./adminDisciplineDetailsPage";

const database = DatabaseProvider.getDatabase();

interface ModuleWithLessons extends ModuleProgressResponse {
  lessons: LessonDTO[];
}

function StudentDisciplineDetailsContent({ disciplineId }: { disciplineId: string }) {
  const [disciplineName, setDisciplineName] = useState("");
  const [disciplineDescription, setDisciplineDescription] = useState("");
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [discipline, progress, modulesPage] = await Promise.all([
          getDiscipline(disciplineId),
          getDisciplineProgress(disciplineId),
          listModules(disciplineId, "Active", 0, 100),
        ]);

        setDisciplineName(discipline.name);
        setDisciplineDescription(discipline.description);
        setOverallPercentage(progress.overallPercentage ?? 0);

        const progressByModule = new Map(
          progress.modules.map((module) => [module.moduleId, module]),
        );

        const modulesWithLessons = await Promise.all(
          modulesPage.content.map(async (module) => {
            const moduleProgress = progressByModule.get(module.id);
            const unlocked = moduleProgress?.unlocked ?? false;

            const lessons = unlocked
              ? await listLessons(module.id, "Active")
              : [];

            return {
              moduleId: module.id,
              moduleName: module.name,
              orderIndex: module.orderIndex,
              progressPercentage: moduleProgress?.progressPercentage ?? 0,
              completed: moduleProgress?.completed ?? false,
              unlocked,
              lessons: lessons.sort((a, b) => a.orderIndex - b.orderIndex),
            };
          }),
        );

        setModules(
          modulesWithLessons.sort((a, b) => a.orderIndex - b.orderIndex),
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [disciplineId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#e3f2fd" }}>
              <LayersOutlined color="primary" />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>{disciplineName}</Typography>
              <Typography color="text.secondary">{disciplineDescription}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <StudentProgressBar
              value={overallPercentage}
              label="Progresso geral"
            />
          </Box>
        </CardContent>
      </Card>

      <Typography sx={{ fontWeight: 700, mb: 2 }}>Conteúdo</Typography>

      {modules.map((module) => (
        <Accordion
          key={module.moduleId}
          disabled={!module.unlocked}
          sx={{ mb: 1, "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={module.unlocked ? <ExpandMore /> : <Lock />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{module.moduleName}</Typography>
              {!module.unlocked && (
                <Typography variant="caption" color="text.secondary">
                  — Conclua as aulas e atividades do módulo anterior
                </Typography>
              )}
              {module.completed && (
                <CheckCircle color="success" fontSize="small" />
              )}
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            {module.lessons.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhuma aula disponível neste módulo.
              </Typography>
            ) : (
              module.lessons.map((lesson) => (
                <Box
                  key={lesson.id}
                  component={Link}
                  href={`/aulas/${lesson.id}`}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    p: 1,
                    borderRadius: 1,
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Circle color="disabled" fontSize="small" />
                  <Typography>{lesson.name}</Typography>
                </Box>
              ))
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function DisciplinePageContent() {
  const searchParams = useSearchParams();
  const disciplineId = searchParams.get("id") ?? "";
  const { user, effectiveRole } = useUser();

  const provider = useMemo(() => {
    if (!user || effectiveRole === "Aluno") return null;
    return DisciplineProvider.create(effectiveRole, database, user);
  }, [user, effectiveRole]);

  const data = useMemo(() => {
    if (!provider || !disciplineId || effectiveRole === "Aluno") return null;
    const numericId = Number(disciplineId);
    if (!Number.isFinite(numericId)) return null;
    return provider.getDetails(numericId);
  }, [provider, disciplineId, effectiveRole]);

  if (effectiveRole === "Aluno") {
    if (!disciplineId) {
      return (
        <Alert severity="warning" sx={{ m: 3 }}>
          Disciplina não informada.
        </Alert>
      );
    }
    return <StudentDisciplineDetailsContent disciplineId={disciplineId} />;
  }

  if (!data || !provider) return null;

  if (effectiveRole === "Professor") {
    return <ProfessorDisciplineDetailsPage data={data} user={user} />;
  }

  return <AdminDisciplineDetailsPage data={data} user={user} />;
}

export default function DisciplinePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <DisciplinePageContent />
    </Suspense>
=======
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  LayersOutlined,
  PlayCircle,
  CheckCircle,
  Circle,
  ExpandMore,
} from "@mui/icons-material";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useUser } from "@/services/auth/AuthContext";

import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";
import { DatabaseProvider } from "@/services/poo/databaseProvider";

const database = DatabaseProvider.getDatabase();
const Stat = ({ icon: Icon, label, value }: any) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: "rgba(0,0,0,0.03)",
      display: "flex",
      flexDirection: "column",
      gap: 0.5,
    }}
  >
    <Icon sx={{ fontSize: 18, color: "#1976d2" }} />
    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{value}</Typography>
    <Typography
      sx={{ fontSize: 10, color: "gray", textTransform: "uppercase" }}
    >
      {label}
    </Typography>
  </Box>
);

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function DisciplineDetailsPage() {
  const searchParams = useSearchParams();
  const disciplineId = Number(searchParams.get("id"));

  const router = useRouter();
  const { user, effectiveRole } = useUser();
  const isStudent = effectiveRole === "ALUNO";

  const [tabIndex, setTabIndex] = useState(0);

  const provider = useMemo(() => {
    if (!user) return null;
    return DisciplineProvider.create(effectiveRole, database, user);
  }, [user, effectiveRole]);

  // POO PRINCIPAL (substitui tudo manual)
  const data = useMemo(() => {
    if (!provider || !disciplineId) return null;

    return provider.getDetails(disciplineId);
  }, [provider, disciplineId]);

  const discipline = data?.discipline;
  const modules = data?.modules ?? [];
  const students = data?.students ?? [];

  const handleOpenLesson = (lessonId: string) => {
    router.push(`/aulas/${lessonId}`);
  };

  const openDiscipline = (subject: any) => {
    const slug = slugify(subject.nome);
    router.push(`/disciplinas/${slug}?id=${subject.id}`);
  };

  const openModule = (moduleId: number) => {
    const firstLesson = modules
      .flatMap((m) => m.lessons ?? [])
      .find((l) => l.modulo_id === moduleId);

    if (!firstLesson) return;
    router.push(`/aulas/${firstLesson.id}`);
  };

  if (!discipline || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Disciplina não encontrada</Typography>
      </Box>
    );
  }

  const currentStudent = students.find((s: any) => s.id === user?.id);

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 2 }}>
              <LayersOutlined sx={{ color: "#1976d2" }} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                {discipline.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {discipline.descricao}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* PROGRESSO (POO) */}
          {isStudent && currentStudent && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption">Progresso geral</Typography>
                <Typography variant="caption">
                  {currentStudent.percentage}%
                </Typography>
              </Box>

              <LinearProgress
                value={currentStudent.percentage}
                variant="determinate"
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* STATS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat icon={LayersOutlined} label="Módulos" value={modules.length} />
        </Grid>
        {/* <Grid size={{ xs: 6, md: 3 }}>
          <Stat icon={PlayCircle} label="Aulas" value={data.lessons.length} />
        </Grid> */}
      </Grid>

      {/* TABS */}
      {!isStudent && (
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Detalhes" />
          <Tab label="Alunos" />
        </Tabs>
      )}

      {/* DETALHES */}
      {(isStudent || tabIndex === 0) && (
        <Box>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>
            Conteúdo programático
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {modules.map((m: any) => (
              <Accordion
                key={m.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "none",
                  border: "1px solid #eee",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ width: "100%" }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{m.nome}</Typography>

                      {/* {isStudent && (
                        <Chip size="small" label={`${m.progress}%`} />
                      )} */}
                    </Box>

                    {isStudent && (
                      <LinearProgress
                        value={m.progress}
                        variant="determinate"
                        sx={{ mt: 1, height: 6, borderRadius: 5 }}
                      />
                    )}

                    {!isStudent && (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {m.descricao}
                      </Typography>
                    )}
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  {(m.lessons ?? []).map((l: any) => {
                    const done = l.completed;

                    return (
                      <Box
                        key={l.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1,
                          borderRadius: 2,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#f5f5f5" },
                        }}
                        onClick={() => handleOpenLesson(l.id)}
                      >
                        {isStudent ? (
                          done ? (
                            <CheckCircle
                              sx={{ fontSize: 18, color: "green" }}
                            />
                          ) : (
                            <Circle sx={{ fontSize: 18, color: "gray" }} />
                          )
                        ) : (
                          <PlayCircle sx={{ fontSize: 18, color: "#1976d2" }} />
                        )}

                        <Typography sx={{ fontSize: 14 }}>{l.titulo}</Typography>
                      </Box>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      )}

      {/* ALUNOS */}
      {!isStudent && tabIndex === 1 && (
        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>
              Progresso dos alunos
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell>Aulas</TableCell>
                  <TableCell>Média</TableCell>
                  <TableCell>Progresso</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    {/* <TableCell>
                      {s.completedLessons}/{data.lessons.length}
                    </TableCell> */}
                    <TableCell>{s.avg}</TableCell>
                    <TableCell>
                      <LinearProgress
                        value={s.percentage}
                        variant="determinate"
                        sx={{ height: 6, borderRadius: 5 }}
                      />
                      <Typography variant="caption">{s.percentage}%</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
>>>>>>> origin/develop
  );
}
