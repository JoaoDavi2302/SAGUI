"use client";

import {
  Add,
  EditOutlined,
  LayersOutlined,
  MenuBookOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";
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
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type AdminDisciplineItem,
  fetchAdminDisciplines,
  filterAdminDisciplines,
} from "@/components/admin/adminDisciplineData";
import { CreateDisciplineModal } from "@/components/catalog/CreateDisciplineModal";
import { EditDisciplineModal } from "@/components/catalog/EditDisciplineModal";
import { Badge } from "@/components/ui/Badge";
import {
  listCourses,
  type CourseDTO,
  type DisciplineDTO,
} from "@/new-services/poo/shared/api/catalog";

export default function AdminDisciplinesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim();

  const [disciplines, setDisciplines] = useState<AdminDisciplineItem[]>([]);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createCourseId, setCreateCourseId] = useState("");
  const [editingDiscipline, setEditingDiscipline] =
    useState<DisciplineDTO | null>(null);

  const loadDisciplines = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [disciplineList, courseList] = await Promise.all([
        fetchAdminDisciplines(),
        listCourses(),
      ]);
      setDisciplines(disciplineList);
      setCourses(courseList);
      setCreateCourseId((current) => current || courseList[0]?.id || "");
    } catch {
      setError("Não foi possível carregar as disciplinas.");
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDisciplines();
  }, [loadDisciplines]);

  const filteredDisciplines = useMemo(
    () => filterAdminDisciplines(disciplines, searchQuery),
    [disciplines, searchQuery],
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
          <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
            Disciplinas
          </Typography>
          <Typography color="text.secondary">
            {searchQuery
              ? `Exibindo ${filteredDisciplines.length} resultado(s) para "${searchQuery}".`
              : "Gerencie as disciplinas e o conteúdo de cada uma."}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {courses.length > 0 && (
            <TextField
              select
              size="small"
              label="Curso"
              value={createCourseId}
              onChange={(event) => setCreateCourseId(event.target.value)}
              sx={{ minWidth: 180 }}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            disabled={!createCourseId}
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Nova disciplina
          </Button>
        </Stack>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {searchQuery ? (
        <Box sx={{ mb: 3 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push("/disciplinas")}
          >
            Limpar busca
          </Button>
        </Box>
      ) : null}

      <Grid container spacing={3}>
        {filteredDisciplines.map((discipline) => {
          const isInactive = discipline.status === "Inactive";

          return (
            <Grid key={discipline.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: 2,
                  opacity: isInactive ? 0.72 : 1,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {discipline.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <Badge
                        color={isInactive ? "neutral" : "success"}
                        label={isInactive ? "Inativa" : "Ativa"}
                        dot
                      />
                      <Tooltip title="Editar disciplina">
                        <IconButton
                          size="small"
                          onClick={() => setEditingDiscipline(discipline)}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {discipline.description || "Sem descrição"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}
                  >
                    <Chip
                      icon={<MenuBookOutlined />}
                      label={discipline.courseName}
                      size="small"
                    />
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
          );
        })}

        {filteredDisciplines.length === 0 && (
          <Grid size={12}>
            <Typography align="center" color="text.secondary">
              {searchQuery
                ? "Nenhuma disciplina encontrada para essa busca."
                : "Nenhuma disciplina cadastrada."}
            </Typography>
          </Grid>
        )}
      </Grid>

      {createCourseId ? (
        <CreateDisciplineModal
          open={createOpen}
          courseId={createCourseId}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            void loadDisciplines();
          }}
        />
      ) : null}

      {editingDiscipline ? (
        <EditDisciplineModal
          open={!!editingDiscipline}
          discipline={editingDiscipline}
          courseId={editingDiscipline.courseId}
          onClose={() => setEditingDiscipline(null)}
          onSuccess={() => {
            void loadDisciplines();
          }}
        />
      ) : null}
    </Box>
  );
}
