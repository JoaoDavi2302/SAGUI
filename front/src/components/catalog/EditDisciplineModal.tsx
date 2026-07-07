"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/new-services/poo/shared/api/client";
import {
  type DisciplineDTO,
  listProfessors,
  updateDiscipline,
  type UserProfileDTO,
} from "@/new-services/poo/shared/api/catalog";

interface EditDisciplineModalProps {
  open: boolean;
  discipline: DisciplineDTO | null;
  courseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDisciplineModal({
  open,
  discipline,
  courseId,
  onClose,
  onSuccess,
}: EditDisciplineModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [professors, setProfessors] = useState<UserProfileDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !discipline) return;
    setName(discipline.name ?? "");
    setDescription(discipline.description ?? "");
    setProfessorId(discipline.responsibleProfessorId ?? "");
    setError("");
  }, [open, discipline]);

  useEffect(() => {
    if (!open) return;

    listProfessors()
      .then((items) => setProfessors(items))
      .catch(() => setError("Não foi possível carregar a lista de professores."));
  }, [open]);

  async function handleSubmit() {
    if (!discipline?.id) return;

    setLoading(true);
    setError("");

    try {
      await updateDiscipline(discipline.id, {
        name,
        description: description || undefined,
        courseId,
        responsibleProfessorId: professorId,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível atualizar a disciplina.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Editar disciplina"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !professorId}
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
          label="Nome da disciplina"
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
          select
          label="Professor responsável"
          value={professorId}
          onChange={(e) => setProfessorId(e.target.value)}
          required
          fullWidth
          size="small"
        >
          {professors.map((professor) => (
            <MenuItem key={professor.id} value={professor.id}>
              {professor.name} ({professor.email})
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Modal>
  );
}
