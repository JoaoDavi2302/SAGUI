"use client";

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
import { Add, EditOutlined, SchoolOutlined } from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateCourseModal } from "@/components/catalog/CreateCourseModal";
import { EditCourseModal } from "@/components/catalog/EditCourseModal";
import {
  listCourses,
  type CourseDTO,
} from "@/new-services/poo/shared/api/catalog";
import { ApiError } from "@/new-services/poo/shared/api/client";

function filterCoursesByQuery(courses: CourseDTO[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return courses;

  return courses.filter((course) => {
    const name = (course.name ?? "").toLowerCase();
    const description = (course.description ?? "").toLowerCase();
    return name.includes(normalized) || description.includes(normalized);
  });
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim();

  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDTO | null>(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCourses(await listCourses());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os cursos.",
      );
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const visibleCourses = useMemo(
    () => filterCoursesByQuery(courses, searchQuery),
    [courses, searchQuery],
  );

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
          <Typography sx={{ fontWeight: 700, fontSize: 24 }}>Cursos</Typography>
          <Typography color="text.secondary">
            {searchQuery
              ? `Exibindo ${visibleCourses.length} resultado(s) para "${searchQuery}".`
              : "Cadastre cursos e gerencie as disciplinas de cada um."}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Novo curso
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : visibleCourses.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 8 }}>
          {searchQuery
            ? "Nenhum curso encontrado para essa busca."
            : 'Nenhum curso cadastrado. Clique em "Novo curso" para começar.'}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {visibleCourses.map((course) => (
            <Grid key={course.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: 2,
                }}
              >
                <Box
                  sx={{
                    height: 120,
                    bgcolor: "#f5f5f5",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <SchoolOutlined sx={{ fontSize: 45, color: "grey.500" }} />
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{course.name}</Typography>
                    <Tooltip title="Editar curso">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingCourse(course);
                        }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    {course.description?.trim() || "Sem descrição"}
                  </Typography>

                  <Chip
                    label={course.status === "Active" ? "Ativo" : "Inativo"}
                    color={course.status === "Active" ? "success" : "default"}
                    size="small"
                  />
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                    onClick={() => router.push(`/cursos/gerenciar/${course.id}`)}
                  >
                    Acessar curso
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateCourseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          void loadCourses();
        }}
      />

      <EditCourseModal
        open={!!editingCourse}
        course={editingCourse}
        onClose={() => setEditingCourse(null)}
        onSuccess={() => {
          void loadCourses();
        }}
      />
    </Box>
  );
}
