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
  Paper,
  Divider,
  Stack,
} from "@mui/material";

import { MenuBook, School, Person, Save, Add } from "@mui/icons-material";
import { useUser } from "@/services/auth/AuthContext";

import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";
import { CreateDisciplineDTO } from "@/services/poo/discipline/discipline";

const database = DatabaseProvider.getDatabase();

interface Props {
  open: boolean;
  disciplineId?: number;
  onClose: (reload?: boolean) => void;
}

export default function DisciplineModal({
  open,
  disciplineId,
  onClose,
}: Props) {
  const { user, effectiveRole } = useUser();

  const provider = useMemo(() => {
    if (!user) return null;

    return DisciplineProvider.create("ADMINISTRADOR", database, user);
  }, [user]);

  const professors = useMemo(() => {
    if (!provider) return [];

    return provider.listProfessors();
  }, [provider]);

  const isEdit = Boolean(disciplineId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<number | "">("");
  const [professorId, setProfessorId] = useState<number | "">("");
  // const [workload, setWorkload] = useState(60);
  const [orderIndex, setOrderIndex] = useState(1);

  useEffect(() => {
    if (!provider || !open) return;

    if (!disciplineId) {
      setName("");
      setDescription("");
      setCourseId("");
      setProfessorId("");
      // setWorkload(60);
      setOrderIndex(1);
      return;
    }

    const discipline = provider.getDiscipline(disciplineId);
    // const professors = provider?.listProfessors() ?? [];

    if (!discipline) return;

    setName(discipline.nome);
    setDescription(discipline.descricao);
    setCourseId(discipline.curso_id);
    setProfessorId(discipline.professor_id ?? "");
    // setWorkload(discipline.workload);
    // setOrderIndex(discipline.order_index);
  }, [disciplineId, provider, open]);

  const courses = useMemo(() => {
    if (!provider) return [];

    return provider.listCourses();
  }, [provider]);

  console.log(database.usuarios);

  const handleSave = () => {
    if (!provider) return;

    const payload: CreateDisciplineDTO = {
      curso_id: Number(courseId),
      professor_id: Number(professorId),
      nome: name,
      descricao: description,
    };

    try {
      if (isEdit) {
        provider.updateDiscipline(disciplineId!, payload);
      } else {
        provider.createDiscipline(payload);
      }

      onClose(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      fullWidth
      maxWidth="md"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 2.5,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <MenuBook sx={{ fontSize: 36 }} />

          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {isEdit ? "Editar Disciplina" : "Nova Disciplina"}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {isEdit
                ? "Atualize as informações da disciplina."
                : "Cadastre uma nova disciplina."}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Nome"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Descrição"
              multiline
              rows={4}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              label="Curso"
              fullWidth
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
            >
              {courses.map((course: any) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.nome}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              label="Professor"
              fullWidth
              value={professorId}
              onChange={(e) =>
                setProfessorId(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            >
              <MenuItem value="">Nenhum</MenuItem>

              {professors.map((p: any) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nome}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* <Grid size={{ xs: 6 }}>
            <TextField
              type="number"
              label="Carga Horária"
              fullWidth
              value={workload}
              onChange={(e) => setWorkload(Number(e.target.value))}
            />
          </Grid> */}

          <Grid size={{ xs: 6 }}>
            <TextField
              type="number"
              label="Ordem"
              fullWidth
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />
          </Grid>

          {isEdit && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                ID da disciplina: {disciplineId}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Cancelar</Button>

        <Button variant="contained" onClick={handleSave}>
          {isEdit ? "Salvar Alterações" : "Criar Disciplina"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
