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
  Typography,
  Box,
  Stack,
} from "@mui/material";

import { School } from "@mui/icons-material";

import {
  CourseRequestDTO,
  getCourse,
} from "@/new-services/poo/shared/api/catalog";

import { AdminCourse } from "@/new-services/poo/course/Roles";

interface Props {
  open: boolean;
  courseId?: string;
  onClose: (reload?: boolean) => void;
}

const service = new AdminCourse();

export default function CourseModal({ open, courseId, onClose }: Props) {
  const isEdit = Boolean(courseId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function load() {
      if (!courseId) {
        setName("");
        setDescription("");

        return;
      }

      const course = await getCourse(courseId);

      setName(course.name);
      setDescription(course.description ?? "");
    }

    load();
  }, [open, courseId]);

  async function handleSave() {
    try {
      setSaving(true);

      const payload: CourseRequestDTO = {
        name,
        description,
      };

      if (isEdit) {
        await service.updateCourse(courseId!, payload);
      } else {
        await service.createCourse(payload);
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
          <School />

          <Box>
            <Typography variant="h5">
              {isEdit ? "Editar Curso" : "Novo Curso"}
            </Typography>

            <Typography variant="body2">
              {isEdit
                ? "Atualize as informações do curso."
                : "Cadastre um novo curso."}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
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

          {isEdit && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                ID: {courseId}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Cancelar</Button>

        <Button variant="contained" disabled={saving} onClick={handleSave}>
          {isEdit ? "Salvar Alterações" : "Criar Curso"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
