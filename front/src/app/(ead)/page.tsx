"use client";

<<<<<<< HEAD
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/new-services/auth/AuthContext";

import StudentPage from "./studentPage";
import ProfessorHome from "./ProfessorHome";
=======
import { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from "@mui/material";

import { useUser } from "@/services/auth/AuthContext";
// import database from "@/components/mock.json";
import { DashboardProvider } from "@/services/poo/dashboard/dashboardProvider";
import {
  ArrowRightAltOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineOutlined";
const database = DatabaseProvider.getDatabase();
>>>>>>> origin/develop

export default function Home() {
  const router = useRouter();
  const { effectiveRole, loading } = useUser();

  useEffect(() => {
    if (!loading && effectiveRole === "Admin") {
      router.replace("/dashboard");
    }
  }, [loading, effectiveRole, router]);

  if (effectiveRole === "Aluno") {
    return <StudentPage />;
  }

<<<<<<< HEAD
  if (effectiveRole === "Professor") {
    return <ProfessorHome />;
  }

  return null;
}
=======
  // transforma par array os dados
  const coursesMap = useMemo(
    () =>
      Object.fromEntries(
        data.courses.map((course: any) => [course.id, course]),
      ),
    [data.courses],
  );

  // modulos da disciplina agrupados
  const modulesMap = useMemo(() => {
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
  }, [data.modules]);

  // tabela de nodulos usada para progressbar
  const moduleProgress = data.module_progress ?? [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 12 }}>Inicio</Typography>

      <Typography sx={{ fontWeight: 700, fontSize: 24 }}>
        Olá, {user?.nome}
      </Typography>

      <Typography sx={{ mb: 3, fontSize: 14, color: "gray" }}>
        Continue de onde parou ou descubra novos cursos.
      </Typography>

      {/* MODIFICAÇÃO: Inserção do componente "Continue de onde parou" (Etapa 1) */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <Box>
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1976d2", textTransform: "uppercase" }}>Continue de onde parou</Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, mt: 0.5 }}>Desenvolvimento Web Full Stack</Typography>
            <Typography sx={{ fontSize: "14px", color: "gray", mt: 0.5 }}>Módulo atual: Introdução a APIs REST</Typography>
          </Box>
          <Link href="/cursos/continuar">
            <Box sx={{ bgcolor: "#1976d2", color: "white", px: 3, py: 1.5, borderRadius: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1, "&:hover": { bgcolor: "#1565c0" } }}>
              Continuar Aula
            </Box>
          </Link>
        </Card>
      </Box>

      {/* MODIFICAÇÃO: Métricas otimizadas com sombras e efeitos de interação (Etapa 2) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {data.stats.map((stat: any, index: number) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
              <Box sx={{ bgcolor: "#E3F2FD", color: "#1976d2", p: 1.5, borderRadius: 3, display: "flex" }}>{stat.icon}</Box>
              <Box>
                <Typography sx={{ fontSize: "13px", color: "text.secondary", fontWeight: 500 }}>{stat.label}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: "24px", color: "#333" }}>{stat.value}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CURSOS - MODIFICAÇÃO: Grid compacto com capa e barra de progresso (Etapa 3) */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Meus Cursos</Typography>
        <Link href="/cursos" style={{ color: "#1976d2", fontSize: "14px" }}>
          Ver todos
          <ArrowRightAltOutlined />
        </Link>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {data.courses.map((course: any) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
            <Card sx={{ borderRadius: 3, border: "1px solid #e0e0e0", boxShadow: "none", height: "100%", display: "flex", flexDirection: "column", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } }}>
              <Box sx={{ height: 120, bgcolor: "#f5f5f5", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolOutlined sx={{ fontSize: 40, color: '#bdbdbd' }} />
              </Box>
              <CardContent sx={{ px: 3, flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "16px" }}>{course.nome}</Typography>
                <Typography variant="body2" sx={{ color: "gray", mt: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.descricao}</Typography>
              </CardContent>
              <Box sx={{ px: 3, pb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#1976d2" }}>45% concluído</Typography>
                <LinearProgress variant="determinate" value={45} sx={{ mt: 1, height: 6, borderRadius: 5 }} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DISCIPLINAS */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Minhas Disciplinas</Typography>
        <Link href="/disciplinas" style={{ color: "#1976d2", fontSize: "14px" }}>
          Ver todos
          <ArrowRightAltOutlined />
        </Link>
      </Box>
      <Grid container spacing={2}>
        {data.subjects.slice(0, 6).map((subject: any) => {
          const course = coursesMap[subject.course_id];
          const modules = modulesMap[subject.id] || [];
          const completedModules = moduleProgress.filter((p: any) => p.status === "COMPLETED" && modules.some((m: any) => m.id === p.module_id)).length;
          const progressPercent = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;
          const safeProgress = Math.min(100, Math.max(0, progressPercent));

          return (
            <Grid size={{ xs: 12, md: 4 }} key={subject.id}>
              <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
                <CardContent sx={{ px: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>{subject.nome}</Typography>
                  <Typography variant="body2" color="primary">{course?.nome}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{subject.descricao}</Typography>
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ bgcolor: "#E3F2FD", color: "primary.main", px: 1, py: 0.5, borderRadius: 5, fontWeight: 600 }}>
                      Módulos: {modules.length}
                    </Typography>
                  </Box>
                  {isStudent && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">Progresso da disciplina</Typography>
                      <LinearProgress variant="determinate" value={safeProgress} sx={{ mt: 0.5, height: 6, borderRadius: 5 }} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* MODIFICAÇÃO (Etapa 4): Adição de aviso de conclusão para organizar o final da página */}
      <Box sx={{ mt: 6, py: 3, borderTop: "1px solid #e0e0e0", textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CheckCircleOutline fontSize="small" />
          Você visualizou todas as disciplinas disponíveis.
        </Typography>
      </Box>
    </Box>
  );
}
>>>>>>> origin/develop
