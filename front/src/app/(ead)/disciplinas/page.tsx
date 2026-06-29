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
  IconButton,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormGroup,
  Checkbox,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { useUser } from "@/services/auth/AuthContext";
import database from "@/components/mock.json";
import { AccessTimeOutlined, CheckCircle, Circle, LayersOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";

// para passar id na url
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function DisciplinasPage() {
  const { user, effectiveRole } = useUser();
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
    if (!user) return { grouped: [], modules: [], moduleProgress: [] };

    const courses = database.courses ?? [];
    const disciplines = database.disciplines ?? [];
    const modules = database.modules ?? [];
    const moduleProgress = database.module_progress ?? [];
    const lessons = database.lessons ?? [];

    // ALUNO
    if (effectiveRole === "ALUNO") {
      const enrollment = database.enrollments.find(
        (e: any) => e.student_id === user.id
      );

      if (!enrollment) {
        return { grouped: [], modules, moduleProgress };
      }

      const course = courses.find(
        (c: any) => c.id === enrollment.course_id
      );

      const subjects = disciplines.filter(
        (d: any) => d.course_id === enrollment.course_id
      );

      return {
        grouped: [
          {
            course: course ?? null,
            subjects,
          },
        ],
        modules,
        moduleProgress,
        lessons,
      };
    }

    // PROFESSOR
    const professorDisciplines = disciplines.filter(
      (d: any) => d.professor_id === user.id
    );

    const map = new Map<string, any>();

    professorDisciplines.forEach((d: any) => {
      const course = courses.find((c: any) => c.id === d.course_id);

      if (!map.has(d.course_id)) {
        map.set(d.course_id, {
          course: course ?? null,
          subjects: [],
        });
      }

      map.get(d.course_id).subjects.push(d);
    });

    return {
      grouped: Array.from(map.values()),
      modules,
      moduleProgress,
      lessons,
    };
  }, [user, effectiveRole]);

  // handle 
  const openDiscipline = (subject: any) => {
    const slug = slugify(subject.name);
    router.push(`/disciplinas/${slug}?id=${subject.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
        Minhas Disciplinas
      </Typography>

      <Typography sx={{ fontSize: 14, color: "gray", mb: 3 }}>
        {isStudent
          ? "Disciplinas do seu curso"
          : "Disciplinas que você leciona"}
      </Typography>

      {data.grouped.map((group: any) => (
        <Box key={group.course?.id ?? Math.random()} sx={{ mb: 4, }}>
          {!isStudent && group.course && (
            <>
              <Typography sx={{ fontSize: 16, color: "gray" }}>
                {group.course.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <Grid container spacing={2}>
            {group.subjects.map((subject: any) => {
              const disciplineModules =
                data.modules?.filter(
                  (m: any) => m.discipline_id === subject.id
                ) ?? [];

              const moduleProgress = data.moduleProgress ?? [];

              const completedModules = moduleProgress.filter(
                (p: any) =>
                  p.status === "COMPLETED" &&
                  disciplineModules.some((m: any) => m.id === p.module_id)
              ).length;

              const progressPercent =
                disciplineModules.length > 0
                  ? Math.round(
                    (completedModules / disciplineModules.length) * 100
                  )
                  : 0;

              const safeProgress = Math.min(
                100,
                Math.max(0, progressPercent)
              );

              const isOpen = openMap[subject.id] || false;

              return (
                <Grid size={{ xs: 12, md: 12 }} key={subject.id}>
                  <Card sx={{ borderRadius: 3 }} >
                    <CardContent>
                      {/* HEADER */}
                      <Box sx={{ cursor: "pointer" }} onClick={() => openDiscipline(subject)}>
                        <Box
                          sx={{
                            flex: 1,
                            gap: 2,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ p: 2, bgcolor: "#add3f8", borderRadius: 2 }}>
                            <LayersOutlined fontSize="small" sx={{ color: "#1976d2" }} />
                          </Box>
                          <Box sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}>
                            <Typography sx={{ fontWeight: "bold" }}>
                              {subject.name}
                            </Typography>

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

                      {/* PROGRESSO (ALUNO) */}
                      {isStudent && (
                        <Box sx={{ mt: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
                            sx={{
                              mt: 0.5,
                              height: 6,
                              borderRadius: 5,
                            }}
                          />



                        </Box>
                      )}
                      <Divider sx={{ my: 2 }} />
                      <Box component="button" sx={{
                        border: "none", display: "flex", flex: 1, cursor: "pointer", "&:hover": {
                          fontWeight: 800
                        },
                      }} onClick={() => toggle(subject.id)}>
                        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                          Ver módulos ({disciplineModules.length})
                        </Typography>
                        {isOpen ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </Box>

                      {/* MODULOS */}
                      <Collapse in={isOpen}>
                        <Box sx={{ mt: 2 }}>
                          <FormGroup>
                            {disciplineModules.map((m: any) => {
                              const progress = data.moduleProgress.find(
                                (p: any) => p.module_id === m.id
                              );

                              const isCompleted = progress?.status === "COMPLETED";
                              const lessonsCount = (data.lessons ?? []).filter(
                                (l: any) => l.module_id === m.id
                              ).length;
                              return (
                                <Box
                                  key={m.id}
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

                                  <Typography variant="body2">
                                    {m.name}
                                  </Typography>

                                  <Typography variant="caption" sx={{ color: "gray", ml:"auto" }}>
                                    ({lessonsCount} aulas)
                                  </Typography>
                                </Box>
                              );
                            })}
                          </FormGroup>
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