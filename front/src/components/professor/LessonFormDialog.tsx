"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import {
  createLesson,
  updateLesson,
  type LessonDTO,
} from "@/new-services/poo/shared/api/lessons";
import { ApiError } from "@/new-services/poo/shared/api/client";

interface LessonFormDialogProps {
  open: boolean;
  onClose: () => void;
  moduleId: string;
  nextOrderIndex: number;
  lesson?: LessonDTO | null;
  onSaved: (lesson?: LessonDTO) => void;
}

export function LessonFormDialog({
  open,
  onClose,
  moduleId,
  nextOrderIndex,
  lesson,
  onSaved,
}: LessonFormDialogProps) {
  const isEditing = Boolean(lesson);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (lesson) {
      setName(lesson.name);
      setDescription(lesson.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
    setError(null);
  }, [open, lesson]);

  async function handleSubmit() {
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (lesson) {
        await updateLesson(lesson.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          orderIndex: lesson.orderIndex,
          moduleId: lesson.moduleId,
        });
        onSaved();
      } else {
        const created = await createLesson({
          name: name.trim(),
          description: description.trim() || undefined,
          orderIndex: nextOrderIndex,
          moduleId,
        });
        onSaved(created);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Não foi possível ${isEditing ? "salvar" : "criar"} a aula.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Editar aula" : "Nova aula"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nome da aula"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            fullWidth
            autoFocus
          />
          <TextField
            label="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={submitting || !name.trim()}
        >
          {submitting
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Criar aula"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
