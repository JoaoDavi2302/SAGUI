"use client";

import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getEnrollmentProgress, type DisciplineProgressDTO } from "@/new-services/poo/shared/api/progress";
import { ApiError } from "@/new-services/poo/shared/api/client";

interface StudentProgressDialogProps {
  open: boolean;
  onClose: () => void;
  enrollmentId: string | null;
  studentName: string;
}

export function StudentProgressDialog({
  open,
  onClose,
  enrollmentId,
  studentName,
}: StudentProgressDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DisciplineProgressDTO | null>(null);

  useEffect(() => {
    if (!open || !enrollmentId) return;

    let cancelled = false;

    async function load() {
      if (!enrollmentId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getEnrollmentProgress(enrollmentId);
        if (!cancelled) setProgress(data);
      } catch (err) {
        if (!cancelled) {
          setProgress(null);
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar o progresso.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, enrollmentId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Progresso — {studentName}</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ py: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && progress && (
          <Box sx={{ pb: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progresso geral na disciplina
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress.overallPercentage}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 40 }}>
                  {progress.overallPercentage}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {progress.completedModules} de {progress.totalModules} módulos concluídos
              </Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Módulos
            </Typography>
            <List dense disablePadding>
              {progress.modules.map((module) => (
                <ListItem
                  key={module.moduleId}
                  sx={{
                    px: 0,
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <ListItemText
                    primary={module.moduleName}
                    secondary={`${module.progressPercentage}% das aulas`}
                  />
                  <Chip
                    label={
                      module.completed
                        ? "Concluído"
                        : module.unlocked
                          ? "Em andamento"
                          : "Bloqueado"
                    }
                    size="small"
                    color={
                      module.completed ? "success" : module.unlocked ? "primary" : "default"
                    }
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
