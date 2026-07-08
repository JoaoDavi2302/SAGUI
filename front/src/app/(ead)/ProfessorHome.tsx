"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useUser } from "@/new-services/auth/AuthContext";
import { PendenciasTable } from "@/components/professor/PendenciasTable";
import { DisciplinaCard } from "@/components/professor/DisciplinaCard";
import { useProfessorDisciplines } from "@/hooks/useProfessorDisciplines";
import { listModules } from "@/new-services/poo/shared/api/catalog";
import {
  listPendingActivities,
  type PendingActivityDTO,
} from "@/new-services/poo/shared/api/activities";

export default function ProfessorHome() {
  const { user } = useUser();
  const { disciplines, loading, error } = useProfessorDisciplines();
  const [moduleCount, setModuleCount] = useState(0);
  const [pendencias, setPendencias] = useState<PendingActivityDTO[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (disciplines.length === 0) {
      setModuleCount(0);
      setPendencias([]);
      setStatsLoading(false);
      return;
    }

    setStatsLoading(true);

    try {
      const modulesPerDiscipline = await Promise.all(
        disciplines.map((discipline) => listModules(discipline.id)),
      );
      const modules = modulesPerDiscipline.flat();
      setModuleCount(modules.length);

      const pendingPerDiscipline = await Promise.all(
        disciplines.map((discipline) =>
          listPendingActivities(discipline.id, { size: 10 }),
        ),
      );
      const allPending = pendingPerDiscipline
        .flatMap((page) => page.content ?? [])
        .slice(0, 10);

      setPendencias(allPending);
    } catch {
      setModuleCount(0);
      setPendencias([]);
    } finally {
      setStatsLoading(false);
    }
  }, [disciplines]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const firstName = user?.name?.split(" ")[0] ?? "Professor";

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography color="text.secondary">
          Bem-vindo, Prof. {firstName}.
          {statsLoading ? (
            " Carregando resumo..."
          ) : pendencias.length > 0 ? (
            <> Você tem <strong>{pendencias.length}</strong> pendência(s) de avaliação.</>
          ) : (
            " Nenhuma pendência de avaliação nas suas disciplinas."
          )}
        </Typography>
        {!statsLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {disciplines.length} disciplina(s) · {moduleCount} módulo(s)
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Pendências de avaliação
          </Typography>
          {statsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : pendencias.length > 0 ? (
            <PendenciasTable pendencias={pendencias} />
          ) : (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "#f8fafc",
                borderRadius: 3,
                border: "1px dashed #cbd5e1",
              }}
            >
              <Typography color="text.secondary">
                Nenhum aluno pendente de aprovação em avaliações.
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Minhas Disciplinas
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2}>
              {disciplines.length > 0 ? (
                disciplines.map((subject) => (
                  <DisciplinaCard key={subject.id} disciplina={subject} />
                ))
              ) : (
                <Typography color="text.secondary">
                  Nenhuma disciplina vinculada.
                </Typography>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
