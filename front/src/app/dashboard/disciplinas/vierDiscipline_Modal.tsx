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
<<<<<<< HEAD
  AccordionDetails,
  AccordionSummary,
  Accordion,
  LinearProgress,
=======
>>>>>>> origin/develop
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
<<<<<<< HEAD
  ExpandMore,
} from "@mui/icons-material";

import {
  getDiscipline,
  listCourses,
  listProfessors,
  listModules,
} from "@/new-services/poo/shared/api/catalog";

import { listEnrollmentsByDiscipline } from "@/new-services/poo/shared/api/enrollment";

import type {
  CourseDTO,
  DisciplineDTO,
  ModuleDTO,
  UserProfileDTO,
} from "@/new-services/poo/shared/api/catalog";

import {
  listAttachments,
  type AttachmentDTO,
} from "@/new-services/poo/shared/api/attachments";

import {
  listLessons,
  type LessonDTO,
} from "@/new-services/poo/shared/api/lessons";

import {
  listActivities,
  type ActivityDTO,
} from "@/new-services/poo/shared/api/activities";

import type { EnrollmentDetailDTO } from "@/new-services/poo/shared/api/enrollment";

import { useUser } from "@/new-services/auth/AuthContext";

interface Props {
  open: boolean;
  disciplineId?: string;
=======
} from "@mui/icons-material";

import { useUser } from "@/services/auth/AuthContext";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";

const database = DatabaseProvider.getDatabase();

interface Props {
  open: boolean;
  disciplineId?: number;
>>>>>>> origin/develop
  onClose: () => void;
}

