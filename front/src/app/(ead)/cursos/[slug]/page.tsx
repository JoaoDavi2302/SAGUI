"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowForward, CheckCircle, Lock, MenuBook } from "@mui/icons-material";

import { useUser } from "@/new-services/auth/AuthContext";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";
import { getCourse } from "@/new-services/poo/shared/api/courses";
import { listDisciplines } from "@/new-services/poo/shared/api/disciplines";
import { EnrollmentStatusChip } from "@/components/student/EnrollmentStatusChip";
import { slugify } from "@/components/layout/headerConfig";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";
import { CourseProvider } from "@/services/poo/course/CourseProvider";
import { DatabaseProvider } from "@/services/poo/databaseProvider";

const database = DatabaseProvider.getDatabase();

interface DisciplineItem {
  id: string;
  name: string;
  description: string;
  enrollmentStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

function StudentCourseDetailContent({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { enrollments, requestEnrollment } = useMyEnrollments();
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [disciplines, setDisciplines] = useState<DisciplineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [course, disciplinesPage] = await Promise.all([
          getCourse(courseId),
          listDisciplines(courseId, 0, 100),
        ]);

        setCourseName(course.name);
        setCourseDescription(course.description);

        const enrollmentByDiscipline = new Map(
          enrollments.map((e) => [e.disciplineId, e.status]),
        );

        setDisciplines(
          disciplinesPage.content
            .filter((d) => d.status === "Active")
            .map((d) => ({
              id: d.id,
              name: d.name,
              description: d.description,
              enrollmentStatus: enrollmentByDiscipline.get(d.id) as DisciplineItem["enrollmentStatus"],
            })),
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [courseId, enrollments]);

  const hasApprovedEnrollment = disciplines.some((d) => d.enrollmentStatus === "APPROVED");

  const handleEnroll = async (disciplineId: string) => {
    try {
      await requestEnrollment(disciplineId);
      setSnackbar("Solicitação de matrícula enviada! Aguarde aprovação do administrador.");
    } catch (err) {
      setSnackbar(getApiErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{courseName}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {courseDescription}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Chip label={`${disciplines.length} disciplinas`} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {hasApprovedEnrollment ? (
              <>
                <CheckCircle color="success" />
                <Typography>Você possui matrícula aprovada em disciplina(s) deste curso</Typography>
              </>
            ) : (
              <>
                <Lock color="disabled" />
                <Typography>Matricule-se em uma disciplina para acessar o conteúdo</Typography>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Typography sx={{ fontWeight: 700, mb: 2 }}>Disciplinas do curso</Typography>

      <Grid container spacing={2}>
        {disciplines.map((discipline, index) => (
          <Grid key={discipline.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <MenuBook />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {String(index + 1).padStart(2, "0")}. {discipline.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {discipline.description}
                    </Typography>

                    {discipline.enrollmentStatus && (
                      <Box sx={{ mt: 1 }}>
                        <EnrollmentStatusChip status={discipline.enrollmentStatus} />
                      </Box>
                    )}

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      {discipline.enrollmentStatus === "APPROVED" ? (
                        <Button
                          size="small"
                          variant="contained"
                          endIcon={<ArrowForward />}
                          onClick={() =>
                            router.push(`/disciplinas/${slugify(discipline.name)}?id=${discipline.id}`)
                          }
                        >
                          Acessar
                        </Button>
                      ) : !discipline.enrollmentStatus ? (
                        <Button size="small" variant="outlined" onClick={() => handleEnroll(discipline.id)}>
                          Matricular-se
                        </Button>
                      ) : (
                        <Button size="small" variant="outlined" disabled>
                          {discipline.enrollmentStatus === "PENDING" ? "Pendente" : "Rejeitada"}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

function LegacyCourseDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const { user, effectiveRole } = useUser();
  const isStudent = effectiveRole === "Aluno";

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

  const goDiscipline = (d: { id: number; nome: string }) => {
    router.push(`/disciplinas/${slugify(d.nome)}?id=${d.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{course.nome}</Typography>
      <Typography variant="body2" color="text.secondary">{course.descricao}</Typography>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {disciplines.map((d: { id: number; nome: string; description?: string }) => (
          <Grid key={d.id} size={{ xs: 12, md: 6 }}>
            <Card sx={{ cursor: "pointer" }} onClick={() => goDiscipline(d)}>
              <CardContent>
                <Typography sx={{ fontWeight: 700 }}>{d.nome}</Typography>
                <Typography variant="body2" color="text.secondary">{d.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function CourseDetailPageContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id") ?? "";
  const { effectiveRole } = useUser();

  if (effectiveRole === "Aluno") {
    if (!courseId) {
      return (
        <Alert severity="warning" sx={{ m: 3 }}>
          Curso não informado.
        </Alert>
      );
    }
    return <StudentCourseDetailContent courseId={courseId} />;
  }

  return <LegacyCourseDetailContent />;
}

export default function CourseDetailPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <CourseDetailPageContent />
    </Suspense>
  );
}
