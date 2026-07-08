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

import { ViewModule } from "@mui/icons-material";

import { AdminModule } from "@/new-services/poo/module/Roles";

import {
  listCourses,
  listDisciplines,
  CourseDTO,
  DisciplineDTO,
} from "@/new-services/poo/shared/api/catalog";

import {
  ModuleRequestDTO,
} from "@/new-services/poo/shared/api/catalog";

interface Props {
  open: boolean;
  moduleId?: string;
  onClose: (reload?: boolean) => void;
}

const service = new AdminModule();

export default function ModuleModal({
  open,
  moduleId,
  onClose,
}: Props) {
  const isEdit = Boolean(moduleId);

  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDTO[]>([]);

  const [courseId, setCourseId] = useState("");

  const [disciplineId, setDisciplineId] = useState("");

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [orderIndex, setOrderIndex] = useState(1);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function load() {
      const [coursesData, disciplinesData] =
        await Promise.all([
          listCourses(),
          listDisciplines(),
        ]);

      setCourses(coursesData);

      setDisciplines(disciplinesData);

      if (!moduleId) {
        setCourseId("");
        setDisciplineId("");
        setName("");
        setDescription("");
        setOrderIndex(1);
        return;
      }

      const module = await service.get(moduleId);

      setName(module.name);

      setDescription(module.description ?? "");

      setDisciplineId(module.disciplineId);

      setOrderIndex(module.orderIndex);

      const discipline = disciplinesData.find(
        (d) => d.id === module.disciplineId,
      );

      if (discipline) {
        setCourseId(discipline.courseId);
      }
    }

    load();
  }, [open, moduleId]);

  async function handleSave() {
    try {
      setSaving(true);

      const payload: ModuleRequestDTO = {
        name,
        description,
        orderIndex,
        disciplineId,
      };

      if (isEdit) {
        await service.update(moduleId!, payload);
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

  const filteredDisciplines = disciplines.filter(
    (discipline) => discipline.courseId === courseId,
  );

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center" }}
        >
          <ViewModule />

          <Box>
            <Typography variant="h5">
              {isEdit ? "Editar Módulo" : "Novo Módulo"}
            </Typography>

            <Typography variant="body2">
              {isEdit
                ? "Atualize as informações do módulo."
                : "Cadastre um novo módulo."}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid
          container
          spacing={2}
          sx={{ mt: 0.5 }}
        >
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Nome"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descrição"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Curso"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setDisciplineId("");
              }}
            >
              {courses.map((course) => (
                <MenuItem
                  key={course.id}
                  value={course.id}
                >
                  {course.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Disciplina"
              value={disciplineId}
              onChange={(e) =>
                setDisciplineId(e.target.value)
              }
            >
              {filteredDisciplines.map(
                (discipline) => (
                  <MenuItem
                    key={discipline.id}
                    value={discipline.id}
                  >
                    {discipline.name}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Ordem"
              value={orderIndex}
              onChange={(e) =>
                setOrderIndex(
                  Number(e.target.value),
                )
              }
            />
          </Grid>

          {isEdit && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                ID: {moduleId}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {isEdit
            ? "Salvar Alterações"
            : "Criar Módulo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}