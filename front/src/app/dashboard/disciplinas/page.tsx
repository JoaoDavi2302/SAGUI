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

const ALL_COURSES = "all";

export default function GerenciarDisciplinasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim();
  const courseFromUrl = (searchParams.get("course") ?? "").trim();

  const [disciplines, setDisciplines] = useState<AdminDisciplineItem[]>([]);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [filterCourseId, setFilterCourseId] = useState(
    courseFromUrl || ALL_COURSES,
  );
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

      setCreateCourseId((current) => {
        if (current && courseList.some((course) => course.id === current)) {
          return current;
        }
        if (
          courseFromUrl &&
          courseList.some((course) => course.id === courseFromUrl)
        ) {
          return courseFromUrl;
        }
        return courseList[0]?.id || "";
      });

      setFilterCourseId((current) => {
        if (current === ALL_COURSES) return ALL_COURSES;
        if (courseList.some((course) => course.id === current)) return current;
        if (
          courseFromUrl &&
          courseList.some((course) => course.id === courseFromUrl)
        ) {
          return courseFromUrl;
        }
        return ALL_COURSES;
      });
    } catch {
      setError("Não foi possível carregar as disciplinas.");
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  }, [courseFromUrl]);

  useEffect(() => {
    void loadDisciplines();
  }, [loadDisciplines]);

  useEffect(() => {
    if (courseFromUrl) {
      setFilterCourseId(courseFromUrl);
      setCreateCourseId(courseFromUrl);
    }
  }, [courseFromUrl]);

  const filteredDisciplines = useMemo(
    () =>
      filterAdminDisciplines(
        disciplines,
        searchQuery,
        filterCourseId === ALL_COURSES ? null : filterCourseId,
      ),
    [disciplines, searchQuery, filterCourseId],
  );

  function handleCourseFilterChange(courseId: string) {
    setFilterCourseId(courseId);
    if (courseId !== ALL_COURSES) {
      setCreateCourseId(courseId);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (courseId === ALL_COURSES) {
      params.delete("course");
    } else {
      params.set("course", courseId);
    }
    const query = params.toString();
    router.replace(
      query ? `/dashboard/disciplinas?${query}` : "/dashboard/disciplinas",
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedCourseName =
    filterCourseId === ALL_COURSES
      ? null
      : courses.find((course) => course.id === filterCourseId)?.name;

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
            {searchQuery || selectedCourseName
              ? `Exibindo ${filteredDisciplines.length} disciplina(s)${
                  selectedCourseName ? ` de "${selectedCourseName}"` : ""
                }${searchQuery ? ` para "${searchQuery}"` : ""}.`
              : `Gerencie as disciplinas e o conteúdo de cada uma (${disciplines.length}).`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {courses.length > 0 && (
            <TextField
              select
              size="small"
              label="Filtrar por curso"
              value={filterCourseId}
              onChange={(event) => handleCourseFilterChange(event.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value={ALL_COURSES}>Todos os cursos</MenuItem>
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
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: "center" }}
                    >
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
                      router.push(`/dashboard/disciplinas/${discipline.id}`)
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
              {searchQuery || filterCourseId !== ALL_COURSES
                ? "Nenhuma disciplina encontrada para esses filtros."
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
