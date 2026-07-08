"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  Stack,
} from "@mui/material";

import { MenuBook } from "@mui/icons-material";

import { AdminDiscipline } from "@/new-services/poo/discipline/Roles";

import {
  listCourses,
  listProfessors,
  CourseDTO,
  UserProfileDTO,
  DisciplineRequestDTO,
} from "@/new-services/poo/shared/api/catalog";

interface Props {
  open: boolean;
  disciplineId?: string;
  onClose: (reload?: boolean) => void;
}

const service = new AdminDiscipline();

export default function DisciplineModal({
  open,
  disciplineId,
  onClose,
}: Props) {
  const isEdit = Boolean(disciplineId);

  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [professors, setProfessors] = useState<UserProfileDTO[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [courseId, setCourseId] = useState("");
  const [professorId, setProfessorId] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function load() {
      const [coursesData, professorsData] = await Promise.all([
        listCourses(),
        listProfessors(),
      ]);

      setCourses(coursesData);
      setProfessors(professorsData);

      if (!disciplineId) {
        setName("");
        setDescription("");
        setCourseId("");
        setProfessorId("");
        return;
      }

      const discipline = await service.get(disciplineId);

      setName(discipline.name);
      setDescription(discipline.description ?? "");
      setCourseId(discipline.courseId);
      setProfessorId(discipline.responsibleProfessorId);
    }

    load();
  }, [open, disciplineId]);

  async function handleSave() {
    try {
      setSaving(true);

      const payload: DisciplineRequestDTO = {
        name,
        description,
        courseId,
        responsibleProfessorId: professorId,
      };

      if (isEdit) {
        await service.update(disciplineId!, payload);
      } else {
        await service.create(payload);
      }

      onClose(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <MenuBook />

          <Box>
            <Typography variant="h5">
              {isEdit ? "Editar Disciplina" : "Nova Disciplina"}
            </Typography>

            <Typography variant="body2">
              {isEdit
                ? "Atualize as informações."
                : "Cadastre uma nova disciplina."}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Curso"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Professor Responsável"
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
            >
              {professors.map((professor) => (
                <MenuItem key={professor.id} value={professor.id}>
                  {professor.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {isEdit && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                ID: {disciplineId}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Cancelar</Button>

        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {isEdit ? "Salvar Alterações" : "Criar Disciplina"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
