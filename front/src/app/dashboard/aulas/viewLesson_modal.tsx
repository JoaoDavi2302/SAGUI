"use client";

import { useEffect, useState } from "react";

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
  Article,
  MenuBook,
  School,
  ViewModule,
  Quiz,
  Close,
} from "@mui/icons-material";

import { getLesson, LessonDTO } from "@/new-services/poo/shared/api/lessons";

import {
  listAttachments,
  AttachmentDTO,
} from "@/new-services/poo/shared/api/attachments";

import {
  listActivities,
  ActivityDTO,
} from "@/new-services/poo/shared/api/activities";

import {
  listModules,
  listDisciplines,
  listCourses,
  ModuleDTO,
  DisciplineDTO,
  CourseDTO,
} from "@/new-services/poo/shared/api/catalog";

interface Props {
  open: boolean;
  lessonId?: string;
  onClose: () => void;
}

export default function LessonViewModal({ open, lessonId, onClose }: Props) {
  const [tab, setTab] = useState(0);

  const [lesson, setLesson] = useState<LessonDTO | null>(null);

  const [module, setModule] = useState<ModuleDTO | null>(null);

  const [discipline, setDiscipline] = useState<DisciplineDTO | null>(null);

  const [course, setCourse] = useState<CourseDTO | null>(null);

  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);

  const [activities, setActivities] = useState<ActivityDTO[]>([]);

  useEffect(() => {
    if (!open || !lessonId) return;

    async function load() {
      try {
        const lessonData = await getLesson(lessonId!);

        const [modules, disciplines, courses, lessonAttachments] =
          await Promise.all([
            listModules(),
            listDisciplines(),
            listCourses(),
            listAttachments(lessonData.id),
          ]);

        const moduleData =
          modules.find((m) => m.id === lessonData.moduleId) ?? null;

        const disciplineData =
          disciplines.find((d) => d.id === moduleData?.disciplineId) ?? null;

        const courseData =
          courses.find((c) => c.id === disciplineData?.courseId) ?? null;

        const lessonActivities = moduleData
          ? await listActivities(moduleData.id)
          : [];

        setLesson(lessonData);

        setModule(moduleData);

        setDiscipline(disciplineData);

        setCourse(courseData);

        setAttachments(lessonAttachments);

        setActivities(lessonActivities);
      } catch (error) {
        console.error("Erro carregando aula", error);
      }
    }

    load();
  }, [open, lessonId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      {/* HEADER */}

      <DialogTitle
        sx={{
          p: 0,
          background: "linear-gradient(135deg,#1565c0,#42a5f5)",
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
              <Article fontSize="large" />
            </Avatar>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                {lesson?.name}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  mt: 0.5,
                  maxWidth: 650,
                }}
              >
                {lesson?.description}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip
                  icon={<ViewModule />}
                  label={module?.name ?? "-"}
                  sx={{
                    bgcolor: "rgba(255,255,255,.15)",
                    color: "white",
                  }}
                />

                <Chip
                  label={`Ordem ${lesson?.orderIndex}`}
                  sx={{
                    bgcolor: "rgba(255,255,255,.15)",
                    color: "white",
                  }}
                />

                <Chip
                  label={lesson?.status}
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
            display: "grid",
            gap: 2,
            mb: 3,
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          }}
        >
          <SummaryCard
            icon={<School color="primary" />}
            title="Curso"
            value={course?.name}
          />

          <SummaryCard
            icon={<MenuBook color="primary" />}
            title="Disciplina"
            value={discipline?.name}
          />

          <SummaryCard
            icon={<ViewModule color="primary" />}
            title="Módulo"
            value={module?.name}
          />

          <SummaryCard
            icon={<Article color="primary" />}
            title="Materiais"
            value={attachments.length}
          />

          <SummaryCard
            icon={<Quiz color="primary" />}
            title="Atividades"
            value={activities.length}
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
            <Tab icon={<Article />} label="Conteúdo" />

            <Tab icon={<Article />} label="Materiais" />

            <Tab icon={<Quiz />} label="Atividades" />
          </Tabs>

          <Divider />

          <Box
            sx={{
              minHeight: 500,
              p: 3,
            }}
          >
            {" "}
            {tab === 0 && lesson && (
              <Stack spacing={3}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nome da Aula
                      </Typography>

                      <Typography variant="h6">{lesson.name}</Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Descrição
                      </Typography>

                      <Typography>{lesson.description || "-"}</Typography>
                    </Box>

                    <Divider />

                    <Stack direction="row" spacing={5} sx={{flexWrap:"wrap"}}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Curso
                        </Typography>

                        <Typography>{course?.name ?? "-"}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Disciplina
                        </Typography>

                        <Typography>{discipline?.name ?? "-"}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Módulo
                        </Typography>

                        <Typography>{module?.name ?? "-"}</Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack direction="row" spacing={5}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ordem
                        </Typography>

                        <Typography>{lesson.orderIndex}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>

                        <Chip
                          label={lesson.status}
                          color={
                            lesson.status === "Active" ? "success" : "default"
                          }
                          size="small"
                        />
                      </Box>
                    </Stack>

                    <Divider />

                    <Typography variant="caption" color="text.secondary">
                      ID: {lesson.id}
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            )}
            {tab === 1 && (
              <Stack spacing={2}>
                {attachments.length === 0 && (
                  <Typography color="text.secondary">
                    Nenhum material cadastrado.
                  </Typography>
                )}

                {attachments.map((material) => (
                  <Paper
                    key={material.id}
                    component="a"
                    href={material.fileUrl}
                    target="_blank"
                    sx={{
                      p: 2,
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      textDecoration: "none",
                      color: "inherit",
                      borderRadius: 3,
                      transition: ".2s",

                      "&:hover": {
                        bgcolor: "#f5f5f5",
                      },
                    }}
                  >
                    <Article color="primary" />

                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {material.name}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {material.attachmentType}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
            {tab === 2 && (
              <Stack spacing={2}>
                {activities.length === 0 && (
                  <Typography color="text.secondary">
                    Nenhuma atividade cadastrada.
                  </Typography>
                )}

                {activities.map((activity) => (
                  <Paper
                    key={activity.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {activity.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{flexWrap:"wrap"}}>
                        {/* <Chip
                          size="small"
                          label={`${activity.questionCount} questões`}
                        /> */}

                        <Chip
                          size="small"
                          label={`Nota mínima ${activity.minimumScore}`}
                        />

                        <Chip
                          size="small"
                          label={`${activity.attemptLimit} tentativas`}
                        />
                      </Stack>
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
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: "flex",
        gap: 2,
        alignItems: "center",
        transition: ".2s",

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

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {value ?? "-"}
        </Typography>
      </Box>
    </Paper>
  );
}
