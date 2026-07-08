"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  AssignmentOutlined,
  MenuBookOutlined,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useProfessorDisciplines } from "@/hooks/useProfessorDisciplines";
import { listModules } from "@/new-services/poo/shared/api/catalog";

export default function DisciplinasPage() {
  const { disciplines, loading, error } = useProfessorDisciplines();
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  useEffect(() => {
    if (disciplines.length === 0) {
      setModuleCounts({});
      return;
    }

    let cancelled = false;
    setCountsLoading(true);

    Promise.all(
      disciplines.map(async (discipline) => {
        const modules = await listModules(discipline.id);
        return [discipline.id, modules.length] as const;
      }),
    )
      .then((entries) => {
        if (!cancelled) {
          setModuleCounts(Object.fromEntries(entries));
        }
      })
      .catch(() => {
        if (!cancelled) setModuleCounts({});
      })
      .finally(() => {
        if (!cancelled) setCountsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [disciplines]);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Gestão completa do seu ambiente de ensino.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : disciplines.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 8 }}>
          Nenhuma disciplina vinculada ao seu perfil.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {disciplines.map((disciplina) => (
            <Grid key={disciplina.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {disciplina.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {disciplina.description || "Sem descrição"}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      icon={<MenuBookOutlined />}
                      label={
                        countsLoading
                          ? "..."
                          : `${moduleCounts[disciplina.id] ?? 0} Módulos`
                      }
                      size="small"
                    />
                    <Chip
                      icon={<AssignmentOutlined />}
                      label={disciplina.status === "Active" ? "Ativa" : "Inativa"}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    href={`/professor/disciplinas/${disciplina.id}`}
                    sx={{ borderRadius: 2 }}
                  >
                    Acessar Turma
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
