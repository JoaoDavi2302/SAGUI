"use client";

import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  listCourses,
  listDisciplines,
  type CourseDTO,
  type DisciplineDTO,
} from "@/new-services/poo/shared/api/catalog";

import { listMyEnrollmentsPage } from "@/new-services/poo/shared/api/enrollment";

interface StudentCourse extends CourseDTO {
  disciplines: DisciplineDTO[];
  enrolledDisciplines: number;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function StudentCoursesPage() {
  const router = useRouter();

  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(true);

  const [enrolled, setEnrolled] = useState<StudentCourse[]>([]);
  const [available, setAvailable] = useState<StudentCourse[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [courses, disciplines, enrollments] = await Promise.all([
          listCourses(),

          listDisciplines(),

          listMyEnrollmentsPage(),
        ]);

        const approvedEnrollments = enrollments.content.filter(
          (enrollment) => enrollment.status === "APPROVED",
        );

        const enrolledDisciplineIds = approvedEnrollments.map(
          (enrollment) => enrollment.disciplineId,
        );

        const formattedCourses: StudentCourse[] = courses.map((course) => {
          const courseDisciplines = disciplines.filter(
            (discipline) => discipline.courseId === course.id,
          );

          const enrolledCount = courseDisciplines.filter((discipline) =>
            enrolledDisciplineIds.includes(discipline.id),
          ).length;

          return {
            ...course,

            disciplines: courseDisciplines,

            enrolledDisciplines: enrolledCount,
          };
        });

        setEnrolled(
          formattedCourses.filter((course) => course.enrolledDisciplines > 0),
        );

        setAvailable(
          formattedCourses.filter((course) => course.enrolledDisciplines === 0),
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const courses = tab === 0 ? enrolled : available;

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        Cursos
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Veja seus cursos matriculados e novas oportunidades.
      </Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label={`Matriculados (${enrolled.length})`} />

        <Tab label={`Disponíveis (${available.length})`} />
      </Tabs>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid
            key={course.id}
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {course.name}
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {course.description ?? "Sem descrição"}
                </Typography>

                <Chip
                  sx={{ mt: 2 }}
                  label={`${course.disciplines.length} disciplinas`}
                />

                {course.enrolledDisciplines > 0 && (
                  <Chip
                    sx={{
                      mt: 2,
                      ml: 1,
                    }}
                    color="success"
                    label={`${course.enrolledDisciplines} matriculada(s)`}
                  />
                )}

                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={() =>
                    router.push(
                      `/cursos/${createSlug(course.name)}?id=${course.id}`,
                    )
                  }
                >
                  Ver detalhes
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {courses.length === 0 && (
          <Grid size={12}>
            <Typography align="center" color="text.secondary">
              Nenhum curso encontrado.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
