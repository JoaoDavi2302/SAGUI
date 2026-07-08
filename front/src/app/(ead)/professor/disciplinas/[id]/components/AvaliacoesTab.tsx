"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Add,
  DeleteOutlined,
  EditOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { listModules, type ModuleDTO } from "@/new-services/poo/shared/api/catalog";
import {
  deleteActivity,
  listActivities,
  type ActivityDTO,
} from "@/new-services/poo/shared/api/activities";
import { ApiError } from "@/new-services/poo/shared/api/client";
import { ActivityAttemptsDialog } from "@/components/professor/ActivityAttemptsDialog";
import { ActivityFormDialog } from "@/components/professor/ActivityFormDialog";

interface ActivityRow extends ActivityDTO {
  moduleName: string;
}

export function AvaliacoesTab({ disciplinaId }: { disciplinaId: string }) {
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const moduleList = await listModules(disciplinaId);
      setModules(moduleList);

      const rows = await Promise.all(
        moduleList.map(async (module) => {
          const moduleActivities = await listActivities(module.id);
          return moduleActivities.map((activity) => ({
            ...activity,
            moduleName: module.name,
          }));
        }),
      );

      setActivities(rows.flat());
    } catch (err) {
      setActivities([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as avaliações.",
      );
    } finally {
      setLoading(false);
    }
  }, [disciplinaId]);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  function openCreateForm() {
    setEditingActivityId(null);
    setFormOpen(true);
  }

  function openEditForm(activity: ActivityRow) {
    setEditingActivityId(activity.id);
    setFormOpen(true);
  }

  async function handleDelete(activity: ActivityRow) {
    const confirmed = window.confirm(
      `Inativar a atividade "${activity.title}"? Ela deixará de ficar disponível para os alunos.`,
    );
    if (!confirmed) return;

    setDeletingId(activity.id);
    setError(null);

    try {
      await deleteActivity(activity.id);
      await loadActivities();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível inativar a atividade.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Avaliações da disciplina
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie e edite atividades com questões de múltipla escolha.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateForm}
            disabled={modules.length === 0}
          >
            Nova atividade
          </Button>
        </Box>

        {modules.length === 0 && (
          <Alert severity="info">
            Crie pelo menos um módulo na aba Conteúdo antes de adicionar atividades.
          </Alert>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {activities.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Nenhuma atividade cadastrada nesta disciplina.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, boxShadow: 0, border: "1px solid #e2e8f0" }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell>Atividade</TableCell>
                  <TableCell>Módulo</TableCell>
                  <TableCell align="center">Nota mínima</TableCell>
                  <TableCell align="center">Tentativas</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((ativ) => (
                  <TableRow key={ativ.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {ativ.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{ativ.moduleName}</TableCell>
                    <TableCell align="center">{Math.round(ativ.minimumScore)}%</TableCell>
                    <TableCell align="center">{ativ.attemptLimit}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={ativ.status === "Active" ? "Ativa" : "Inativa"}
                        color={ativ.status === "Active" ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedActivity(ativ)}
                        aria-label={`Ver tentativas de ${ativ.title}`}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openEditForm(ativ)}
                        aria-label={`Editar ${ativ.title}`}
                        disabled={ativ.status !== "Active"}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => void handleDelete(ativ)}
                        aria-label={`Inativar ${ativ.title}`}
                        disabled={deletingId === ativ.id || ativ.status !== "Active"}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      <ActivityFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        modules={modules}
        activityId={editingActivityId}
        onSaved={() => void loadActivities()}
      />

      <ActivityAttemptsDialog
        open={selectedActivity !== null}
        onClose={() => setSelectedActivity(null)}
        activityId={selectedActivity?.id ?? null}
        activityTitle={selectedActivity?.title ?? ""}
      />
    </>
  );
}
