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
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  DeleteOutlined,
  EditOutlined,
  ExpandMore,
  PlayCircleOutlineOutlined,
  UnarchiveOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import {
  changeModuleStatus,
  listModules,
  type ModuleDTO,
} from "@/new-services/poo/shared/api/catalog";
import {
  changeLessonStatus,
  listLessons,
  type LessonDTO,
} from "@/new-services/poo/shared/api/lessons";
import { listAttachments, type AttachmentDTO } from "@/new-services/poo/shared/api/attachments";
import { AttachmentList } from "@/components/lesson/AttachmentList";
import { AttachmentForm } from "@/components/lesson/AttachmentForm";
import { AttachmentCreateDialog } from "@/components/lesson/AttachmentCreateDialog";
import { ModuleFormDialog } from "@/components/professor/ModuleFormDialog";
import { LessonFormDialog } from "@/components/professor/LessonFormDialog";
import { ReorderButtons } from "@/components/professor/ReorderButtons";
import { ApiError } from "@/new-services/poo/shared/api/client";
import {
  getActiveItems,
  sortByOrderIndex,
  swapLessonOrder,
  swapModuleOrder,
} from "@/utils/reorderContent";

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
  const [createOpen, setCreateOpen] = useState(false);

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

  if (lesson.status === "Inactive") {
    return (
      <Box sx={{ pl: 2, py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Esta aula está inativa. Reative-a para gerenciar materiais.
        </Typography>
      </Box>
    );
  }

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
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateOpen(true)}
          >
            Adicionar material
          </Button>
          <Button
            component={Link}
            href={`/aulas/${lesson.id}`}
            size="small"
            variant="outlined"
          >
            Abrir aula
          </Button>
        </Stack>
      </Box>

      <AttachmentList
        attachments={activeAttachments}
        loading={loading}
        error={error}
      />

      {attachments.length > 0 && (
        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <AttachmentForm
            lessonId={lesson.id}
            attachments={attachments}
            onChanged={loadAttachments}
            hideCreateForm
          />
        </Box>
      )}

      <AttachmentCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        lessonId={lesson.id}
        onCreated={() => void loadAttachments()}
      />
    </Box>
  );
}

async function loadModulesForDiscipline(disciplineId: string) {
  const [active, inactive] = await Promise.all([
    listModules(disciplineId, "Active"),
    listModules(disciplineId, "Inactive"),
  ]);

  return [...active, ...inactive].sort((a, b) => a.orderIndex - b.orderIndex);
}

