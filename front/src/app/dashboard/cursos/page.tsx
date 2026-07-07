"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { Add, ChevronRight, EditOutlined } from "@mui/icons-material";
import { ApiError } from "@/new-services/poo/shared/api/client";
import {
  changeCourseStatus,
  type CourseDTO,
  type DisciplineDTO,
  type EntityStatus,
  listCourses,
  listDisciplines,
} from "@/new-services/poo/shared/api/catalog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardActions, CardContent } from "@/components/ui/Card";
import { CreateCourseModal } from "@/components/catalog/CreateCourseModal";
import { EditCourseModal } from "@/components/catalog/EditCourseModal";
import { EntityStatusToggle } from "@/components/admin/EntityStatusToggle";
import {
  AdminCourseNav,
  adminCourseListCrumbs,
} from "@/components/admin/AdminCourseNav";

function CursosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDTO | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [coursesResult, disciplinesResult] = await Promise.allSettled([
      listCourses(),
      listDisciplines(),
    ]);

    if (coursesResult.status === "fulfilled") {
      setCourses(
        coursesResult.value.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"),
        ),
      );
    }

    if (disciplinesResult.status === "fulfilled") {
      setDisciplines(disciplinesResult.value);
    }

    if (
      coursesResult.status === "rejected" &&
      disciplinesResult.status === "rejected"
    ) {
      setError("Não foi possível carregar os cursos.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCourses = courses.filter((course) => course.status !== "Inactive");
  const activeDisciplines = disciplines.filter(
    (discipline) => discipline.status !== "Inactive",
  );

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;

    return courses.filter((course) => {
      const name = (course.name ?? "").toLowerCase();
      const description = (course.description ?? "").toLowerCase();
      return name.includes(searchQuery) || description.includes(searchQuery);
    });
  }, [courses, searchQuery]);

  async function handleCourseStatusChange(courseId: string, status: EntityStatus) {
    setUpdatingId(courseId);
    setFeedback("");
    setError("");

    try {
      await changeCourseStatus(courseId, status);
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, status } : course,
        ),
      );
      setFeedback(
        status === "Active"
          ? "Curso ativado com sucesso."
          : "Curso inativado com sucesso.",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível alterar o status do curso.",
      );
      await loadData();
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <AdminCourseNav
        backHref="/dashboard"
        backLabel="Voltar ao painel"
        items={adminCourseListCrumbs}
      />

      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>
        Gerenciamento de cursos
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 3 }}>
        {searchQuery
          ? `Exibindo ${filteredCourses.length} resultado(s) para "${searchParams.get("q")}".`
          : "Clique em um curso para gerenciar suas disciplinas."}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {feedback && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {feedback}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent className="!p-4">
              <Typography variant="caption" color="text.secondary">
                Cursos ativos
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 28, color: "#1f2937" }}>
                {activeCourses.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                de {courses.length} cadastrados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent className="!p-4">
              <Typography variant="caption" color="text.secondary">
                Disciplinas ativas
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 28, color: "#1f2937" }}>
                {activeDisciplines.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                de {disciplines.length} cadastradas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>Cursos cadastrados</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCourseModalOpen(true)}
        >
          Novo curso
        </Button>
      </Box>

      {filteredCourses.length === 0 ? (
        <Alert
          severity="info"
          action={
            searchQuery ? (
              <Button
                variant="contained"
                size="small"
                onClick={() => router.push("/dashboard/cursos")}
              >
                Limpar busca
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => setCourseModalOpen(true)}
              >
                Cadastrar curso
              </Button>
            )
          }
        >
          {searchQuery
            ? "Nenhum curso encontrado para essa pesquisa."
            : "Nenhum curso cadastrado. Clique para criar o primeiro."}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredCourses.map((course) => {
            const isUpdating = updatingId === course.id;
            const status = course.status === "Inactive" ? "Inactive" : "Active";
            const disciplineCount = disciplines.filter(
              (discipline) => discipline.courseId === course.id,
            ).length;

            return (
              <Grid size={{ xs: 12, md: 6 }} key={course.id}>
                <Card
                  className={status === "Inactive" ? "opacity-70" : ""}
                  hoverable
                  onClick={() => router.push(`/dashboard/cursos/${course.id}`)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: "#1f2937" }}>
                        {course.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Badge
                          color={status === "Active" ? "success" : "neutral"}
                          label={status === "Active" ? "Ativo" : "Inativo"}
                          dot
                        />
                        <ChevronRight sx={{ color: "#9ca3af", fontSize: 20 }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {course.description || "Sem descrição"}
                    </Typography>
                    <Badge
                      color="info"
                      label={`${disciplineCount} disciplinas`}
                    />
                  </CardContent>
                  <CardActions
                    className="!justify-between !items-center !flex-wrap !gap-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlined />}
                      onClick={() => setEditingCourse(course)}
                    >
                      Editar
                    </Button>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <EntityStatusToggle
                        status={status}
                        loading={isUpdating}
                        onToggle={(next) =>
                          handleCourseStatusChange(course.id!, next)
                        }
                      />
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <CreateCourseModal
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        onSuccess={loadData}
      />

      <EditCourseModal
        open={Boolean(editingCourse)}
        course={editingCourse}
        onClose={() => setEditingCourse(null)}
        onSuccess={loadData}
      />
    </Box>
  );
}

export default function CursosPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <CursosPageContent />
    </Suspense>
  );
}
