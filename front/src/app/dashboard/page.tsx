"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { ApiError } from "@/services/api/client";
import {
  changeCourseStatus,
  changeDisciplineStatus,
  CourseDTO,
  DisciplineDTO,
  EntityStatus,
  listCourses,
  listDisciplines,
  listModules,
  ModuleDTO,
} from "@/services/api/catalog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardActions, CardContent } from "@/components/ui/Card";
import { CreateCourseModal } from "@/components/catalog/CreateCourseModal";
import { CreateDisciplineModal } from "@/components/catalog/CreateDisciplineModal";
import { EntityStatusToggle } from "@/components/admin/EntityStatusToggle";

export default function DashboardPage() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDTO[]>([]);
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [tab, setTab] = useState(0);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [disciplineModalOpen, setDisciplineModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingType, setUpdatingType] = useState<"course" | "discipline" | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [coursesData, disciplinesData, modulesData] = await Promise.all([
        listCourses(),
        listDisciplines(),
        listModules(),
      ]);

      setCourses(
        coursesData.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt-BR")),
      );
      setDisciplines(
        disciplinesData.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"),
        ),
      );
      setModules(modulesData);
    } catch {
      setError("Não foi possível carregar os dados do painel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const coursesMap = useMemo(
    () => Object.fromEntries(courses.map((course) => [course.id, course])),
    [courses],
  );

  const activeCourses = courses.filter((course) => course.status !== "Inactive");
  const activeDisciplines = disciplines.filter(
    (discipline) => discipline.status !== "Inactive",
  );

  async function handleCourseStatusChange(courseId: string, status: EntityStatus) {
    setUpdatingId(courseId);
    setUpdatingType("course");
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
      setUpdatingType(null);
    }
  }

  async function handleDisciplineStatusChange(
    disciplineId: string,
    status: EntityStatus,
  ) {
    setUpdatingId(disciplineId);
    setUpdatingType("discipline");
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
      setUpdatingType(null);
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
      <Typography sx={{ fontSize: 24, fontWeight: "bold", mb: 0.5 }}>
        Painel administrativo
      </Typography>
      <Typography sx={{ fontSize: 14, color: "gray", mb: 3 }}>
        Gestão de cursos e disciplinas do sistema
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {feedback && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {feedback}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent className="!p-4">
              <Typography variant="caption" color="text.secondary">
                Módulos
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 28, color: "#1f2937" }}>
                {modules.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label="Cursos" />
        <Tab label="Disciplinas" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>Gestão de cursos</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCourseModalOpen(true)}
            >
              Novo curso
            </Button>
          </Box>

          {courses.length === 0 ? (
            <Alert severity="info">Nenhum curso cadastrado.</Alert>
          ) : (
            <Grid container spacing={2}>
              {courses.map((course) => {
                const isUpdating =
                  updatingId === course.id && updatingType === "course";
                const status = course.status === "Inactive" ? "Inactive" : "Active";

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={course.id}>
                    <Card className={status === "Inactive" ? "opacity-70" : ""}>
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
                          <Badge
                            color={status === "Active" ? "success" : "neutral"}
                            label={status === "Active" ? "Ativo" : "Inativo"}
                            dot
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {course.description || "Sem descrição"}
                        </Typography>
                        <Badge
                          color="info"
                          label={`${disciplines.filter((d) => d.courseId === course.id).length} disciplinas`}
                        />
                      </CardContent>
                      <CardActions className="!justify-between !items-center">
                        <Typography variant="caption" color="text.secondary">
                          Alterar status
                        </Typography>
                        <EntityStatusToggle
                          status={status}
                          loading={isUpdating}
                          onToggle={(next) =>
                            handleCourseStatusChange(course.id!, next)
                          }
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>Gestão de disciplinas</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDisciplineModalOpen(true)}
            >
              Nova disciplina
            </Button>
          </Box>

          {disciplines.length === 0 ? (
            <Alert severity="info">Nenhuma disciplina cadastrada.</Alert>
          ) : (
            <Grid container spacing={2}>
              {disciplines.map((discipline) => {
                const isUpdating =
                  updatingId === discipline.id && updatingType === "discipline";
                const status =
                  discipline.status === "Inactive" ? "Inactive" : "Active";

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={discipline.id}>
                    <Card className={status === "Inactive" ? "opacity-70" : ""}>
                      <CardContent>
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
                          {coursesMap[discipline.courseId ?? ""]?.name ??
                            "Curso não encontrado"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {discipline.description || "Sem descrição"}
                        </Typography>
                        <Badge
                          color="info"
                          label={`${modules.filter((m) => m.disciplineId === discipline.id).length} módulos`}
                        />
                      </CardContent>
                      <CardActions className="!justify-between !items-center">
                        <Typography variant="caption" color="text.secondary">
                          Alterar status
                        </Typography>
                        <EntityStatusToggle
                          status={status}
                          loading={isUpdating}
                          onToggle={(next) =>
                            handleDisciplineStatusChange(discipline.id!, next)
                          }
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      <CreateCourseModal
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        onSuccess={loadData}
      />

      <CreateDisciplineModal
        open={disciplineModalOpen}
        onClose={() => setDisciplineModalOpen(false)}
        onSuccess={loadData}
        courses={courses.map((course) => ({
          id: course.id ?? "",
          name: course.name ?? "",
          area: course.description ?? "",
          workload: 0,
        }))}
      />
    </Box>
  );
}
