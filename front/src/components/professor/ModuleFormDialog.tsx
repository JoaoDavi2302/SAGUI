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
  createModule,
  updateModule,
  type ModuleDTO,
} from "@/new-services/poo/shared/api/catalog";
import { ApiError } from "@/new-services/poo/shared/api/client";

interface ModuleFormDialogProps {
  open: boolean;
  onClose: () => void;
  disciplinaId: string;
  nextOrderIndex: number;
  module?: ModuleDTO | null;
  onSaved: () => void;
}

export function ModuleFormDialog({
  open,
  onClose,
  disciplinaId,
  nextOrderIndex,
  module,
  onSaved,
}: ModuleFormDialogProps) {
  const isEditing = Boolean(module);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (module) {
      setName(module.name);
      setDescription(module.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
    setError(null);
  }, [open, module]);

  async function handleSubmit() {
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (module) {
        await updateModule(module.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          orderIndex: module.orderIndex,
          disciplineId: module.disciplineId,
        });
      } else {
        await createModule({
          name: name.trim(),
          description: description.trim() || undefined,
          orderIndex: nextOrderIndex,
          disciplineId: disciplinaId,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Não foi possível ${isEditing ? "salvar" : "criar"} o módulo.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Editar módulo" : "Novo módulo"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nome do módulo"
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
              : "Criar módulo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
