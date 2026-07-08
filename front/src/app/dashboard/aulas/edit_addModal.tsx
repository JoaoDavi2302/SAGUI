"use client";

import { useEffect, useMemo, useState } from "react";

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

import { Article } from "@mui/icons-material";

import { AdminLesson } from "@/new-services/poo/lessons/Roles";

import {
  listCourses,
  listDisciplines,
  listModules,
  CourseDTO,
  DisciplineDTO,
  ModuleDTO,
} from "@/new-services/poo/shared/api/catalog";

import {
  LessonRequestDTO,
} from "@/new-services/poo/shared/api/lessons";

interface Props {
  open: boolean;
  lessonId?: string;
  onClose: (reload?: boolean) => void;
}

const service = new AdminLesson();

export default function LessonModal({
  open,
  lessonId,
  onClose,
}: Props) {
  const isEdit = Boolean(lessonId);

  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDTO[]>([]);
  const [modules, setModules] = useState<ModuleDTO[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [courseId, setCourseId] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [moduleId, setModuleId] = useState("");

  const [orderIndex, setOrderIndex] = useState(1);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function load() {
      const [coursesData, disciplinesData, modulesData] =
        await Promise.all([
          listCourses(),
          listDisciplines(),
          listModules(),
        ]);

      setCourses(coursesData);
      setDisciplines(disciplinesData);
      setModules(modulesData);

      if (!lessonId) {
        setName("");
        setDescription("");
        setCourseId("");
        setDisciplineId("");
        setModuleId("");
        setOrderIndex(1);
        return;
      }

      const lesson = await service.get(lessonId);

      const module = modulesData.find(
        (m) => m.id === lesson.moduleId,
      );

      const discipline = disciplinesData.find(
        (d) => d.id === module?.disciplineId,
      );

      setName(lesson.name);
      setDescription(lesson.description ?? "");
      setOrderIndex(lesson.orderIndex);

      setModuleId(lesson.moduleId);
      setDisciplineId(discipline?.id ?? "");
      setCourseId(discipline?.courseId ?? "");
    }

    load();
  }, [open, lessonId]);

  const filteredDisciplines = useMemo(
    () =>
      disciplines.filter(
        (d) => d.courseId === courseId,
      ),
    [disciplines, courseId],
  );

  const filteredModules = useMemo(
    () =>
      modules.filter(
        (m) => m.disciplineId === disciplineId,
      ),
    [modules, disciplineId],
  );

  async function handleSave() {
    try {
      setSaving(true);

      const payload: LessonRequestDTO = {
        name,
        description,
        orderIndex,
        moduleId,
      };

      if (isEdit) {
        await service.update(lessonId!, payload);
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
        <Stack direction="row" spacing={2} sx={{alignItems:"center"}}>
          <Article />

          <Box>
            <Typography variant="h5">
              {isEdit ? "Editar Aula" : "Nova Aula"}
            </Typography>

            <Typography variant="body2">
              {isEdit
                ? "Atualize as informações da aula."
                : "Cadastre uma nova aula."}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: .5 }}>
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
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField
              select
              fullWidth
              label="Curso"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setDisciplineId("");
                setModuleId("");
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

          <Grid size={{ xs: 4 }}>
            <TextField
              select
              fullWidth
              label="Disciplina"
              value={disciplineId}
              onChange={(e) => {
                setDisciplineId(e.target.value);
                setModuleId("");
              }}
            >
              {filteredDisciplines.map((discipline) => (
                <MenuItem
                  key={discipline.id}
                  value={discipline.id}
                >
                  {discipline.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField
              select
              fullWidth
              label="Módulo"
              value={moduleId}
              onChange={(e) =>
                setModuleId(e.target.value)
              }
            >
              {filteredModules.map((module) => (
                <MenuItem
                  key={module.id}
                  value={module.id}
                >
                  {module.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Ordem"
              value={orderIndex}
              onChange={(e) =>
                setOrderIndex(Number(e.target.value))
              }
            />
          </Grid>

          {isEdit && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                ID: {lessonId}
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
            : "Criar Aula"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}