async function loadLessonsForModule(moduleId: string) {
  const [active, inactive] = await Promise.all([
    listLessons(moduleId, "Active"),
    listLessons(moduleId, "Inactive"),
  ]);

  return [...active, ...inactive].sort((a, b) => a.orderIndex - b.orderIndex);
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
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleDTO | null>(null);
  const [lessonDialogModuleId, setLessonDialogModuleId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonDTO | null>(null);
  const [statusChangingId, setStatusChangingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const refreshAttachmentCounts = useCallback(async (lessons: LessonDTO[]) => {
    const activeLessons = lessons.filter((lesson) => lesson.status === "Active");
    const countEntries = await Promise.all(
      activeLessons.map(async (lesson) => {
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
        const moduleList = await loadModulesForDiscipline(disciplinaId);
        setModules(moduleList);

        const lessonsEntries = await Promise.all(
          moduleList.map(async (module) => {
            try {
              const lessons = await loadLessonsForModule(module.id);
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

        if (options?.expandModuleId) {
          setExpandedModuleId(options.expandModuleId);
          if (options.expandLessonId) {
            setExpandedLessonId(options.expandLessonId);
          }
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

  const handleLessonSaved = useCallback(
    (moduleId: string, lesson?: LessonDTO) => {
      if (lesson) {
        setLessonsByModule((prev) => ({
          ...prev,
          [moduleId]: [...(prev[moduleId] ?? []), lesson],
        }));
        setExpandedModuleId(moduleId);
        setExpandedLessonId(lesson.id);
        setAttachmentCounts((prev) => ({ ...prev, [lesson.id]: 0 }));
      } else {
        void loadContent({ expandModuleId: moduleId, expandLessonId: editingLesson?.id });
      }
    },
    [editingLesson?.id, loadContent],
  );

  async function handleModuleStatusChange(module: ModuleDTO, status: "Active" | "Inactive") {
    const action = status === "Inactive" ? "inativar" : "reativar";
    const confirmed = window.confirm(
      `Deseja ${action} o módulo "${module.name}"?${
        status === "Inactive" ? " As aulas deixarão de ficar disponíveis para os alunos." : ""
      }`,
    );
    if (!confirmed) return;

    setStatusChangingId(module.id);
    setError(null);

    try {
      await changeModuleStatus(module.id, status);
      await loadContent({ expandModuleId: module.id });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Não foi possível ${action} o módulo.`,
      );
    } finally {
      setStatusChangingId(null);
    }
  }

  async function handleLessonStatusChange(lesson: LessonDTO, status: "Active" | "Inactive") {
    const action = status === "Inactive" ? "inativar" : "reativar";
    const confirmed = window.confirm(`Deseja ${action} a aula "${lesson.name}"?`);
    if (!confirmed) return;

    setStatusChangingId(lesson.id);
    setError(null);

    try {
      await changeLessonStatus(lesson.id, status);
      await loadContent({ expandModuleId: lesson.moduleId, expandLessonId: lesson.id });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Não foi possível ${action} a aula.`,
      );
    } finally {
      setStatusChangingId(null);
    }
  }

  function openCreateModule() {
    setEditingModule(null);
    setModuleDialogOpen(true);
  }

  function openEditModule(module: ModuleDTO) {
    setEditingModule(module);
    setModuleDialogOpen(true);
  }

  function openCreateLesson(moduleId: string) {
    setEditingLesson(null);
    setLessonDialogModuleId(moduleId);
  }

  function openEditLesson(lesson: LessonDTO) {
    setEditingLesson(lesson);
    setLessonDialogModuleId(lesson.moduleId);
  }

  async function handleMoveModule(module: ModuleDTO, direction: "up" | "down") {
    const activeModules = getActiveItems(modules);
    const currentIndex = activeModules.findIndex((item) => item.id === module.id);
    const neighborIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const neighbor = activeModules[neighborIndex];

    if (!neighbor) return;

    setReorderingId(module.id);
    setError(null);

    try {
      await swapModuleOrder(module, neighbor);
      await loadContent({ expandModuleId: module.id });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível reordenar o módulo.",
      );
    } finally {
      setReorderingId(null);
    }
  }

  async function handleMoveLesson(lesson: LessonDTO, direction: "up" | "down") {
    const moduleLessons = lessonsByModule[lesson.moduleId] ?? [];
    const activeLessons = getActiveItems(moduleLessons);
    const currentIndex = activeLessons.findIndex((item) => item.id === lesson.id);
    const neighborIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const neighbor = activeLessons[neighborIndex];

    if (!neighbor) return;

    setReorderingId(lesson.id);
    setError(null);

    try {
      await swapLessonOrder(lesson, neighbor);
      await loadContent({ expandModuleId: lesson.moduleId, expandLessonId: lesson.id });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível reordenar a aula.",
      );
    } finally {
      setReorderingId(null);
    }
  }

  const activeModules = getActiveItems(modules);
  const sortedModules = [
    ...activeModules,
    ...sortByOrderIndex(modules.filter((module) => module.status === "Inactive")),
  ];
  const lessonDialogLessons = lessonDialogModuleId
    ? lessonsByModule[lessonDialogModuleId] ?? []
    : [];

  if (loading && modules.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Conteúdo e materiais
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize módulos, aulas e materiais da disciplina.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateModule}>
          Adicionar módulo
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {modules.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          Nenhum módulo cadastrado ainda. Clique em &quot;Adicionar módulo&quot; para começar.
        </Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use as setas para reordenar módulos e aulas ativos. Expanda uma aula para
            adicionar materiais.
          </Typography>

          {sortedModules.map((modulo) => {
            const lessons = lessonsByModule[modulo.id] ?? [];
            const isModuleInactive = modulo.status === "Inactive";
            const activeModuleIndex = activeModules.findIndex((item) => item.id === modulo.id);
            const sortedLessons = [
              ...getActiveItems(lessons),
              ...sortByOrderIndex(lessons.filter((lesson) => lesson.status === "Inactive")),
            ];
            const activeLessons = getActiveItems(lessons);

            return (
              <Accordion
                key={modulo.id}
                expanded={expandedModuleId === modulo.id}
                onChange={(_, expanded) =>
                  setExpandedModuleId(expanded ? modulo.id : null)
                }
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  opacity: isModuleInactive ? 0.85 : 1,
                }}
              >
                <AccordionSummary component="div" expandIcon={<ExpandMore />}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      width: "100%",
                      pr: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, flex: 1 }}>
                      {modulo.name}
                    </Typography>
                    {isModuleInactive && (
                      <Chip label="Inativo" size="small" color="default" variant="outlined" />
                    )}
                    {!isModuleInactive && (
                      <ReorderButtons
                        onMoveUp={() => void handleMoveModule(modulo, "up")}
                        onMoveDown={() => void handleMoveModule(modulo, "down")}
                        disableUp={activeModuleIndex <= 0}
                        disableDown={activeModuleIndex >= activeModules.length - 1}
                        disabled={reorderingId === modulo.id || statusChangingId === modulo.id}
                      />
                    )}
                    <Stack
                      direction="row"
                      spacing={0.5}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Tooltip title="Editar módulo">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => openEditModule(modulo)}
                            disabled={
                              statusChangingId === modulo.id || reorderingId === modulo.id
                            }
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {modulo.status === "Active" ? (
                        <Tooltip title="Inativar módulo">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => void handleModuleStatusChange(modulo, "Inactive")}
                              disabled={statusChangingId === modulo.id}
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Reativar módulo">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => void handleModuleStatusChange(modulo, "Active")}
                              disabled={statusChangingId === modulo.id}
                            >
                              <UnarchiveOutlined fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
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
                    {sortedLessons.map((aula) => {
                      const isLessonInactive = aula.status === "Inactive";
                      const activeLessonIndex = activeLessons.findIndex(
                        (item) => item.id === aula.id,
                      );

                      return (
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
                            opacity: isLessonInactive ? 0.85 : 1,
                          }}
                        >
                          <AccordionSummary component="div" expandIcon={<ExpandMore />}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                width: "100%",
                                pr: 1,
                              }}
                            >
                              <PlayCircleOutlineOutlined
                                sx={{ color: "primary.main", fontSize: 20 }}
                              />
                              <Typography sx={{ flex: 1 }}>{aula.name}</Typography>
                              {isLessonInactive ? (
                                <Chip label="Inativa" size="small" variant="outlined" />
                              ) : (
                                <Chip
                                  size="small"
                                  label={`${attachmentCounts[aula.id] ?? 0} materiais`}
                                />
                              )}
                              {!isLessonInactive && (
                                <ReorderButtons
                                  onMoveUp={() => void handleMoveLesson(aula, "up")}
                                  onMoveDown={() => void handleMoveLesson(aula, "down")}
                                  disableUp={activeLessonIndex <= 0}
                                  disableDown={activeLessonIndex >= activeLessons.length - 1}
                                  disabled={
                                    reorderingId === aula.id || statusChangingId === aula.id
                                  }
                                />
                              )}
                              <Stack
                                direction="row"
                                spacing={0.5}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Tooltip title="Editar aula">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => openEditLesson(aula)}
                                      disabled={
                                        statusChangingId === aula.id || reorderingId === aula.id
                                      }
                                    >
                                      <EditOutlined fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                {aula.status === "Active" ? (
                                  <Tooltip title="Inativar aula">
                                    <span>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          void handleLessonStatusChange(aula, "Inactive")
                                        }
                                        disabled={statusChangingId === aula.id}
                                      >
                                        <DeleteOutlined fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Reativar aula">
                                    <span>
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() =>
                                          void handleLessonStatusChange(aula, "Active")
                                        }
                                        disabled={statusChangingId === aula.id}
                                      >
                                        <UnarchiveOutlined fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                )}
                              </Stack>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0 }}>
                            <LessonMaterialsPanel
                              lesson={aula}
                              onMaterialsChanged={handleMaterialsChanged}
                            />
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}

                    {!isModuleInactive && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => openCreateLesson(modulo.id)}
                        sx={{ alignSelf: "flex-start" }}
                      >
                        Nova aula
                      </Button>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      )}

      <ModuleFormDialog
        open={moduleDialogOpen}
        onClose={() => setModuleDialogOpen(false)}
        disciplinaId={disciplinaId}
        nextOrderIndex={activeModules.length + 1}
        module={editingModule}
        onSaved={() => void loadContent({ expandModuleId: editingModule?.id })}
      />

      {lessonDialogModuleId && (
        <LessonFormDialog
          open={lessonDialogModuleId !== null}
          onClose={() => {
            setLessonDialogModuleId(null);
            setEditingLesson(null);
          }}
          moduleId={lessonDialogModuleId}
          nextOrderIndex={
            lessonDialogLessons.filter((lesson) => lesson.status === "Active").length + 1
          }
          lesson={editingLesson}
          onSaved={(lesson) => handleLessonSaved(lessonDialogModuleId, lesson)}
        />
      )}
    </Box>
  );
}
