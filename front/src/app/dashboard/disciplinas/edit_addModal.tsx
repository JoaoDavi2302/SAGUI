"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { useEffect, useMemo, useState } from "react";
>>>>>>> origin/develop

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
<<<<<<< HEAD
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

=======
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

>>>>>>> origin/develop
export default function DisciplineModal({
  open,
  disciplineId,
  onClose,
}: Props) {
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/develop
      }

      onClose(true);
    } catch (err: any) {
      alert(err.message);
<<<<<<< HEAD
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
=======
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
>>>>>>> origin/develop
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/develop
                : "Cadastre uma nova disciplina."}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
<<<<<<< HEAD
              fullWidth
              label="Nome"
=======
              label="Nome"
              fullWidth
>>>>>>> origin/develop
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
<<<<<<< HEAD
              fullWidth
              multiline
              rows={4}
              label="Descrição"
=======
              label="Descrição"
              multiline
              rows={4}
              fullWidth
>>>>>>> origin/develop
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
<<<<<<< HEAD
              fullWidth
              label="Curso"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
=======
              label="Curso"
              fullWidth
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
            >
              {courses.map((course: any) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.nome}
>>>>>>> origin/develop
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
<<<<<<< HEAD
              fullWidth
              label="Professor Responsável"
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
            >
              {professors.map((professor) => (
                <MenuItem key={professor.id} value={professor.id}>
                  {professor.name}
=======
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
>>>>>>> origin/develop
                </MenuItem>
              ))}
            </TextField>
          </Grid>

<<<<<<< HEAD
          {isEdit && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                ID: {disciplineId}
=======
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
>>>>>>> origin/develop
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Cancelar</Button>

<<<<<<< HEAD
        <Button variant="contained" onClick={handleSave} disabled={saving}>
=======
        <Button variant="contained" onClick={handleSave}>
>>>>>>> origin/develop
          {isEdit ? "Salvar Alterações" : "Criar Disciplina"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
