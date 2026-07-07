"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, ExpandMore, PlayCircleOutlineOutlined } from "@mui/icons-material";
import Link from "next/link";
import {
  createModule,
  listModules,
  type ModuleDTO,
} from "@/new-services/poo/shared/api/catalog";
import {
  createLesson,
  listLessons,
  type LessonDTO,
} from "@/new-services/poo/shared/api/lessons";
import {
  listAttachments,
  type AttachmentDTO,
} from "@/new-services/poo/shared/api/attachments";
import { AttachmentList } from "@/components/lesson/AttachmentList";
import { AttachmentForm } from "@/components/lesson/AttachmentForm";
import { ApiError } from "@/new-services/poo/shared/api/client";

interface LessonMaterialsPanelProps {
  lesson: LessonDTO;
  onMaterialsChanged?: () => void;
}

function LessonMaterialsPanel({
  lesson,
  onMaterialsChanged,
}: LessonMaterialsPanelProps) {
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttachments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const active = await listAttachments(lesson.id);
      const inactive = await listAttachments(lesson.id, "Inactive");
      setAttachments([...active, ...inactive]);
      onMaterialsChanged?.();
    } catch (err) {
      setAttachments([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os materiais.",
      );
    } finally {
      setLoading(false);
    }
  }, [lesson.id, onMaterialsChanged]);

  useEffect(() => {
    void loadAttachments();
  }, [loadAttachments]);

  const activeAttachments = attachments.filter(
    (attachment) => attachment.status === "Active",
  );

  return (
    <Box sx={{ pl: 2, pr: 1, pb: 2, pt: 1, bgcolor: "#f8fafc", borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Materiais da aula
        </Typography>
        <Button
          component={Link}
          href={`/aulas/${lesson.id}`}
          size="small"
          variant="outlined"
        >
          Abrir aula
        </Button>
      </Box>

      <AttachmentList
        attachments={activeAttachments}
        loading={loading}
        error={error}
      />

      <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <AttachmentForm
          lessonId={lesson.id}
          attachments={attachments}
          onChanged={loadAttachments}
        />
      </Box>
    </Box>
  );
}

interface CreateLessonFormProps {
  moduleId: string;
  nextOrderIndex: number;
  onCreated: (lesson: LessonDTO) => void;
}

function CreateLessonForm({
  moduleId,
  nextOrderIndex,
  onCreated,
}: CreateLessonFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const lesson = await createLesson({
        name: name.trim(),
        description: description.trim() || undefined,
        orderIndex: nextOrderIndex,
        moduleId,
      });
      setName("");
      setDescription("");
      onCreated(lesson);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível criar a aula.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#fafbfc" }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        Nova aula
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={1.5}>
        <TextField
          label="Nome da aula"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
          fullWidth
        />
        <TextField
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="small"
          fullWidth
          multiline
          minRows={2}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleSubmit}
          disabled={submitting || !name.trim()}
          sx={{ alignSelf: "flex-start" }}
        >
          {submitting ? "Criando..." : "Criar aula"}
        </Button>
      </Stack>
    </Paper>
  );
}

interface CreateModuleFormProps {
  disciplinaId: string;
  nextOrderIndex: number;
  onCreated: () => void;
}

function CreateModuleForm({
  disciplinaId,
  nextOrderIndex,
  onCreated,
}: CreateModuleFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await createModule({
        name: name.trim(),
        description: description.trim() || undefined,
        orderIndex: nextOrderIndex,
        disciplineId: disciplinaId,
      });
      setName("");
      setDescription("");
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível criar o módulo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Adicionar módulo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Crie módulos para organizar o conteúdo da disciplina. Depois adicione
        aulas e materiais em cada módulo.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={1.5}>
        <TextField
          label="Nome do módulo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
          fullWidth
        />
        <TextField
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="small"
          fullWidth
          multiline
          minRows={2}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleSubmit}
          disabled={submitting || !name.trim()}
          sx={{ alignSelf: "flex-start" }}
        >
          {submitting ? "Criando..." : "Criar módulo"}
        </Button>
      </Stack>
    </Paper>
  );
}

