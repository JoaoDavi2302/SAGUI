"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { ArrowRightAltOutlined, SchoolOutlined } from "@mui/icons-material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineOutlined";

import { useUser } from "@/new-services/auth/AuthContext";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";
import { getDisciplineProgress } from "@/new-services/poo/shared/api/progress";
import { StudentProgressBar } from "@/components/student/StudentProgressBar";
import { slugify } from "@/components/layout/headerConfig";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";

interface DisciplineProgressItem {
  id: string;
  name: string;
  overallPercentage: number;
  totalModules: number;
}

export default function StudentPage() {
  const { user } = useUser();
  const { approvedEnrollments, loading: loadingEnrollments } = useMyEnrollments();
  const [disciplines, setDisciplines] = useState<DisciplineProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loadingEnrollments) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const items = await Promise.all(
          approvedEnrollments.map(async (enrollment) => {
            const progress = await getDisciplineProgress(enrollment.disciplineId);
            return {
              id: enrollment.disciplineId,
              name: enrollment.disciplineName,
              overallPercentage: progress.overallPercentage ?? 0,
              totalModules: progress.totalModules ?? 0,
            };
          }),
        );
        if (!cancelled) {
          setDisciplines(items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [approvedEnrollments, loadingEnrollments]);

  const continueDiscipline = useMemo(() => {
    const inProgress = disciplines.filter((d) => d.overallPercentage < 100);
    if (inProgress.length === 0) return null;
    return inProgress.sort((a, b) => a.overallPercentage - b.overallPercentage)[0];
  }, [disciplines]);

  if (loading || loadingEnrollments) {
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
      <Typography sx={{ fontSize: 12 }}>Início</Typography>

      <Typography sx={{ fontWeight: 700, fontSize: 24 }}>
        Olá, {user?.name}
      </Typography>

      <Typography sx={{ mb: 3, fontSize: 14, color: "gray" }}>
        Continue de onde parou ou descubra novas disciplinas.
      </Typography>

      {continueDiscipline && (
        <Box sx={{ mb: 4 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
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

              <Typography sx={{ fontWeight: 700, fontSize: 18, mt: 1 }}>
                {continueDiscipline.name}
              </Typography>

              <Typography color="text.secondary">
                {Math.round(continueDiscipline.overallPercentage)}% concluído
              </Typography>
            </Box>

            <Button
              component={Link}
              href={`/disciplinas/${slugify(continueDiscipline.name)}?id=${continueDiscipline.id}`}
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Continuar
            </Button>
          </Card>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Minhas Disciplinas
        </Typography>

        <Link href="/disciplinas">
          Ver todas
          <ArrowRightAltOutlined />
        </Link>
      </Box>

      {disciplines.length === 0 ? (
        <Card sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Você ainda não possui matrículas aprovadas.
          </Typography>
          <Button component={Link} href="/disciplinas" variant="contained">
            Ver disciplinas disponíveis
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {disciplines.map((discipline) => (
            <Grid key={discipline.id} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%", borderRadius: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      height: 80,
                      bgcolor: "#f5f5f5",
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <SchoolOutlined sx={{ fontSize: 32, color: "#bdbdbd" }} />
                  </Box>

                  <Typography sx={{ fontWeight: "bold" }}>{discipline.name}</Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    {discipline.totalModules} módulo(s)
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <StudentProgressBar
                      value={discipline.overallPercentage}
                      label={`${Math.round(discipline.overallPercentage)}% concluído`}
                    />
                  </Box>

                  <Button
                    component={Link}
                    href={`/disciplinas/${slugify(discipline.name)}?id=${discipline.id}`}
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {disciplines.length > 0 && (
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
            Você visualizou todas as disciplinas matriculadas.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