export default function DisciplineViewModal({
  open,
  disciplineId,
  onClose,
}: Props) {
  const { user, effectiveRole } = useUser();
<<<<<<< HEAD
  const [discipline, setDiscipline] = useState<DisciplineDTO | null>(null);
  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [professor, setProfessor] = useState<UserProfileDTO | null>(null);
  const [tab, setTab] = useState(0);

  // ok
  const [modules, setModules] = useState<
    (ModuleDTO & {
      lessons: (LessonDTO & {
        attachments: AttachmentDTO[];
      })[];
      activities: ActivityDTO[];
    })[]
  >([]);

  const [students, setStudents] = useState<EnrollmentDetailDTO[]>([]);

  const totalLessons = modules.reduce(
=======

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
>>>>>>> origin/develop
    (total: number, m: any) => total + m.lessons.length,
    0,
  );

<<<<<<< HEAD
  const totalActivities = modules.reduce(
    (total, module) => total + module.activities.length,
    0,
  );

  const materials = modules.flatMap((module) =>
    module.lessons.flatMap((lesson) => lesson.attachments),
  );

  useEffect(() => {
    if (!open || !disciplineId) return;

    async function load() {
      try {
        if (!disciplineId) return;

        const disciplineData = await getDiscipline(disciplineId);

        const [coursesData, professorsData, modulesData, enrollmentsData] =
          await Promise.all([
            listCourses(),
            listProfessors(),
            listModules(disciplineData.id),
            listEnrollmentsByDiscipline(disciplineData.id),
          ]);

        const modulesComplete = await Promise.all(
          modulesData.map(async (module) => {
            const lessons = await listLessons(module.id);

            const lessonsComplete = await Promise.all(
              lessons.map(async (lesson) => ({
                ...lesson,
                attachments: await listAttachments(lesson.id),
              })),
            );

            const activities = await listActivities(module.id);

            return {
              ...module,
              lessons: lessonsComplete,
              activities,
            };
          }),
        );

        setDiscipline(disciplineData);

        setCourse(
          coursesData.find((c) => c.id === disciplineData.courseId) ?? null,
        );

        setProfessor(
          professorsData.find(
            (p) => p.id === disciplineData.responsibleProfessorId,
          ) ?? null,
        );

        setModules(modulesComplete);

        setStudents(enrollmentsData.content ?? []);
      } catch (error) {
        console.error("Erro carregando disciplina", error);
      }
    }

    load();
  }, [open, disciplineId]);

=======
>>>>>>> origin/develop
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      {/* HEADER */}

      <DialogTitle
        sx={{
<<<<<<< HEAD
          p: 0,
          background: "linear-gradient(135deg, #1565c0, #42a5f5)",
          color: "white",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
=======
          background: "linear-gradient(135deg,#1976d2,#42a5f5)",
          color: "white",
          py: 3,
        }}
      >
        <Stack
          sx={{
            width: "100%",
            direction: "row",
>>>>>>> origin/develop
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
<<<<<<< HEAD
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
                {discipline?.name}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  maxWidth: 600,
                  mt: 0.5,
                }}
              >
                {discipline?.description}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip
                  icon={<Person />}
                  label={professor?.name ?? "Sem professor"}
                  sx={{
                    bgcolor: "rgba(255,255,255,.15)",
                    color: "white",
                  }}
                />

                {/* <Chip
                  icon={<AccessTime />}
                  label={`${discipline.workload ?? 0}h`}
                  sx={{
                    bgcolor: "rgba(255,255,255,.15)",
                    color: "white",
                  }}
=======
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
                {discipline.nome}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {discipline.descricao}
              </Typography>

              <Stack spacing={1} sx={{ mt: 1, direction: "row" }}>
                <Chip
                  color="default"
                  size="small"
                  label={discipline.professorName ?? "Sem professor"}
                />

                {/* <Chip
                  color="default"
                  size="small"
                  label={`${discipline.workload} horas`}
>>>>>>> origin/develop
                /> */}
              </Stack>
            </Box>
          </Stack>
<<<<<<< HEAD

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
=======
        </Stack>
>>>>>>> origin/develop
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
<<<<<<< HEAD
            value={course?.name}
=======
            value={discipline.courseName}
>>>>>>> origin/develop
          />

          <SummaryCard
            icon={<ViewModule color="primary" />}
            title="Módulos"
<<<<<<< HEAD
            value={modules.length}
=======
            value={details.modules.length}
>>>>>>> origin/develop
          />

          <SummaryCard
            icon={<Article color="primary" />}
            title="Aulas"
            value={totalLessons}
          />

          <SummaryCard
            icon={<Quiz color="primary" />}
            title="Quizzes"
<<<<<<< HEAD
            value={totalActivities}
=======
            value={details.activities?.length ?? 0}
>>>>>>> origin/develop
          />

          <SummaryCard
            icon={<Groups color="primary" />}
            title="Alunos"
<<<<<<< HEAD
            value={students.length}
=======
            value={details.students.length}
>>>>>>> origin/develop
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
<<<<<<< HEAD
            <Tab icon={<ViewModule />} label="Módulos" />

            <Tab icon={<Article />} label="Materiais" />

            <Tab icon={<Quiz />} label="Quizzes" />

            <Tab icon={<Groups />} label="Alunos" />
=======
            <Tab label="Módulos" />

            <Tab label="Materiais" />

            <Tab label="Quizzes" />

            <Tab label="Alunos" />
>>>>>>> origin/develop
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
<<<<<<< HEAD
                {modules.map((module: any) => (
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
                          {module.name}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          <Chip
                            size="small"
                            label={`${module.lessons.length} aulas`}
                          />

                          <Chip size="small" color="primary" label={0} />
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
                              {lesson.name}
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
=======
                {details.modules?.map((module: any) => (
                  <Paper key={module.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {module.nome}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {module.descricao}
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
                            • {lesson.titulo}
                            {lesson.completed ? " ✓" : ""}
                          </Typography>
                        ))}
                      </Box>
                    </Stack>
                  </Paper>
>>>>>>> origin/develop
                ))}
              </Stack>
            )}

            {tab === 1 && (
              <Stack spacing={2}>
<<<<<<< HEAD
                {materials.map((m: any) => (
                  <Paper
                    key={m.id}
                    component="a"
                    href={m.fileUrl}
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
                      <Typography sx={{ fontWeight: 600 }}>{m.name}</Typography>

                      <Typography variant="caption" color="text.secondary">
                        {m.attachmentType} • {m.tamanho_bytes} bytes
                      </Typography>
                    </Box>
                  </Paper>
=======
                {details.materials?.map((m: any) => (
                  <Button
                    key={m.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "white",
                      maxWidth: "200px",
                    }}
                    href={m.url}
                  >
                    <Stack spacing={1}>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {m.nome_arquivo}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={m.tipo} />
                        <Chip size="small" label={`${m.tamanho_bytes} bytes`} />
                        {/* <Chip size="small" label={m.moduloNome} /> */}
                      </Stack>
                    </Stack>
                  </Button>
>>>>>>> origin/develop
                ))}
              </Stack>
            )}

            {tab === 2 && (
              <Stack spacing={2}>
<<<<<<< HEAD
                {modules
                  .flatMap((module) => module.activities)
                  .map((q: any) => (
                    <Paper key={q.id} sx={{ p: 2, borderRadius: 2 }}>
                      <Stack spacing={1}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          {q.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {q.description}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          <Chip
                            size="small"
                            label={`${q.questionCount} questões`}
                          />
                          <Chip
                            size="small"
                            label={`nota de aprovação: ${q.minimumScore}`}
                          />
                          <Chip
                            size="small"
                            label={`tentativas: ${q.attemptLimit}`}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
=======
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
>>>>>>> origin/develop
              </Stack>
            )}

            {tab === 3 && (
              <Stack spacing={2}>
<<<<<<< HEAD
                {students.map((s) => {
                  const percentage = 0;

                  return (
                    <Paper
                      key={s.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          sx={{justifyContent:"space-between",
                          alignItems:"center"}}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{alignItems:"center"}}
                          >
                            <Avatar>{s.studentName.charAt(0)}</Avatar>

                            <Box>
                              <Typography sx={{fontWeight:700}}>
                                {s.studentName}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {s.studentEmail}
                              </Typography>
                            </Box>
                          </Stack>

                          <Chip label={s.status} size="small" />
                        </Stack>

                        <Box>
                          <Stack direction="row" sx={{justifyContent:"space-between"}}>
                            <Typography variant="body2">Progresso</Typography>

                            <Typography sx={{fontWeight:700}}>
                              {percentage}%
                            </Typography>
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
=======
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
                        {/* modificar para calcular a partir do progresso do modulo */}
                        <Typography variant="body2" color="text.secondary">
                          {s.completedLessons}/{s.totalLessons} aulas
                        </Typography>
                      </Stack>
                      {/* a partir do progresso do modulo, calcular o total */}
                      <Chip label={`${s.percentage}%`} color="primary" />
                    </Stack>
                  </Paper>
                ))}
>>>>>>> origin/develop
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
<<<<<<< HEAD
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
=======
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 3,
      }}
    >
      <Stack spacing={1}>
        {icon}

>>>>>>> origin/develop
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>

<<<<<<< HEAD
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{value}</Typography>
      </Box>
=======
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
      </Stack>
>>>>>>> origin/develop
    </Paper>
  );
}
