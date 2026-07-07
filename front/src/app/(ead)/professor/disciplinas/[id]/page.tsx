"use client";

import { use, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useUser } from "@/new-services/auth/AuthContext";
import { getDiscipline, type DisciplineDTO } from "@/new-services/poo/shared/api/catalog";
import { ApiError } from "@/new-services/poo/shared/api/client";
import { AlunosTab } from "./components/AlunosTab";
import { ConteudoTab } from "./components/ConteudoTab";
import { AvaliacoesTab } from "./components/AvaliacoesTab";

export default function TurmaDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useUser();
  const [tabValue, setTabValue] = useState(1);
  const [discipline, setDiscipline] = useState<DisciplineDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setForbidden(false);

      try {
        const data = await getDiscipline(id);
        if (cancelled) return;

        if (
          user?.id &&
          data.responsibleProfessorId !== user.id &&
          user.role !== "Admin"
        ) {
          setForbidden(true);
          setDiscipline(null);
          return;
        }

        setDiscipline(data);
      } catch (err) {
        if (!cancelled) {
          setDiscipline(null);
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar a disciplina.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id, user?.role]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (forbidden) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Você não tem permissão para gerenciar esta disciplina.
        </Alert>
      </Container>
    );
  }

  if (error || !discipline) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error ?? "Disciplina não encontrada."}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {discipline.name}
        </Typography>
        <Typography color="text.secondary">
          {discipline.description || "Gestão de alunos, conteúdo e avaliações."}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab label="Alunos" />
          <Tab label="Conteúdo e Materiais" />
          <Tab label="Avaliações" />
        </Tabs>
      </Paper>

      <Box sx={{ minHeight: "400px" }}>
        {tabValue === 0 && <AlunosTab disciplinaId={id} />}
        {tabValue === 1 && <ConteudoTab disciplinaId={id} />}
        {tabValue === 2 && <AvaliacoesTab disciplinaId={id} />}
      </Box>
    </Container>
  );
}
