"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  Add,
  AdminPanelSettingsOutlined,
  ArrowRightAltOutlined,
  EditOutlined,
  PeopleOutlined,
  PersonOutlineOutlined,
  SchoolOutlined,
  TimelineOutlined,
} from "@mui/icons-material";
import { useUser } from "@/services/auth/AuthContext";
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
  UserProfileDTO,
} from "@/services/api/catalog";
import { listUsers } from "@/services/api/users";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardActions, CardContent } from "@/components/ui/Card";
import { CreateCourseModal } from "@/components/catalog/CreateCourseModal";
import { CreateDisciplineModal } from "@/components/catalog/CreateDisciplineModal";
import { EditCourseModal } from "@/components/catalog/EditCourseModal";
import { EditDisciplineModal } from "@/components/catalog/EditDisciplineModal";
import { EntityStatusToggle } from "@/components/admin/EntityStatusToggle";
import { getRoleOption } from "@/components/admin/RoleSelect";

const ROLE_CHIP_COLOR: Record<string, "primary" | "secondary" | "default"> = {
  Admin: "primary",
  Professor: "secondary",
  Aluno: "default",
};

export default function DashboardPage() {
  const { user } = useUser();

  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDTO[]>([]);
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [users, setUsers] = useState<UserProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [tab, setTab] = useState(0);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDTO | null>(null);
  const [editingDiscipline, setEditingDiscipline] = useState<DisciplineDTO | null>(
    null,
  );
  const [disciplineModalOpen, setDisciplineModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingType, setUpdatingType] = useState<"course" | "discipline" | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [coursesResult, disciplinesResult, modulesResult, usersResult] =
      await Promise.allSettled([
        listCourses(),
        listDisciplines(),
        listModules(),
        listUsers(),
      ]);

    if (coursesResult.status === "fulfilled") {
      setCourses(
        coursesResult.value.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"),
        ),
      );
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

    if (usersResult.status === "fulfilled") {
      setUsers(
        usersResult.value.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"),
        ),
      );
    }

    if (
      coursesResult.status === "rejected" &&
      disciplinesResult.status === "rejected" &&
      usersResult.status === "rejected"
    ) {
      setError("Não foi possível carregar os dados do painel.");
    }

    setLoading(false);
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
  const adminCount = users.filter((item) => item.role === "Admin").length;
  const recentUsers = users.slice(0, 5);
  const previewCourses = courses.slice(0, 3);

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
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          Painel Administrativo
        </Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1 }}>
          Olá, {user?.name ?? "Administrador"}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        Painel Administrativo
      </Typography>

      <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
        Olá, {user?.name ?? "Administrador"}
      </Typography>

      <Typography sx={{ color: "text.secondary", mb: 4 }}>
        Gerencie usuários, cursos e acompanhe os indicadores da plataforma.
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

      {/* Indicadores */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          {
            label: "Usuários",
            value: users.length,
            icon: <PeopleOutlined />,
          },
          {
            label: "Cursos",
            value: courses.length,
            icon: <SchoolOutlined />,
          },
          {
            label: "Disciplinas",
            value: disciplines.length,
            icon: <TimelineOutlined />,
          },
          {
            label: "Administradores",
            value: adminCount,
            icon: <AdminPanelSettingsOutlined />,
          },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <MuiCard sx={{ borderRadius: 3, height: "100%" }}>
              <MuiCardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {item.value}
                  </Typography>
                </Box>
                <Typography sx={{ mt: 2 }} color="text.secondary">
                  {item.label}
                </Typography>
              </MuiCardContent>
            </MuiCard>
          </Grid>
        ))}
      </Grid>

      {/* Prévia de cursos */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Cursos cadastrados
        </Typography>
        <Box
          component="button"
          onClick={() => setTab(0)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            border: "none",
            bgcolor: "transparent",
            color: "primary.main",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            p: 0,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Gerenciar
          <ArrowRightAltOutlined fontSize="small" />
        </Box>
      </Box>

      {previewCourses.length === 0 ? (
        <Alert
          severity="info"
          sx={{ mb: 5, borderRadius: 2 }}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => setCourseModalOpen(true)}
            >
              Cadastrar
            </Button>
          }
        >
          Nenhum curso cadastrado ainda.
        </Alert>
      ) : (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {previewCourses.map((course) => {
            const isActive = course.status !== "Inactive";

            return (
              <Grid key={course.id} size={{ xs: 12, md: 4 }}>
                <MuiCard sx={{ borderRadius: 3, height: "100%" }}>
                  <MuiCardContent>
                    <Typography sx={{ fontWeight: 700 }}>{course.name}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {course.description || "Sem descrição"}
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <Chip
                        label={isActive ? "Ativo" : "Inativo"}
                        color={isActive ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </MuiCardContent>
                </MuiCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Últimos usuários */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Últimos usuários
        </Typography>
        <Link
          href="/dashboard/usuarios"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            color: "inherit",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          Ver todos
          <ArrowRightAltOutlined fontSize="small" />
        </Link>
      </Box>

      <MuiCard sx={{ borderRadius: 3, mb: 5 }}>
        <List>
          {recentUsers.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="Nenhum usuário encontrado"
                secondary="Os usuários cadastrados aparecerão aqui."
              />
            </ListItem>
          ) : (
            recentUsers.map((item, index) => (
              <Box key={item.id}>
                <ListItem>
                  <PersonOutlineOutlined sx={{ mr: 2, color: "text.secondary" }} />
                  <ListItemText primary={item.name} secondary={item.email} />
                  <Chip
                    label={getRoleOption(item.role).label}
                    color={ROLE_CHIP_COLOR[item.role] ?? "default"}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={item.status === "Inactive" ? "Inativo" : "Ativo"}
                    color={item.status === "Inactive" ? "default" : "success"}
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
                {index < recentUsers.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </MuiCard>

      {/* Status da plataforma */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Status da plataforma
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MuiCard sx={{ borderRadius: 3 }}>
            <MuiCardContent>
              <Typography sx={{ fontWeight: 700 }}>Sistema</Typography>
              <Typography color="success.main" sx={{ mt: 1 }}>
                ● Operando normalmente
              </Typography>
            </MuiCardContent>
          </MuiCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <MuiCard sx={{ borderRadius: 3 }}>
            <MuiCardContent>
              <Typography sx={{ fontWeight: 700 }}>Cursos ativos</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {activeCourses.length} de {courses.length} cursos disponíveis
              </Typography>
            </MuiCardContent>
          </MuiCard>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Gestão completa */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
        Gestão do catálogo
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 3 }}>
        Crie, edite e altere o status de cursos e disciplinas.
      </Typography>

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
            <Alert
              severity="info"
              action={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setCourseModalOpen(true)}
                >
                  Cadastrar curso
                </Button>
              }
            >
              Nenhum curso cadastrado. Clique para criar o primeiro.
            </Alert>
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
                      <CardActions className="!justify-between !items-center !flex-wrap !gap-2">
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
            <Alert
              severity="info"
              action={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setDisciplineModalOpen(true)}
                  disabled={activeCourses.length === 0}
                >
                  Cadastrar disciplina
                </Button>
              }
            >
              {activeCourses.length === 0
                ? "Cadastre um curso ativo antes de criar disciplinas."
                : "Nenhuma disciplina cadastrada. Clique para criar a primeira."}
            </Alert>
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
                      <CardActions className="!justify-between !items-center !flex-wrap !gap-2">
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
        </Box>
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

      <EditDisciplineModal
        open={Boolean(editingDiscipline)}
        discipline={editingDiscipline}
        courses={courses}
        onClose={() => setEditingDiscipline(null)}
        onSuccess={loadData}
      />

      <CreateDisciplineModal
        open={disciplineModalOpen}
        onClose={() => setDisciplineModalOpen(false)}
        onSuccess={loadData}
        courses={activeCourses}
      />
    </Box>
  );
}
