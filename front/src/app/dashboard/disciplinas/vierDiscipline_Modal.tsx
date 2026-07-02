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
} from "@mui/icons-material";

import { useUser } from "@/services/auth/AuthContext";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";

const database = DatabaseProvider.getDatabase();

interface Props {
  open: boolean;
  disciplineId?: string;
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
          background: "linear-gradient(135deg,#1976d2,#42a5f5)",
          color: "white",
          py: 3,
        }}
      >
        <Stack
          sx={{
            direction: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={2}>
            <Avatar
              sx={{
                width: 62,
                height: 62,
                bgcolor: "rgba(255,255,255,.18)",
              }}
            >
              <MenuBook />
            </Avatar>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {discipline.name}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {discipline.description}
              </Typography>

              <Stack spacing={1} sx={{ mt: 1, direction: "row" }}>
                <Chip
                  color="default"
                  size="small"
                  label={discipline.professorName ?? "Sem professor"}
                />

                <Chip
                  color="default"
                  size="small"
                  label={`${discipline.workload} horas`}
                />
              </Stack>
            </Box>
          </Stack>

          <Button color="inherit" startIcon={<Close />} onClick={onClose}>
            Fechar
          </Button>
        </Stack>
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
            value={details.quizzes?.length ?? 0}
          />

          <SummaryCard
            icon={<Groups color="primary" />}
            title="Alunos"
            value={details.students.length}
          />

          <SummaryCard
            icon={<AccessTime color="primary" />}
            title="Carga Horária"
            value={`${discipline.workload}h`}
          />
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
            <Tab label="Módulos" />

            <Tab label="Materiais" />

            <Tab label="Quizzes" />

            <Tab label="Alunos" />
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
                  <Paper key={module.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {module.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>

                      <Stack direction="row" spacing={2}>
                        <Chip
                          size="small"
                          label={`${module.lessons.length} aulas`}
                        />

                        <Chip
                          size="small"
                          label={`${module.progress}% progresso`}
                          color="primary"
                        />
                      </Stack>

                      <Box sx={{ pl: 2, mt: 1 }}>
                        {module.lessons.map((lesson: any) => (
                          <Typography
                            key={lesson.id}
                            variant="body2"
                            sx={{
                              opacity: lesson.completed ? 1 : 0.5,
                            }}
                          >
                            • {lesson.name}
                            {lesson.completed ? " ✓" : ""}
                          </Typography>
                        ))}
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {tab === 1 && (
              <Stack spacing={2}>
                {details.materials?.map((m: any) => (
                  <Paper key={m.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {m.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {m.description}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={m.type} />
                        <Chip size="small" label={m.moduleName} />
                        <Chip size="small" label={m.status} />
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {tab === 2 && (
              <Stack spacing={2}>
                {details.quizzes?.map((q: any) => (
                  <Paper key={q.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {q.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {q.description}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          label={`${q.questionCount} questões`}
                        />
                        <Chip size="small" label={`mín: ${q.passing_score}%`} />
                        <Chip
                          size="small"
                          label={`tentativas: ${q.max_attempts}`}
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {tab === 3 && (
              <Stack spacing={2}>
                {details.students?.map((s: any) => (
                  <Paper key={s.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Stack
                      sx={{
                        direction: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Stack>
                        <Typography sx={{ fontWeight: "bold" }}>
                          {s.name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {s.completedLessons}/{s.totalLessons} aulas
                        </Typography>
                      </Stack>

                      <Chip label={`${s.percentage}%`} color="primary" />
                    </Stack>
                  </Paper>
                ))}
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
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 3,
      }}
    >
      <Stack spacing={1}>
        {icon}

        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}
