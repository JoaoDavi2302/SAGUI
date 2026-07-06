"use client";

import { useMemo } from "react";
import Link from "next/link";

import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";

import {
  ArrowRightAltOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineOutlined";

interface StudentPageProps {
  user: any;
  data: any;
}

export default function StudentPage({
  user,
  data,
}: StudentPageProps) {
  const coursesMap = useMemo(
    () =>
      Object.fromEntries(
        data.courses.map((course: any) => [course.id, course])
      ),
    [data.courses]
  );

  const modulesMap = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    data.modules.forEach((module: any) => {
      if (!grouped[module.discipline_id]) {
        grouped[module.discipline_id] = [];
      }

      grouped[module.discipline_id].push(module);
    });

    Object.values(grouped).forEach((modules: any[]) =>
      modules.sort((a, b) => a.order_index - b.order_index)
    );

    return grouped;
  }, [data.modules]);

  const moduleProgress = data.module_progress ?? [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 12 }}>
        Início
      </Typography>

      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 24,
        }}
      >
        Olá, {user?.nome}
      </Typography>

      <Typography
        sx={{
          mb: 3,
          fontSize: 14,
          color: "gray",
        }}
      >
        Continue de onde parou ou descubra novos cursos.
      </Typography>

      {/* Continue estudando */}

      <Box sx={{ mb: 4 }}>
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                color: "primary.main",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Continue de onde parou
            </Typography>

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 18,
                mt: 1,
              }}
            >
              Desenvolvimento Web Full Stack
            </Typography>

            <Typography color="text.secondary">
              Módulo atual: Introdução a APIs REST
            </Typography>
          </Box>

          <Link href="/cursos/continuar">
            <Box
              sx={{
                px: 3,
                py: 1.5,
                bgcolor: "primary.main",
                color: "#fff",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              Continuar aula
            </Box>
          </Link>
        </Card>
      </Box>

      {/* Estatísticas */}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {data.stats.map((stat: any, index: number) => (
          <Grid
            key={index}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <Card
              sx={{
                p: 2,
                display: "flex",
                gap: 2,
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "#E3F2FD",
                  borderRadius: 2,
                }}
              >
                {stat.icon}
              </Box>

              <Box>
                <Typography color="text.secondary">
                  {stat.label}
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 24,
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Cursos */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{fontWeight:"bold"}}>
          Meus Cursos
        </Typography>

        <Link href="/cursos">
          Ver todos
          <ArrowRightAltOutlined />
        </Link>
      </Box>

      <Grid container spacing={3}>
        {data.courses.map((course: any) => (
          <Grid
            key={course.id}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
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
                <SchoolOutlined
                  sx={{
                    fontSize: 40,
                    color: "#bdbdbd",
                  }}
                />
              </Box>

              <CardContent>
                <Typography sx={{fontWeight:"bold"}}>
                  {course.nome}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {course.descricao}
                </Typography>
              </CardContent>

              <Box sx={{ px: 2, pb: 2 }}>
                <Typography
                  variant="caption"
                  color="primary"
                >
                  45% concluído
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={45}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Disciplinas */}

      <Box
        sx={{
          mt: 5,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" sx={{fontWeight:"bold"}}>
          Minhas Disciplinas
        </Typography>

        <Link href="/disciplinas">
          Ver todas
          <ArrowRightAltOutlined />
        </Link>
      </Box>

      <Grid container spacing={2}>
        {data.subjects.slice(0, 6).map((subject: any) => {
          const course = coursesMap[subject.course_id];
          const modules = modulesMap[subject.id] || [];

          const completedModules = moduleProgress.filter(
            (progress: any) =>
              progress.status === "COMPLETED" &&
              modules.some(
                (module: any) => module.id === progress.module_id
              )
          ).length;

          const progress =
            modules.length === 0
              ? 0
              : Math.round(
                  (completedModules / modules.length) * 100
                );

          return (
            <Grid
              key={subject.id}
              size={{ xs: 12, md: 4 }}
            >
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography sx={{fontWeight:"bold"}}>
                    {subject.nome}
                  </Typography>

                  <Typography color="primary">
                    {course?.nome}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {subject.descricao}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      Módulos: {modules.length}
                    </Typography>

                    <LinearProgress
                      sx={{ mt: 1 }}
                      value={progress}
                      variant="determinate"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box
        sx={{
          mt: 6,
          py: 3,
          borderTop: "1px solid #eee",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.secondary",
          }}
        >
          <CheckCircleOutline fontSize="small" />
          Você visualizou todas as disciplinas disponíveis.
        </Typography>
      </Box>
    </Box>
  );
}