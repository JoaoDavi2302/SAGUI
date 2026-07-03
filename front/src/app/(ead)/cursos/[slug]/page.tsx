"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  LinearProgress,
  Stack,
  Avatar,
} from "@mui/material";

import {
  CheckCircle,
  Cancel,
  Lock,
  ArrowForward,
  School,
  AccessTime,
  MenuBook,
} from "@mui/icons-material";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useUser } from "@/services/auth/AuthContext";
import { CourseProvider } from "@/services/poo/course/CourseProvider";
import { DatabaseProvider } from "@/services/poo/databaseProvider";

const database = DatabaseProvider.getDatabase();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function CourseDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = Number(searchParams.get("id"));
  console.log("id", id);

  const { user, effectiveRole } = useUser();
  const isTeacher = effectiveRole === "PROFESSOR";
  const isStudent = effectiveRole === "ALUNO";

  const provider = useMemo(() => {
    if (!user) return null;
    return CourseProvider.create(effectiveRole, database, user);
  }, [user, effectiveRole]);

  const course = useMemo(() => {
    if (!provider || !id) return null;
    return provider.getCourse(id);
  }, [provider, id]);

  const disciplines = useMemo(() => {
    if (!provider || !id) return [];
    return provider.getDisciplines(id);
  }, [provider, id]);

  if (!course) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Curso não encontrado</Typography>
      </Box>
    );
  }

  const enrolled =
    isStudent &&
    database.matriculas?.some(
      (m) => m.aluno_id === user?.id && m.curso_id === course.id,
    );

  const goDiscipline = (d: any) => {
    const slug = slugify(d.nome);
    router.push(`/disciplinas/${slug}?id=${d.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
            {course.nome}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {course.descricao}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1}>
            {/* <Chip label={course.area ?? "Área"} color="primary" /> */}
            {/* <Chip label={`${course.workload ?? 0}h`} /> */}
            <Chip label={`${disciplines.length} disciplinas`} />
          </Stack>
        </CardContent>
      </Card>

      {/* STATUS DO ALUNO */}
      {isStudent && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {enrolled ? (
              <>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <CheckCircle color="success" />
                  <Typography>Você está matriculado neste curso</Typography>
                </Stack>

                <LinearProgress
                  sx={{ mt: 2, height: 8, borderRadius: 5 }}
                  value={60}
                  variant="determinate"
                />
              </>
            ) : (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Lock color="disabled" />
                <Typography>Você não está matriculado neste curso</Typography>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      {/* DISCIPLINAS */}
      <Typography sx={{ fontWeight: 700, mb: 2 }}>
        Disciplinas do curso
      </Typography>

      <Grid container spacing={2}>
        {disciplines.map((d: any, index: number) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={d.id}>
            <Card
              sx={{
                borderRadius: 3,
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => goDiscipline(d)}
            >
              <CardContent>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <MenuBook />
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {String(index + 1).padStart(2, "0")}. {d.nome}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {d.description}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {/* <Chip
                        size="small"
                        icon={<AccessTime />}
                        label={`${d.workload}h`}
                      /> */}

                      {isStudent && enrolled && (
                        <Chip
                          size="small"
                          icon={<CheckCircle />}
                          label="Liberado"
                          color="success"
                        />
                      )}
                    </Stack>
                  </Box>

                  <ArrowForward />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
