"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  LinearProgress,
  Collapse,
  CircularProgress,
  Alert,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { useUser } from "@/services/auth/AuthContext";
import { useCatalogDatabase } from "@/services/auth/dataContext";
import {
  AccessTimeOutlined,
  CheckCircle,
  Circle,
  LayersOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Discipline } from "@/services/types/database";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

function groupDisciplinesByCourse(
  courses: { id: string; name: string }[],
  disciplines: Discipline[],
) {
  const map = new Map<string, { course: { id: string; name: string } | null; subjects: Discipline[] }>();

  disciplines.forEach((discipline) => {
    const course = courses.find((item) => item.id === discipline.course_id) ?? null;

    if (!map.has(discipline.course_id)) {
      map.set(discipline.course_id, { course, subjects: [] });
    }

    map.get(discipline.course_id)?.subjects.push(discipline);
  });

  return Array.from(map.values());
}

export default function DisciplinasPage() {
  const { user, effectiveRole } = useUser();
  const { database, loading, error } = useCatalogDatabase();
  const router = useRouter();

  const isStudent = effectiveRole === "ALUNO";

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setOpenMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const data = useMemo(() => {
    if (!user) return { grouped: [], modules: [], moduleProgress: [], lessons: [] };

    const courses = database.courses ?? [];
    const disciplines = database.disciplines ?? [];
    const modules = database.modules ?? [];
    const lessons = database.lessons ?? [];

    let visibleDisciplines = disciplines;

    if (effectiveRole === "PROFESSOR") {
      visibleDisciplines = disciplines.filter(
        (discipline) => discipline.professor_id === user.id,
      );
    }

    return {
      grouped: groupDisciplinesByCourse(courses, visibleDisciplines),
      modules,
      moduleProgress: database.module_progress ?? [],
      lessons,
    };
  }, [user, effectiveRole, database]);

  const openDiscipline = (subject: Discipline) => {
    const slug = slugify(subject.name);
    router.push(`/disciplinas/${slug}?id=${subject.id}`);
  };

  const openModule = (_subject: Discipline, moduleId: string) => {
    const firstLesson = (data.lessons ?? [])
      .filter((lesson) => lesson.module_id === moduleId)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))[0];

    if (!firstLesson) return;

    router.push(`/aulas/${firstLesson.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Minhas Disciplinas
        </Typography>
        <Typography sx={{ fontSize: 14, color: "gray" }}>
          {isStudent
            ? "Disciplinas dos cursos em que você está matriculado"
            : "Disciplinas que você leciona"}
        </Typography>
      </Box>

      {data.grouped.length === 0 && (
        <Alert severity="info">Nenhuma disciplina encontrada.</Alert>
      )}

      {data.grouped.map((group) => (
        <Box key={group.course?.id ?? Math.random()} sx={{ mb: 4 }}>
          {!isStudent && group.course && (
            <>
              <Typography sx={{ fontSize: 16, color: "gray" }}>
                {group.course.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <Grid container spacing={2}>
            {group.subjects.map((subject) => {
              const disciplineModules =
                data.modules?.filter(
                  (module) => module.discipline_id === subject.id,
                ) ?? [];

              const completedModules = (data.moduleProgress ?? []).filter(
                (progress) =>
                  progress.status === "COMPLETED" &&
                  disciplineModules.some((module) => module.id === progress.module_id),
              ).length;

              const progressPercent =
                disciplineModules.length > 0
                  ? Math.round((completedModules / disciplineModules.length) * 100)
                  : 0;

              const safeProgress = Math.min(100, Math.max(0, progressPercent));
              const isOpen = openMap[subject.id] || false;

              return (
                <Grid size={{ xs: 12, md: 12 }} key={subject.id}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box
                        sx={{ cursor: "pointer" }}
                        onClick={() => openDiscipline(subject)}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            gap: 2,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{ p: 2, bgcolor: "#add3f8", borderRadius: 2 }}
                          >
                            <LayersOutlined
                              fontSize="small"
                              sx={{ color: "#1976d2" }}
                            />
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography sx={{ fontWeight: "bold" }}>
                              {subject.name}
                            </Typography>

                            {subject.workload > 0 && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <AccessTimeOutlined fontSize="small" />
                                <Typography variant="caption">
                                  {subject.workload}h
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1,
                            color: "text.secondary",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {subject.description}
                        </Typography>
                      </Box>

                      {isStudent && disciplineModules.length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Progresso
                            </Typography>
                            <Typography variant="caption">
                              {safeProgress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={safeProgress}
                            sx={{ mt: 0.5, height: 6, borderRadius: 5 }}
                          />
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />
                      <Box
                        component="button"
                        sx={{
                          border: "none",
                          display: "flex",
                          flex: 1,
                          cursor: "pointer",
                          bgcolor: "transparent",
                          "&:hover": { fontWeight: 800 },
                        }}
                        onClick={() => toggle(subject.id)}
                      >
                        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                          Ver módulos ({disciplineModules.length})
                        </Typography>
                        {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Box>

                      <Collapse in={isOpen}>
                        <Box sx={{ mt: 2 }}>
                          {disciplineModules.map((module) => {
                            const progress = data.moduleProgress.find(
                              (item) => item.module_id === module.id,
                            );
                            const isCompleted = progress?.status === "COMPLETED";
                            const lessonsCount = (data.lessons ?? []).filter(
                              (lesson) => lesson.module_id === module.id,
                            ).length;

                            return (
                              <Box
                                key={module.id}
                                onClick={() => openModule(subject, module.id)}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  p: 1,
                                  borderRadius: 2,
                                  cursor: "pointer",
                                  "&:hover": { bgcolor: "#f5f5f5" },
                                }}
                              >
                                {isCompleted ? (
                                  <CheckCircle sx={{ fontSize: 18, color: "green" }} />
                                ) : (
                                  <Circle sx={{ fontSize: 18, color: "gray" }} />
                                )}
                                <Typography variant="body2">{module.name}</Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "gray", ml: "auto" }}
                                >
                                  ({lessonsCount} aulas)
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
