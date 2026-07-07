"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Typography,
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
} from "@mui/icons-material";
import { useUser } from "@/new-services/auth/AuthContext";
import {
  listCourses,
  listDisciplines,
  UserProfileDTO,
} from "@/new-services/poo/shared/api/catalog";
import { listUsers } from "@/new-services/poo/shared/api/users";
import { listPendingEnrollmentsPage } from "@/new-services/poo/shared/api/enrollment";
import { getRoleOption } from "@/components/admin/RoleSelect";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

const ROLE_CHIP_COLOR: Record<string, "primary" | "secondary" | "default"> = {
  Admin: "primary",
  Professor: "secondary",
  Aluno: "default",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();

  const [courses, setCourses] = useState<Awaited<ReturnType<typeof listCourses>>>([]);
  const [disciplines, setDisciplines] = useState<Awaited<ReturnType<typeof listDisciplines>>>([]);
  const [users, setUsers] = useState<UserProfileDTO[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [coursesResult, disciplinesResult, usersResult, enrollmentsResult] =
      await Promise.allSettled([
        listCourses(),
        listDisciplines(),
        listUsers(),
        listPendingEnrollmentsPage({ page: 0, size: 1 }),
      ]);

    if (coursesResult.status === "fulfilled") {
      setCourses(coursesResult.value);
    }

    if (disciplinesResult.status === "fulfilled") {
      setDisciplines(disciplinesResult.value);
    }

    if (usersResult.status === "fulfilled") {
      setUsers(
        usersResult.value.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"),
        ),
      );
    }

    if (enrollmentsResult.status === "fulfilled") {
      setPendingEnrollments(enrollmentsResult.value.totalElements);
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

  const activeCourses = courses.filter((course) => course.status !== "Inactive");
  const adminCount = users.filter((item) => item.role === "Admin").length;
  const recentUsers = users.slice(0, 5);
  const recentCourses = useMemo(() => courses.slice(0, 3), [courses]);

  const disciplinesByCourse = useMemo(() => {
    const counts = new Map<string, number>();
    for (const discipline of disciplines) {
      counts.set(
        discipline.courseId,
        (counts.get(discipline.courseId) ?? 0) + 1,
      );
    }
    return counts;
  }, [disciplines]);

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
          {
            label: "Matrículas pendentes",
            value: pendingEnrollments,
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
              onClick={"href" in item ? () => router.push(item.href) : undefined}
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
                {activeCourses.length} de {courses.length} cursos disponíveis
              </Typography>
            </MuiCardContent>
          </MuiCard>
        </Grid>
      </Grid>
    </Box>
  );
}
