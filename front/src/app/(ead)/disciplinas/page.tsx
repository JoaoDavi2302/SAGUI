"use client";

import { useMemo, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Collapse,
  Divider,
  FormGroup,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";

import {
  AccessTimeOutlined,
  CheckCircle,
  Circle,
  LayersOutlined,
} from "@mui/icons-material";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useRouter } from "next/navigation";

import { useUser } from "@/services/auth/AuthContext";
import { DatabaseProvider } from "@/services/poo/databaseProvider";

import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";
import { DisciplineCard } from "@/services/poo/shared/types";

const database = DatabaseProvider.getDatabase();
// para passar o nome na url
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function DisciplinasPage() {
  const router = useRouter();

  const { user, effectiveRole } = useUser();

  const isStudent = effectiveRole === "ALUNO";

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (id: number) => {
    setOpenMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const provider = useMemo(() => {
    if (!user) return null;

    return DisciplineProvider.create(effectiveRole, database, user);
  }, [effectiveRole, user]);

  const data = useMemo(() => {
    if (!provider) {
      return {
        grouped: [],
        modules: [],
        lessons: [],
        moduleProgress: [],
      };
    }

    return provider.getPageData();
  }, [provider]);

  const openDiscipline = (discipline: DisciplineCard) => {
    const slug = slugify(discipline.nome);

    router.push(`/disciplinas/${slug}?id=${discipline.id}`);
  };

  const openModule = (moduleId: number) => {
    const firstLesson = data.lessons
      .filter((lesson) => lesson.modulo_id === moduleId)
      .sort((a, b) => a.ordem - b.ordem)[0];

    if (!firstLesson) return;

    router.push(`/aulas/${firstLesson.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        {isStudent ? "Minhas Disciplinas" : "Disciplinas"}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          color: "gray",
          mb: 3,
        }}
      >
        {isStudent ? "Disciplinas do seu curso" : "Disciplinas disponíveis"}
      </Typography>

      {data.grouped.map((group) => (
        <Box key={group.course?.id} sx={{ mb: 4 }}>
          {!isStudent && group.course && (
            <>
              <Typography
                sx={{
                  fontSize: 16,
                  color: "gray",
                }}
              >
                {group.course.nome}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography>
                {group.course.descricao}
              </Typography>
            </>
          )}

          <Grid container spacing={2}>
            {group.subjects.map((subject) => {
              const isOpen = openMap[subject.id] ?? false;

              const progress = subject.progress;

              return (
                <Grid
                  key={subject.id}
                  size={{
                    xs: 12,
                    md: 12,
                  }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      {/* HEADER */}

                      <Box
                        sx={{
                          cursor: "pointer",
                        }}
                        onClick={() => openDiscipline(subject)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "#add3f8",
                              borderRadius: 2,
                            }}
                          >
                            <LayersOutlined
                              fontSize="small"
                              sx={{
                                color: "#1976d2",
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: "bold",
                              }}
                            >
                              {subject.nome}
                            </Typography>

                            {/* <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              <AccessTimeOutlined fontSize="small" />

                              <Typography variant="caption">
                                {subject.workload}h
                              </Typography>
                            </Box> */}
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
                          {subject.descricao}
                        </Typography>
                      </Box>

                      {/* continua na Parte 2 */}

                      {/* PROGRESSO */}

                      {isStudent && (
                        <Box sx={{ mt: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Progresso
                            </Typography>

                            <Typography variant="caption">
                              {progress.percentage}%
                            </Typography>
                          </Box>

                          <LinearProgress
                            variant="determinate"
                            value={progress.percentage}
                            sx={{
                              mt: 0.5,
                              height: 6,
                              borderRadius: 5,
                            }}
                          />
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />

                      {/* BOTÃO */}

                      <Box
                        component="button"
                        onClick={() => toggle(subject.id)}
                        sx={{
                          border: "none",
                          background: "transparent",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          p: 0,
                          "&:hover": {
                            fontWeight: 700,
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: "bold",
                          }}
                        >
                          Ver módulos ({subject.modules.length})
                        </Typography>

                        {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Box>

                      {/* MÓDULOS */}

                      <Collapse in={isOpen}>
                        <Box sx={{ mt: 2 }}>
                          <FormGroup>
                            {subject.modules.map((module) => {
                              const completed =
                                isStudent &&
                                subject.progress.completedModules > 0
                                  ? data.moduleProgress.some(
                                      (p) =>
                                        p.aluno_id === user?.id &&
                                        p.modulo_id === module.id &&
                                        p.concluido === true,
                                    )
                                  : false;

                              const lessonsCount = data.lessons.filter(
                                (lesson) => lesson.modulo_id === module.id,
                              ).length;

                              return (
                                <Box
                                  key={module.id}
                                  onClick={() => openModule(module.id)}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    p: 1,
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    "&:hover": {
                                      bgcolor: "#f5f5f5",
                                    },
                                  }}
                                >
                                  {completed ? (
                                    <CheckCircle
                                      sx={{
                                        fontSize: 18,
                                        color: "green",
                                      }}
                                    />
                                  ) : (
                                    <Circle
                                      sx={{
                                        fontSize: 18,
                                        color: "gray",
                                      }}
                                    />
                                  )}

                                  <Typography variant="body2">
                                    {module.nome}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    sx={{
                                      ml: "auto",
                                      color: "gray",
                                    }}
                                  >
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
