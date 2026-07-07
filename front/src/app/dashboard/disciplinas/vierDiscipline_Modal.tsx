"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Stack,
  Divider,
  Tabs,
  Tab,
  Chip,
  Avatar,
  AccordionDetails,
  AccordionSummary,
  Accordion,
  LinearProgress,
} from "@mui/material";

import {
  MenuBook,
  School,
  Person,
  AccessTime,
  ViewModule,
  Quiz,
  Article,
  Groups,
  Close,
  ExpandMore,
} from "@mui/icons-material";

import { useUser } from "@/services/auth/AuthContext";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";

const database = DatabaseProvider.getDatabase();

interface Props {
  open: boolean;
  disciplineId?: number;
  onClose: () => void;
}

export default function DisciplineViewModal({
  open,
  disciplineId,
  onClose,
}: Props) {
  const { user, effectiveRole } = useUser();

  const provider = useMemo(() => {
    if (!user) return null;

    return DisciplineProvider.create(effectiveRole, database, user);
  }, [user, effectiveRole]);

  const [tab, setTab] = useState(0);

  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (!provider || !disciplineId || !open) return;

    setDetails(provider.getDetails(disciplineId));
  }, [provider, disciplineId, open]);

  if (!details) return null;

  const discipline = details.discipline;

  const totalLessons = details.modules.reduce(
    (total: number, m: any) => total + m.lessons.length,
    0,
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      {/* HEADER */}

      <DialogTitle
        sx={{
          p: 0,
          background: "linear-gradient(135deg, #1565c0, #42a5f5)",
          color: "white",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "rgba(255,255,255,.2)",
              }}
            >
              <MenuBook fontSize="large" />
            </Avatar>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                {discipline.nome}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  maxWidth: 600,
                  mt: 0.5,
                }}
              >
                {discipline.descricao}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip
                  icon={<Person />}
                  label={discipline.professorName ?? "Sem professor"}
                  sx={{
                    bgcolor: "rgba(255,255,255,.15)",
                    color: "white",
                  }}
                />

                <Chip
                  icon={<AccessTime />}
                  label={`${discipline.workload ?? 0}h`}
                  sx={{
                    bgcolor: "rgba(255,255,255,.15)",
                    color: "white",
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          <Button
            onClick={onClose}
            sx={{
              minWidth: 40,
              color: "white",
            }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      {/* RESUMO */}

      <DialogContent
        sx={{
          p: 3,
          bgcolor: "#fafafa",
        }}
      >
        <Box
          sx={{
            gap: 2,
            mb: 3,
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            display: "grid",
          }}
        >
          <SummaryCard
            icon={<School color="primary" />}
            title="Curso"
            value={discipline.courseName}
          />

          <SummaryCard
            icon={<ViewModule color="primary" />}
            title="Módulos"
            value={details.modules.length}
          />

          <SummaryCard
            icon={<Article color="primary" />}
            title="Aulas"
            value={totalLessons}
          />

          <SummaryCard
            icon={<Quiz color="primary" />}
            title="Quizzes"
            value={details.activities?.length ?? 0}
          />

          <SummaryCard
            icon={<Groups color="primary" />}
            title="Alunos"
            value={details.students.length}
          />

          {/* <SummaryCard
            icon={<AccessTime color="primary" />}
            title="Carga Horária"
            value={`${discipline.workload}h`}
          /> */}
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<ViewModule />} label="Módulos" />

            <Tab icon={<Article />} label="Materiais" />

            <Tab icon={<Quiz />} label="Quizzes" />

            <Tab icon={<Groups />} label="Alunos" />
          </Tabs>

          <Divider />

          <Box
            sx={{
              minHeight: 500,
              p: 3,
            }}
          >
            {tab === 0 && (
              <Stack spacing={2}>
                {details.modules?.map((module: any) => (
                  <Accordion
                    key={module.id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      "&:before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Stack>
                        <Typography sx={{ fontWeight: 700 }}>
                          {module.nome}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          <Chip
                            size="small"
                            label={`${module.lessons.length} aulas`}
                          />

                          <Chip
                            size="small"
                            color="primary"
                            label={`${module.progress}%`}
                          />
                        </Stack>
                      </Stack>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Stack spacing={1}>
                        {module.lessons.map((lesson: any) => (
                          <Box
                            key={lesson.id}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              p: 1,
                              borderRadius: 1,
                              bgcolor: "background.default",
                            }}
                          >
                            <Typography variant="body2">
                              {lesson.titulo}
                            </Typography>

                            {lesson.completed && (
                              <Chip
                                size="small"
                                color="success"
                                label="Concluída"
                              />
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}

            {tab === 1 && (
              <Stack spacing={2}>
                {details.materials?.map((m: any) => (
                  <Paper
                    key={m.id}
                    component="a"
                    href={m.url}
                    target="_blank"
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      textDecoration: "none",
                      color: "inherit",
                      borderRadius: 3,
                      "&:hover": {
                        background: "#f5f5f5",
                      },
                    }}
                  >
                    <Article />

                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {m.nome_arquivo}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {m.tipo} • {m.tamanho_bytes} bytes
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}

            {tab === 2 && (
              <Stack spacing={2}>
                {details.activities?.map((q: any) => (
                  <Paper key={q.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {q.titulo}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {q.descricao}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          label={`${q.questionCount} questões`}
                        />
                        <Chip
                          size="small"
                          label={`nota de aprovação: ${q.nota_aprovacao}`}
                        />
                        <Chip
                          size="small"
                          label={`tentativas: ${q.max_tentativas}`}
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {tab === 3 && (
              <Stack spacing={2}>
                {details.students?.map((s: any) => {
                  const percentage = s.percentage ?? 0;

                  let status = "Iniciando";
                  let color: "default" | "primary" | "success" | "warning" =
                    "default";

                  if (percentage >= 90) {
                    status = "Concluído";
                    color = "success";
                  } else if (percentage >= 50) {
                    status = "Em andamento";
                    color = "primary";
                  } else if (percentage > 0) {
                    status = "Pouco progresso";
                    color = "warning";
                  }

                  return (
                    <Paper
                      key={s.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        transition: "0.2s",
                        "&:hover": {
                          boxShadow: 4,
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        {/* Cabeçalho */}
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Stack
                            direction="row"
                            sx={{ spacing: 2, alignItems: "center" }}
                          >
                            <Avatar>{s.name?.charAt(0)}</Avatar>

                            <Box>
                              <Typography sx={{ fontWeight: 700 }}>
                                {s.name}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {s.completedLessons ?? 0}/{s.totalLessons ?? 0}{" "}
                                aulas concluídas
                              </Typography>
                            </Box>
                          </Stack>

                          <Chip label={status} color={color} size="small" />
                        </Stack>

                        {/* Progresso */}
                        <Box>
                          <Stack
                            direction="row"
                            sx={{ justifyContent: "space-between", mb: 1 }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Progresso
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              {percentage}%
                            </Typography>
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                            }}
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button variant="contained" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface SummaryProps {
  icon: React.ReactNode;
  title: string;
  value: any;
}

function SummaryCard({ icon, title, value }: SummaryProps) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: 4,
        },
      }}
    >
      <Avatar
        sx={{
          width: 48,
          height: 48,
          bgcolor: "primary.light",
        }}
      >
        {icon}
      </Avatar>

      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>

        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{value}</Typography>
      </Box>
    </Paper>
  );
}
