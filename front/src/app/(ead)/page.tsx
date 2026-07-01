"use client";

import { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CardMedia,
  LinearProgress,
} from "@mui/material";

import { useUser } from "@/services/auth/AuthContext";
import { useCatalogDatabase } from "@/services/auth/dataContext";
import { DashboardProvider } from "@/services/dashboardProvider";
import { AccessTimeOutlined, ArrowRightAltOutlined } from "@mui/icons-material";
import Link from "next/link";

function getHomeCopy(role: string) {
  if (role === "PROFESSOR") {
    return {
      subtitle: "Acompanhe os cursos e disciplinas sob sua responsabilidade.",
      coursesTitle: "Cursos vinculados",
      disciplinesTitle: "Minhas Disciplinas",
      coursesLinkLabel: "Ver todos",
      showDisciplines: true,
    };
  }

  return {
    subtitle: "Continue de onde parou ou descubra novos cursos.",
    coursesTitle: "Meus Cursos",
    disciplinesTitle: "Minhas Disciplinas",
    coursesLinkLabel: "Ver todos",
    showDisciplines: false,
  };
}

export default function Home() {
  const { user, effectiveRole } = useUser();
  const { database, loading, error } = useCatalogDatabase();
  const isStudent = effectiveRole === "ALUNO";
  const copy = getHomeCopy(effectiveRole);

  const dashboard = useMemo(() => {
    if (!user) return null;
    return DashboardProvider.create(effectiveRole, user, database);
  }, [effectiveRole, user, database]);

  const data = useMemo(() => dashboard?.getData() ?? null, [dashboard]);

  const coursesMap = useMemo(
    () =>
      data
        ? Object.fromEntries(
            data.courses.map((course: any) => [course.id, course]),
          )
        : {},
    [data],
  );

  const modulesMap = useMemo(() => {
    if (!data) return {};

    const grouped: Record<string, any[]> = data.modules.reduce(
      (acc: Record<string, any[]>, module: any) => {
        if (!acc[module.discipline_id]) acc[module.discipline_id] = [];
        acc[module.discipline_id].push(module);
        return acc;
      },
      {},
    );

    Object.values(grouped).forEach((modules: any[]) => {
      modules.sort((a, b) => a.order_index - b.order_index);
    });

    return grouped;
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error ?? "Não foi possível carregar o início."}</Typography>
      </Box>
    );
  }

  const moduleProgress = data.module_progress ?? [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 12 }}>Inicio</Typography>

      <Typography sx={{ fontWeight: 700, fontSize: 24 }}>
        Olá, {user?.name}
      </Typography>

      <Typography sx={{ mb: 3, fontSize: 14, color: "gray" }}>
        {copy.subtitle}
      </Typography>

      {/* METRICAS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {data.stats.map((stat: any, index: number) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                p: 1.5,
                borderRadius: 2,
                boxShadow:"none",
                bgcolor: "rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <CardContent
                sx={{ display: "flex", gap: 2, alignItems: "center" }}
              >
                <Box sx={{ bgcolor: "#add3f8", p: 1, borderRadius: 2 }}>
                  {stat.icon}
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#556255" }}>
                    {stat.label}
                  </Typography>

                  <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CURSOS */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          {copy.coursesTitle}
        </Typography>

        <Link href="/cursos" style={{ color: "#1976d2", fontSize: "14px" }}>
          {copy.coursesLinkLabel}
          <ArrowRightAltOutlined sx={{ fontSize: 16, verticalAlign: "middle" }} />
        </Link>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {data.courses.map((course: any) => (
          <Grid size={{ xs: 12, md: 6 }} key={course.id}>
            <Card sx={{ borderRadius: 3, border: "1px solid #e0e0e0" }}>
              <CardMedia
                component="img"
                image={course.image}
                alt={course.name}
              />

              <CardContent sx={{ px: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {course.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "gray",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                  }}
                >
                  {course.description}
                </Typography>

                <Box sx={{ mt: 2, display: "flex", gap: 1, color: "gray" }}>
                  <AccessTimeOutlined fontSize="small" />
                  <Typography variant="caption">
                    Carga horária: {course.workload}h
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {copy.showDisciplines && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              {copy.disciplinesTitle}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Link href="/disciplinas" style={{ color: "#1976d2", fontSize: "14px" }}>
                Ver todos
                <ArrowRightAltOutlined sx={{ fontSize: 16, verticalAlign: "middle" }} />
              </Link>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {data.subjects.slice(0, 6).map((subject: any) => {
          const course = coursesMap[subject.course_id];
          const modules = modulesMap[subject.id] || [];

          // contador de progresso do aluno por disciplina
          const completedModules = moduleProgress.filter(
            (p: any) =>
              p.status === "COMPLETED" &&
              modules.some((m: any) => m.id === p.module_id)
          ).length;

          // tranformar em percentual para barra de progresso
          const progressPercent =
            modules.length > 0
              ? Math.round((completedModules / modules.length) * 100)
              : 0;

          const safeProgress = Math.min(100, Math.max(0, progressPercent));

          return (
            <Grid size={{ xs: 12, md: 4 }} key={subject.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <CardContent sx={{ px: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {subject.name}
                  </Typography>

                  <Typography variant="body2" color="primary">
                    {course?.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: "text.secondary",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {subject.description}
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 0.5, color: "gray" }}>
                      <AccessTimeOutlined fontSize="small" />
                      <Typography variant="caption">
                        {subject.workload}h
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: "#E3F2FD",
                        color: "primary.main",
                        px: 1,
                        py: 0.5,
                        borderRadius: 5,
                        fontWeight: 600,
                      }}
                    >
                      Módulos: {modules.length}
                    </Typography>
                  </Box>

                  {/* PROGRESSO (CORRETO) */}
                  {isStudent && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progresso da disciplina
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={safeProgress}
                        sx={{ mt: 0.5, height: 6, borderRadius: 5 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
          </Grid>
        </>
      )}
    </Box>
  );
}