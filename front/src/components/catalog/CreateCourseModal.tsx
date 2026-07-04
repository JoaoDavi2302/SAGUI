"use client";

import { useState } from "react";
import {
  Alert,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/services/api/client";
import { createCourse } from "@/services/api/catalog";

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCourseModal({
  open,
  onClose,
  onSuccess,
}: CreateCourseModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      await createCourse({ name, description: description || undefined });
      setName("");
      setDescription("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível cadastrar o curso.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Novo curso"
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
            Cadastrar
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
