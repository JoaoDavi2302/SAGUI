"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {
  createAttachment,
  type AttachmentRequest,
  type AttachmentType,
} from "@/new-services/poo/shared/api/attachments";
import { ApiError } from "@/new-services/poo/shared/api/client";

const TYPE_LABELS: Record<AttachmentType, string> = {
  DOCUMENT: "Documento (link)",
  IMAGE: "Imagem (URL)",
  VIDEO: "Vídeo (YouTube)",
};

const emptyForm = (lessonId: string): AttachmentRequest => ({
  name: "",
  fileUrl: "",
  attachmentType: "DOCUMENT",
  lessonId,
});

interface AttachmentCreateDialogProps {
  open: boolean;
  onClose: () => void;
  lessonId: string;
  onCreated: () => void;
}

export function AttachmentCreateDialog({
  open,
  onClose,
  lessonId,
  onCreated,
}: AttachmentCreateDialogProps) {
  const [form, setForm] = useState<AttachmentRequest>(emptyForm(lessonId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm(lessonId));
    setError(null);
  }, [open, lessonId]);

  const urlHint =
    form.attachmentType === "VIDEO"
      ? "Use uma URL do YouTube (youtube.com/watch?v=... ou youtu.be/...)"
      : form.attachmentType === "IMAGE"
        ? "URL direta da imagem (http ou https)"
        : "Link para PDF, Google Drive, etc.";

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      await createAttachment(form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao adicionar material");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar material</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            size="small"
            autoFocus
          />

          <FormControl fullWidth size="small">
            <InputLabel id="attachment-create-type-label">Tipo</InputLabel>
            <Select
              labelId="attachment-create-type-label"
              label="Tipo"
              value={form.attachmentType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  attachmentType: e.target.value as AttachmentType,
                }))
              }
            >
              {(Object.keys(TYPE_LABELS) as AttachmentType[]).map((type) => (
                <MenuItem key={type} value={type}>
                  {TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="URL"
            value={form.fileUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, fileUrl: e.target.value }))}
            fullWidth
            size="small"
            helperText={urlHint}
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
          disabled={submitting || !form.name.trim() || !form.fileUrl.trim()}
        >
          {submitting ? "Salvando..." : "Adicionar material"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
