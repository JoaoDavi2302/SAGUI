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
import { ApiError } from "@/services/api/client";
import {
  createDiscipline,
  listProfessors,
  type CourseDTO,
  type UserProfileDTO,
} from "@/services/api/catalog";

interface CreateDisciplineModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courses: CourseDTO[];
}

export function CreateDisciplineModal({
  open,
  onClose,
  onSuccess,
  courses,
}: CreateDisciplineModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [professors, setProfessors] = useState<UserProfileDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    listProfessors()
      .then((items) => setProfessors(items))
      .catch(() => setError("Não foi possível carregar a lista de professores."));
  }, [open]);

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      await createDiscipline({
        name,
        description: description || undefined,
        courseId,
        responsibleProfessorId: professorId,
      });
      setName("");
      setDescription("");
      setCourseId("");
      setProfessorId("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível cadastrar a disciplina.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Nova disciplina"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading || !name.trim() || !courseId || !professorId
            }
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
          label="Curso"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          fullWidth
          size="small"
        >
          {courses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {course.name}
            </MenuItem>
          ))}
        </TextField>
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
