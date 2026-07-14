"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  Typography,
  LinearProgress,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  ArrowRightAltOutlined,
  ChevronRight,
  PeopleOutlined,
  PersonOutlineOutlined,
  HowToRegOutlined,
  SchoolOutlined,
  TimelineOutlined,
  AssessmentOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { useUser } from "@/new-services/auth/AuthContext";
import { apiFetch } from "@/new-services/poo/shared/api/client";
import type { CourseDTO, UserProfileDTO } from "@/new-services/poo/shared/api/catalog";
import { listUsersPage } from "@/new-services/poo/shared/api/users";
import { listPendingEnrollmentsPage } from "@/new-services/poo/shared/api/enrollment";
import { listDisciplines as listDisciplinesPage } from "@/new-services/poo/shared/api/disciplines";
import { getRoleOption } from "@/components/admin/RoleSelect";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { useAdminStats } from "@/hooks/useAdminStats";

const ROLE_CHIP_COLOR: Record<string, "primary" | "secondary" | "default"> = {
  Admin: "primary",
  Professor: "secondary",
  Aluno: "default",
};

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

interface DashboardCounts {
  users: number;
  courses: number;
  activeCourses: number;
  disciplines: number;
  admins: number;
  pendingEnrollments: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();

  const [recentCourses, setRecentCourses] = useState<CourseDTO[]>([]);
  const [disciplinesByCourse, setDisciplinesByCourse] = useState<Map<string, number>>(
    () => new Map(),
  );
  const [recentUsers, setRecentUsers] = useState<UserProfileDTO[]>([]);
  const [counts, setCounts] = useState<DashboardCounts>({
    users: 0,
    courses: 0,
    activeCourses: 0,
    disciplines: 0,
    admins: 0,
    pendingEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [
      recentCoursesResult,
      coursesCountResult,
      activeCoursesResult,
      disciplinesCountResult,
      recentUsersResult,
      usersCountResult,
      adminsCountResult,
      enrollmentsResult,
    ] = await Promise.allSettled([
      apiFetch<PageResponse<CourseDTO>>("/courses?page=0&size=3"),
      apiFetch<PageResponse<CourseDTO>>("/courses?page=0&size=1"),
      apiFetch<PageResponse<CourseDTO>>("/courses?status=Active&page=0&size=1"),
      listDisciplinesPage(undefined, 0, 1),
      listUsersPage({ page: 0, size: 5 }),
      listUsersPage({ page: 0, size: 1 }),
      listUsersPage({ page: 0, size: 1, role: "Admin" }),
      listPendingEnrollmentsPage({ page: 0, size: 1 }),
    ]);

    const nextCounts: DashboardCounts = {
      users: 0,
      courses: 0,
      activeCourses: 0,
      disciplines: 0,
      admins: 0,
      pendingEnrollments: 0,
    };

    let courses: CourseDTO[] = [];

    if (recentCoursesResult.status === "fulfilled") {
      courses = recentCoursesResult.value.content ?? [];
      setRecentCourses(courses);
    }

    if (coursesCountResult.status === "fulfilled") {
      nextCounts.courses = coursesCountResult.value.totalElements;
    }

    if (activeCoursesResult.status === "fulfilled") {
      nextCounts.activeCourses = activeCoursesResult.value.totalElements;
    }

    if (disciplinesCountResult.status === "fulfilled") {
      nextCounts.disciplines = disciplinesCountResult.value.totalElements;
    }

    if (recentUsersResult.status === "fulfilled") {
      setRecentUsers(recentUsersResult.value.content ?? []);
    }

    if (usersCountResult.status === "fulfilled") {
      nextCounts.users = usersCountResult.value.totalElements;
    }

    if (adminsCountResult.status === "fulfilled") {
      nextCounts.admins = adminsCountResult.value.totalElements;
    }

    if (enrollmentsResult.status === "fulfilled") {
      nextCounts.pendingEnrollments = enrollmentsResult.value.totalElements;
    }

    setCounts(nextCounts);

    if (courses.length > 0) {
      const disciplineCounts = await Promise.all(
        courses.map(async (course) => {
          try {
            const page = await listDisciplinesPage(course.id, 0, 1);
            return [course.id, page.totalElements] as const;
          } catch {
            return [course.id, 0] as const;
          }
        }),
      );
      setDisciplinesByCourse(new Map(disciplineCounts));
    } else {
      setDisciplinesByCourse(new Map());
    }

    if (
      recentCoursesResult.status === "rejected" &&
      usersCountResult.status === "rejected" &&
      disciplinesCountResult.status === "rejected"
    ) {
      setError("Não foi possível carregar os dados do painel.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
        Acompanhe os indicadores e acesse a gestão da plataforma.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          {
            label: "Usuários",
            value: counts.users,
            icon: <PeopleOutlined />,
          },
          {
            label: "Cursos",
            value: counts.courses,
            icon: <SchoolOutlined />,
          },
          {
            label: "Disciplinas",
            value: counts.disciplines,
            icon: <TimelineOutlined />,
          },
          {
            label: "Administradores",
            value: counts.admins,
            icon: <AdminPanelSettingsOutlined />,
          },
          {
            label: "Matrículas pendentes",
            value: counts.pendingEnrollments,
            icon: <HowToRegOutlined />,
            href: "/dashboard/matriculas",
          },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <MuiCard
              sx={{
                borderRadius: 3,
                height: "100%",
                cursor: "href" in item ? "pointer" : "default",
              }}
              onClick={
                "href" in item && item.href
                  ? () => router.push(item.href)
                  : undefined
              }
            >
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

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Desempenho dos Alunos
      </Typography>

      {statsError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {statsError}
        </Alert>
      )}

      {statsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4, mb: 5 }}>
          <CircularProgress size={32} />
        </Box>
      ) : stats ? (
        <>
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <MuiCard sx={{ borderRadius: 3 }}>
                <MuiCardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <AssessmentOutlined sx={{ fontSize: 40, color: "primary.main" }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Média de Progresso
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.averageStudentProgress}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.averageStudentProgress}
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </MuiCardContent>
              </MuiCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <MuiCard sx={{ borderRadius: 3 }}>
                <MuiCardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TrendingUpOutlined sx={{ fontSize: 40, color: "success.main" }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Taxa de Aprovação
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.overallApprovalRate}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.overallApprovalRate}
                    color={stats.overallApprovalRate >= 70 ? "success" : "warning"}
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </MuiCardContent>
              </MuiCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <MuiCard sx={{ borderRadius: 3 }}>
                <MuiCardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <PeopleOutlined sx={{ fontSize: 40, color: "info.main" }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Alunos / Professores
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.totalStudents} / {stats.totalProfessors}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {stats.totalStudents > 0
                      ? `${Math.round(stats.totalStudents / (stats.totalProfessors || 1))} alunos por professor`
                      : "Nenhum aluno cadastrado"}
                  </Typography>
                </MuiCardContent>
              </MuiCard>
            </Grid>
          </Grid>

