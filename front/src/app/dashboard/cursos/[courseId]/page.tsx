"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import {
  Add,
  EditOutlined,
  MenuBookOutlined,
} from "@mui/icons-material";
import { ApiError, apiFetch } from "@/new-services/poo/shared/api/client";
import {
  changeDisciplineStatus,
  type CourseDTO,
  type DisciplineDTO,
  type EntityStatus,
  getCourse,
  listDisciplines,
  listModules,
  listProfessors,
  type ModuleDTO,
  type UserProfileDTO,
} from "@/new-services/poo/shared/api/catalog";
import { listLessons, type LessonDTO } from "@/new-services/poo/shared/api/lessons";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardActions, CardContent } from "@/components/ui/Card";
import { CreateDisciplineModal } from "@/components/catalog/CreateDisciplineModal";
import { EditDisciplineModal } from "@/components/catalog/EditDisciplineModal";
import { EntityStatusToggle } from "@/components/admin/EntityStatusToggle";
import {
  AdminCourseNav,
  adminCourseDetailCrumbs,
  adminCourseListCrumbs,
} from "@/components/admin/AdminCourseNav";

export default function CourseDisciplinesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [disciplines, setDisciplines] = useState<DisciplineDTO[]>([]);
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [professors, setProfessors] = useState<UserProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [disciplineModalOpen, setDisciplineModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<DisciplineDTO | null>(
    null,
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [courseResult, disciplinesResult, modulesResult, professorsResult] =
      await Promise.allSettled([
        getCourse(courseId),
        listDisciplines(courseId),
        listModules(),
        listProfessors(),
      ]);

    if (courseResult.status === "fulfilled") {
      setCourse(courseResult.value);
    } else {
      setCourse(null);
      setError("Curso não encontrado.");
      setLoading(false);
      return;
    }

    if (disciplinesResult.status === "fulfilled") {
      setDisciplines(
        disciplinesResult.value.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"),
        ),
      );
    }

    if (modulesResult.status === "fulfilled") {
      setModules(modulesResult.value);
    }

    const loadedDisciplines =
      disciplinesResult.status === "fulfilled" ? disciplinesResult.value : [];
    const loadedModules =
      modulesResult.status === "fulfilled" ? modulesResult.value : [];
    const disciplineIds = new Set(loadedDisciplines.map((item) => item.id));
    const courseModules = loadedModules.filter((module) =>
      disciplineIds.has(module.disciplineId),
    );

    const [lessonsResults, activitiesResults] = await Promise.all([
      Promise.allSettled(
        courseModules.map((module) => listLessons(module.id)),
      ),
      Promise.allSettled(
        courseModules.map((module) =>
          apiFetch<unknown[]>(`/activities?moduleId=${module.id}`).catch(
            () => [] as unknown[],
          ),
        ),
      ),
    ]);

    const courseLessons = lessonsResults.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );
    setLessons(courseLessons);

    const totalActivities = activitiesResults.reduce((sum, result) => {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        return sum + result.value.length;
      }
      return sum;
    }, 0);
    setActivitiesCount(totalActivities);

    if (professorsResult.status === "fulfilled") {
      setProfessors(professorsResult.value);
    }

    if (
      disciplinesResult.status === "rejected" &&
      modulesResult.status === "rejected"
    ) {
      setError("Não foi possível carregar as disciplinas do curso.");
    }

    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const professorsMap = useMemo(
    () => Object.fromEntries(professors.map((item) => [item.id, item])),
    [professors],
  );

  const courseModules = useMemo(() => {
    const disciplineIds = new Set(disciplines.map((item) => item.id));
    return modules.filter((module) => disciplineIds.has(module.disciplineId));
  }, [disciplines, modules]);

  const activeLessons = lessons.filter((lesson) => lesson.status !== "Inactive");

  async function handleDisciplineStatusChange(
    disciplineId: string,
    status: EntityStatus,
  ) {
    setUpdatingId(disciplineId);
    setFeedback("");
    setError("");

    try {
      await changeDisciplineStatus(disciplineId, status);
      setDisciplines((prev) =>
        prev.map((discipline) =>
          discipline.id === disciplineId ? { ...discipline, status } : discipline,
        ),
      );
      setFeedback(
        status === "Active"
          ? "Disciplina ativada com sucesso."
          : "Disciplina inativada com sucesso.",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível alterar o status da disciplina.",
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

  if (!course) {
    return (
      <Box sx={{ p: 3 }}>
        <AdminCourseNav
          backHref="/dashboard/cursos"
          backLabel="Voltar aos cursos"
          items={adminCourseListCrumbs}
        />
        <Alert severity="error">
          {error || "Curso não encontrado."}
        </Alert>
      </Box>
    );
  }

  const courseStatus = course.status === "Inactive" ? "Inactive" : "Active";

  return (
    <Box sx={{ p: 3 }}>
      <AdminCourseNav
        backHref="/dashboard/cursos"
        backLabel="Voltar aos cursos"
        items={adminCourseDetailCrumbs(course.name)}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          mb: 1,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
            {course.name}
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
            {course.description || "Sem descrição"}
          </Typography>
        </Box>

        <Badge
          color={courseStatus === "Active" ? "success" : "neutral"}
          label={courseStatus === "Active" ? "Ativo" : "Inativo"}
          dot
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3, mt: 2 }}>
        {[
          {
            label: "Módulos no curso",
            value: courseModules.length,
            hint: `em ${disciplines.length} disciplinas`,
          },
          {
            label: "Aulas no curso",
            value: activeLessons.length,
            hint: `de ${lessons.length} cadastradas`,
          },
          {
            label: "Atividades no curso",
            value: activitiesCount,
            hint: "vinculadas aos módulos",
          },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 4 }} sx={{ display: "flex" }}>
            <Card sx={{ width: "100%", height: "100%" }}>
              <CardContent
                className="!p-4"
                sx={{
                  minHeight: 108,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 28, color: "#1f2937" }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.hint}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MenuBookOutlined color="primary" />
          <Typography sx={{ fontWeight: 600 }}>Disciplinas do curso</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDisciplineModalOpen(true)}
          disabled={courseStatus === "Inactive"}
        >
          Nova disciplina
        </Button>
      </Box>

      {disciplines.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Nenhuma disciplina cadastrada neste curso.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {disciplines.map((discipline) => {
            const isUpdating = updatingId === discipline.id;
            const status =
              discipline.status === "Inactive" ? "Inactive" : "Active";
            const professor =
              professorsMap[discipline.responsibleProfessorId ?? ""];

            return (
              <Grid
                size={{ xs: 12, md: 6 }}
                key={discipline.id}
                sx={{ display: "flex" }}
              >
                <Card
                  className={status === "Inactive" ? "opacity-70" : ""}
                  sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 2,
                        mb: 0.5,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: "#1f2937" }}>
                        {discipline.name}
                      </Typography>
                      <Badge
                        color={status === "Active" ? "success" : "neutral"}
                        label={status === "Active" ? "Ativo" : "Inativo"}
                        dot
                      />
                    </Box>
                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                      {professor?.name ?? "Professor não encontrado"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {discipline.description || "Sem descrição"}
                    </Typography>
                    <Badge
                      color="info"
                      label={`${modules.filter((m) => m.disciplineId === discipline.id).length} módulos`}
                    />
                  </CardContent>
                  <CardActions
                    className="!justify-between !items-center !flex-wrap !gap-2 !mt-auto"
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlined />}
                      onClick={() => setEditingDiscipline(discipline)}
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
                          handleDisciplineStatusChange(discipline.id!, next)
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

      <CreateDisciplineModal
        open={disciplineModalOpen}
        onClose={() => setDisciplineModalOpen(false)}
        onSuccess={loadData}
        courseId={course.id}
      />

      <EditDisciplineModal
        open={Boolean(editingDiscipline)}
        discipline={editingDiscipline}
        courseId={course.id}
        onClose={() => setEditingDiscipline(null)}
        onSuccess={loadData}
      />
    </Box>
  );
}
