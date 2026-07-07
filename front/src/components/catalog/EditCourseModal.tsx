"use client";

import { useEffect, useState } from "react";
import { Alert, Stack, TextField } from "@mui/material";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/new-services/poo/shared/api/client";
import {
  type CourseDTO,
  updateCourse,
} from "@/new-services/poo/shared/api/catalog";

interface EditCourseModalProps {
  open: boolean;
  course: CourseDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCourseModal({
  open,
  course,
  onClose,
  onSuccess,
}: EditCourseModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !course) return;
    setName(course.name ?? "");
    setDescription(course.description ?? "");
    setError("");
  }, [open, course]);

  async function handleSubmit() {
    if (!course?.id) return;

    setLoading(true);
    setError("");

    try {
      await updateCourse(course.id, {
        name,
        description: description || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível atualizar o curso.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Editar curso"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            isLoading={loading}
          >
            Salvar
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Nome do curso"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          size="small"
        />
        <TextField
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          size="small"
          multiline
          minRows={2}
        />
      </Stack>
    </Modal>
  );
}