          {stats.disciplineStats.length > 0 && (
            <>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Desempenho por Disciplina
              </Typography>

              <Grid container spacing={3} sx={{ mb: 5 }}>
                {stats.disciplineStats.slice(0, 6).map((discipline) => (
                  <Grid key={discipline.disciplineId} size={{ xs: 12, md: 6, lg: 4 }}>
                    <MuiCard sx={{ borderRadius: 3 }}>
                      <MuiCardContent>
                        <Typography sx={{ fontWeight: 700 }}>
                          {discipline.disciplineName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {discipline.totalStudents} alunos
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="caption">Progresso médio</Typography>
                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                              {discipline.averageProgress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={discipline.averageProgress}
                            sx={{ height: 6, borderRadius: 3, mb: 1 }}
                          />
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="caption">Aprovação</Typography>
                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                              {discipline.approvalRate}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={discipline.approvalRate}
                            color={discipline.approvalRate >= 70 ? "success" : "warning"}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </MuiCardContent>
                    </MuiCard>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      ) : null}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          mt: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Gerenciamento de cursos
        </Typography>
        <Link
          href="/dashboard/cursos"
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
        {recentCourses.length === 0 ? (
          <MuiCardContent>
            <Typography color="text.secondary">
              Nenhum curso cadastrado. Acesse o gerenciamento para criar o primeiro.
            </Typography>
          </MuiCardContent>
        ) : (
          <Grid container spacing={2} sx={{ p: 2 }}>
            {recentCourses.map((course) => {
              const status = course.status === "Inactive" ? "Inactive" : "Active";
              const disciplineCount = disciplinesByCourse.get(course.id) ?? 0;

              return (
                <Grid size={{ xs: 12, md: 4 }} key={course.id}>
                  <Card
                    hoverable
                    className={status === "Inactive" ? "opacity-70" : ""}
                    onClick={() => router.push(`/dashboard/cursos/${course.id}`)}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, color: "#1f2937" }}>
                          {course.name}
                        </Typography>
                        <ChevronRight sx={{ color: "#9ca3af", fontSize: 20 }} />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {course.description || "Sem descrição"}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Badge
                          color={status === "Active" ? "success" : "neutral"}
                          label={status === "Active" ? "Ativo" : "Inativo"}
                          dot
                        />
                        <Badge
                          color="info"
                          label={`${disciplineCount} disciplinas`}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </MuiCard>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          mt: 1,
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

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Status da plataforma
      </Typography>

      <Grid container spacing={3}>
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
                {counts.activeCourses} de {counts.courses} cursos disponíveis
              </Typography>
            </MuiCardContent>
          </MuiCard>
        </Grid>
      </Grid>
    </Box>
  );
}
