"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Divider,
  Button,
  LinearProgress,
  Chip,
} from "@mui/material";
import { SchoolOutlined, CheckCircleOutlineOutlined } from "@mui/icons-material"; // Ícone adicionado

import { useMemo, useState } from "react";
import { useUser } from "@/new-services/auth/AuthContext";
import { CourseProvider } from "@/services/poo/course/CourseProvider";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { useRouter } from "next/navigation";
import { CourseCard } from "@/services/poo/shared/types";

const database = DatabaseProvider.getDatabase();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function CoursesPage() {
  const { user, effectiveRole } = useUser();
  const router = useRouter();

  const [tab, setTab] = useState(0);

  const provider = useMemo(() => {
    if (!user) return null;
    return CourseProvider.create(effectiveRole, database, user);
  }, [user, effectiveRole]);

  const courses = useMemo(() => {
    if (!provider) return [];
    return provider.listCourses();
  }, [provider]);

  const enrolled = effectiveRole === "Aluno" ? courses.filter((c: any) => c.enrolled) : courses;
  const available = effectiveRole === "Aluno" ? courses.filter((c: any) => c.available) : [];

  const handleOpen = (course: CourseCard) => {
    const slug = slugify(course.nome);
    router.push(`/cursos/${slug}?id=${course.id}`);
  };

  if (!provider) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1 }}>
        Cursos
      </Typography>

      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        {effectiveRole === "Aluno" && "Seus cursos matriculados e disponíveis"}
        {effectiveRole === "Professor" && "Cursos onde você leciona disciplinas"}
        {effectiveRole === "Admin" && "Todos os cursos do sistema"}
      </Typography>

      {effectiveRole === "Aluno" && (
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          sx={{ 
            mb: 4, 
            borderBottom: 1, 
            borderColor: 'divider',
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "16px" } 
          }}
        >
          <Tab label={`Matriculados (${enrolled.length})`} />
          <Tab label={`Disponíveis (${available.length})`} />
        </Tabs>
      )}

      <Grid container spacing={3} sx={{ mb: 6 }}> {/* MODIFICAÇÃO (Etapa 4): mb: 6 para respiro */}
        {(effectiveRole === "Aluno" ? (tab === 0 ? enrolled : available) : courses).map((c: any) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                borderRadius: 3,
                cursor: "pointer",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "none",
                border: "1px solid #e0e0e0",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
              }}
              onClick={() => handleOpen(c)}
            >
              <Box sx={{ height: 120, bgcolor: "#f5f5f5", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolOutlined sx={{ fontSize: 40, color: '#bdbdbd' }} />
              </Box>

              <CardContent sx={{ px: 3, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip label="Tecnologia" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600, fontSize: '10px' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{c.workload}h</Typography>
                </Box>

                <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>{c.nome}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {c.descricao}
                </Typography>

                {c.enrolled && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#1976d2" }}>45% concluído</Typography>
                    <LinearProgress variant="determinate" value={45} sx={{ mt: 0.5, height: 6, borderRadius: 5 }} />
                  </Box>
                )}
              </CardContent>

              <Divider />
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Disciplinas: {c.disciplinesCount ?? 0}</Typography>
                {effectiveRole === "Aluno" && !c.enrolled && (
                  <Button variant="outlined" size="small">Matricular-se</Button>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* MODIFICAÇÃO (Etapa 4): Rodapé de encerramento de conteúdo */}
      <Box sx={{ py: 3, borderTop: "1px solid #e0e0e0", textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CheckCircleOutlineOutlined fontSize="small" />
          Você visualizou todos os cursos disponíveis.
        </Typography>
      </Box>
    </Box>
  );
}