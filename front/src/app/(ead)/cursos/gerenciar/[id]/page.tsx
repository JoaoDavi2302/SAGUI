"use client";

import { use, useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  ArrowBack,
  EditOutlined,
  LayersOutlined,
  MenuBookOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { CreateDisciplineModal } from "@/components/catalog/CreateDisciplineModal";
import { EditDisciplineModal } from "@/components/catalog/EditDisciplineModal";
import {
  getCourse,
  listDisciplines,
  listModules,
  listProfessors,
  type CourseDTO,
  type DisciplineDTO,
} from "@/new-services/poo/shared/api/catalog";
import { ApiError } from "@/new-services/poo/shared/api/client";

type DisciplineCardItem = DisciplineDTO & {
  professorName: string;
  moduleCount: number;
};

export default function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [disciplines, setDisciplines] = useState<DisciplineCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] =
    useState<DisciplineDTO | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [courseData, disciplineList, modules, professors] = await Promise.all([
        getCourse(id),
        listDisciplines(id),
        listModules(),
        listProfessors(),
      ]);

      const professorsMap = Object.fromEntries(
        professors.map((professor) => [professor.id, professor]),
      );
      const moduleCountByDiscipline = modules.reduce<Record<string, number>>(
        (counts, module) => {
          counts[module.disciplineId] = (counts[module.disciplineId] ?? 0) + 1;
          return counts;
        },
        {},
      );

      setCourse(courseData);
      setDisciplines(
        disciplineList
          .map((discipline) => ({
            ...discipline,
            professorName:
              professorsMap[discipline.responsibleProfessorId]?.name ??
              "Sem professor",
            moduleCount: moduleCountByDiscipline[discipline.id] ?? 0,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );
    } catch (err) {
      setCourse(null);
      setDisciplines([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar o curso.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? "Curso não encontrado."}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/cursos")}>
          Voltar aos cursos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/cursos")}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 24 }}>
              {course.name}
            </Typography>
            <Chip
              size="small"
              label={course.status === "Active" ? "Ativo" : "Inativo"}
              color={course.status === "Active" ? "success" : "default"}
            />
          </Stack>
          <Typography color="text.secondary">
            {course.description?.trim() ||
              "Gerencie as disciplinas deste curso."}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Nova disciplina
        </Button>
      </Box>

      {disciplines.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 8 }}>
          Nenhuma disciplina neste curso. Clique em &quot;Nova disciplina&quot; para
          cadastrar.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {disciplines.map((discipline) => (
            <Grid key={discipline.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: 2,
                  opacity: discipline.status === "Inactive" ? 0.72 : 1,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {discipline.name}
                    </Typography>
                    <Tooltip title="Editar disciplina">
                      <IconButton
                        size="small"
                        onClick={() => setEditingDiscipline(discipline)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, mb: 2 }}
                  >
                    {discipline.description?.trim() || "Sem descrição"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    <Chip
                      icon={<PersonOutlineOutlined />}
                      label={discipline.professorName}
                      size="small"
                    />
                    <Chip
                      icon={<LayersOutlined />}
                      label={`${discipline.moduleCount} módulos`}
                      size="small"
                    />
                    <Chip
                      icon={<MenuBookOutlined />}
                      label={discipline.status === "Active" ? "Ativa" : "Inativa"}
                      size="small"
                      variant="outlined"
                      color={
                        discipline.status === "Active" ? "success" : "default"
                      }
                    />
                  </Stack>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                    onClick={() =>
                      router.push(`/disciplinas/gerenciar/${discipline.id}`)
                    }
                  >
                    Gerenciar disciplina
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateDisciplineModal
        open={createOpen}
        courseId={course.id}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          void load();
        }}
      />

      <EditDisciplineModal
        open={!!editingDiscipline}
        discipline={editingDiscipline}
        courseId={course.id}
        onClose={() => setEditingDiscipline(null)}
        onSuccess={() => {
          void load();
        }}
      />
    </Box>
  );
}
