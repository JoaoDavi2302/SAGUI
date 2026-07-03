"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  Divider,
  Button,
} from "@mui/material";

import { useMemo, useState } from "react";
import { useUser } from "@/services/auth/AuthContext";
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

  const enrolled =
    effectiveRole === "ALUNO"
      ? courses.filter((c: any) => c.enrolled)
      : courses;

  const available =
    effectiveRole === "ALUNO" ? courses.filter((c: any) => c.available) : [];

  // link
  const handleOpen = (course: CourseCard) => {
    const slug = slugify(course.nome);

    router.push(`/cursos/${slug}?id=${course.id}`);
  };

  const getLabel = (c: any) => {
    if (effectiveRole === "ALUNO") {
      return c.enrolled ? "Matriculado" : "Disponível";
    }
    return "Ativo";
  };

  const getColor = (c: any) => {
    if (effectiveRole === "ALUNO") {
      return c.enrolled ? "success" : "default";
    }
    return "primary";
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
      {/* HEADER */}
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1 }}>
        Cursos
      </Typography>

      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        {effectiveRole === "ALUNO" && "Seus cursos matriculados e disponíveis"}
        {effectiveRole === "PROFESSOR" &&
          "Cursos onde você leciona disciplinas"}
        {effectiveRole === "ADMINISTRADOR" && "Todos os cursos do sistema"}
      </Typography>

      {/* TABS ALUNO */}
      {effectiveRole === "ALUNO" && (
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Matriculados" />
          <Tab label="Disponíveis" />
        </Tabs>
      )}

      {/* LISTA */}
      <Grid container spacing={2}>
        {(effectiveRole === "ALUNO"
          ? tab === 0
            ? enrolled
            : available
          : courses
        ).map((c: any) => (
          <Grid key={c.id} size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                borderRadius: 3,
                cursor: "pointer",
                "&:hover": { boxShadow: 4 },
              }}
              onClick={() => handleOpen(c)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>{c.nome}</Typography>

                  <Chip size="small" label={getLabel(c)} color={getColor(c)} />
                </Box>

                <Typography variant="body2" color="text.secondary">
                 {c.descricao}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Carga horária: {c.workload}h
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary">
                  Disciplinas: {c.disciplinesCount ?? 0}
                </Typography>

                {/* ACTION ALUNO */}
                {effectiveRole === "ALUNO" && !c.enrolled && (
                  <Button variant="contained" size="small" sx={{ mt: 1 }}>
                    Matricular-se
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
