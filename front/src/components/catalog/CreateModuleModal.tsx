"use client";

import { useState } from "react";
import { Alert, Stack, TextField } from "@mui/material";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/services/api/client";
import { createModule } from "@/services/api/catalog";

interface CreateModuleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  disciplineId: string;
  nextOrderIndex: number;
}

export function CreateModuleModal({
  open,
  onClose,
  onSuccess,
  disciplineId,
  nextOrderIndex,
}: CreateModuleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(nextOrderIndex);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      await createModule({
        name,
        description: description || undefined,
        orderIndex,
        disciplineId,
      });
      setName("");
      setDescription("");
      setOrderIndex(nextOrderIndex);
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível cadastrar o módulo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Novo módulo"
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
          label="Nome do módulo"
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
        <TextField
          label="Ordem"
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(Number(e.target.value))}
          required
          fullWidth
          size="small"
          slotProps={{ htmlInput: { min: 1 } }}
        />
      </Stack>
    </Modal>
  );
}