export function ConteudoTab({ disciplinaId }: { disciplinaId: string }) {
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<
    Record<string, LessonDTO[]>
  >({});
  const [attachmentCounts, setAttachmentCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  const refreshAttachmentCounts = useCallback(async (lessons: LessonDTO[]) => {
    const countEntries = await Promise.all(
      lessons.map(async (lesson) => {
        try {
          const attachments = await listAttachments(lesson.id);
          return [lesson.id, attachments.length] as const;
        } catch {
          return [lesson.id, 0] as const;
        }
      }),
    );
    setAttachmentCounts(Object.fromEntries(countEntries));
  }, []);

  const loadContent = useCallback(
    async (options?: { expandModuleId?: string; expandLessonId?: string }) => {
      setLoading(true);
      setError(null);

      try {
        const moduleList = (await listModules(disciplinaId)).sort(
          (a, b) => a.orderIndex - b.orderIndex,
        );
        setModules(moduleList);

        const lessonsEntries = await Promise.all(
          moduleList.map(async (module) => {
            try {
              const lessons = await listLessons(module.id);
              return [module.id, lessons] as const;
            } catch {
              return [module.id, []] as const;
            }
          }),
        );

        const lessonsMap = Object.fromEntries(lessonsEntries);
        setLessonsByModule(lessonsMap);

        const allLessons = lessonsEntries.flatMap(([, lessons]) => lessons);
        await refreshAttachmentCounts(allLessons);

        const targetModuleId =
          options?.expandModuleId ??
          (moduleList.length > 0 ? moduleList[moduleList.length - 1].id : null);
        if (targetModuleId) {
          setExpandedModuleId(targetModuleId);
          const moduleLessons = lessonsMap[targetModuleId] ?? [];
          const targetLessonId =
            options?.expandLessonId ??
            (moduleLessons.length > 0
              ? moduleLessons[moduleLessons.length - 1].id
              : null);
          setExpandedLessonId(targetLessonId);
        }
      } catch (err) {
        setModules([]);
        setLessonsByModule({});
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar o conteúdo.",
        );
      } finally {
        setLoading(false);
      }
    },
    [disciplinaId, refreshAttachmentCounts],
  );

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const handleMaterialsChanged = useCallback(() => {
    const allLessons = Object.values(lessonsByModule).flat();
    void refreshAttachmentCounts(allLessons);
  }, [lessonsByModule, refreshAttachmentCounts]);

  const handleLessonCreated = useCallback(
    (moduleId: string, lesson: LessonDTO) => {
      setLessonsByModule((prev) => ({
        ...prev,
        [moduleId]: [...(prev[moduleId] ?? []), lesson],
      }));
      setExpandedModuleId(moduleId);
      setExpandedLessonId(lesson.id);
      setAttachmentCounts((prev) => ({ ...prev, [lesson.id]: 0 }));
    },
    [],
  );

  if (loading && modules.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CreateModuleForm
        disciplinaId={disciplinaId}
        nextOrderIndex={modules.length + 1}
        onCreated={() => void loadContent()}
      />

      {modules.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
          Nenhum módulo cadastrado ainda. Use o formulário acima para começar.
        </Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Expanda uma aula para adicionar materiais (links, imagens e vídeos
            do YouTube).
          </Typography>

          {modules.map((modulo) => {
            const lessons = lessonsByModule[modulo.id] ?? [];

            return (
              <Accordion
                key={modulo.id}
                expanded={expandedModuleId === modulo.id}
                onChange={(_, expanded) =>
                  setExpandedModuleId(expanded ? modulo.id : null)
                }
                sx={{ mb: 1, borderRadius: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ fontWeight: 600 }}>{modulo.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {modulo.description ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {modulo.description}
                    </Typography>
                  ) : null}

                  <Stack spacing={2}>
                    {lessons.map((aula) => (
                      <Accordion
                        key={aula.id}
                        expanded={expandedLessonId === aula.id}
                        onChange={(_, expanded) =>
                          setExpandedLessonId(expanded ? aula.id : null)
                        }
                        sx={{
                          mb: 0,
                          boxShadow: "none",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              width: "100%",
                            }}
                          >
                            <PlayCircleOutlineOutlined
                              sx={{ color: "primary.main", fontSize: 20 }}
                            />
                            <Typography sx={{ flex: 1 }}>{aula.name}</Typography>
                            <Chip
                              size="small"
                              label={`${attachmentCounts[aula.id] ?? 0} materiais`}
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0 }}>
                          <LessonMaterialsPanel
                            lesson={aula}
                            onMaterialsChanged={handleMaterialsChanged}
                          />
                        </AccordionDetails>
                      </Accordion>
                    ))}

                    <CreateLessonForm
                      moduleId={modulo.id}
                      nextOrderIndex={lessons.length + 1}
                      onCreated={(lesson) => handleLessonCreated(modulo.id, lesson)}
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      )}
    </Box>
  );
}
