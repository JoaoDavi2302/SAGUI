"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  changeAttachmentStatus,
  createAttachment,
  deleteAttachment,
  updateAttachment,
  type AttachmentDTO,
  type AttachmentRequest,
  type AttachmentType,
} from "@/new-services/poo/shared/api/attachments";
import { ApiError } from "@/new-services/poo/shared/api/client";

interface AttachmentFormProps {
  lessonId: string;
  attachments: AttachmentDTO[];
  onChanged: () => Promise<void> | void;
  hideCreateForm?: boolean;
}

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

export function AttachmentForm({
  lessonId,
  attachments,
  onChanged,
  hideCreateForm = false,
}: AttachmentFormProps) {
  const [form, setForm] = useState<AttachmentRequest>(emptyForm(lessonId));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (editingId) {
        await updateAttachment(editingId, form);
      } else {
        await createAttachment(form);
      }

      setForm(emptyForm(lessonId));
      setEditingId(null);
      await onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar material");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(attachment: AttachmentDTO) {
    setEditingId(attachment.id);
    setForm({
      name: attachment.name,
      fileUrl: attachment.fileUrl,
      attachmentType: attachment.attachmentType,
      lessonId: attachment.lessonId,
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm(lessonId));
    setError(null);
  }

  async function handleInactivate(id: string) {
    setSubmitting(true);
    setError(null);

    try {
      await deleteAttachment(id);
      if (editingId === id) {
        cancelEdit();
      }
      await onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao inativar material");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReactivate(id: string) {
    setSubmitting(true);
    setError(null);

    try {
      await changeAttachmentStatus(id, "Active");
      await onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao reativar material");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box>
      <Typography sx={{ fontWeight: 600, mb: 2 }}>
        Gerenciar materiais
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!hideCreateForm && (
      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Nome"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          fullWidth
          size="small"
        />

        <FormControl fullWidth size="small">
          <InputLabel id="attachment-type-label">Tipo</InputLabel>
          <Select
            labelId="attachment-type-label"
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

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !form.name.trim() || !form.fileUrl.trim()}
          >
            {editingId ? "Salvar alterações" : "Adicionar material"}
          </Button>
          {editingId && (
            <Button variant="outlined" onClick={cancelEdit} disabled={submitting}>
              Cancelar
            </Button>
          )}
        </Stack>
      </Stack>
      )}

      {hideCreateForm && editingId && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel id="attachment-type-label-edit">Tipo</InputLabel>
            <Select
              labelId="attachment-type-label-edit"
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

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim() || !form.fileUrl.trim()}
            >
              Salvar alterações
            </Button>
            <Button variant="outlined" onClick={cancelEdit} disabled={submitting}>
              Cancelar
            </Button>
          </Stack>
        </Stack>
      )}

      {attachments.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Materiais cadastrados
          </Typography>
          {attachments.map((attachment) => (
            <Box
              key={attachment.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 500 }}>{attachment.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {attachment.attachmentType}
                  {attachment.status === "Inactive" ? " · Inativo" : ""}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => startEdit(attachment)}>
                  Editar
                </Button>
                {attachment.status === "Active" ? (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleInactivate(attachment.id)}
                    disabled={submitting}
                  >
                    Inativar
                  </Button>
                ) : (
                  <Button
                    size="small"
                    color="success"
                    onClick={() => handleReactivate(attachment.id)}
                    disabled={submitting}
                  >
                    Reativar
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
