"use client";

import { use, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { getDiscipline, type DisciplineDTO } from "@/new-services/poo/shared/api/catalog";
import { ApiError } from "@/new-services/poo/shared/api/client";
import { AlunosTab } from "@/app/(ead)/professor/disciplinas/[id]/components/AlunosTab";
import { ConteudoTab } from "@/app/(ead)/professor/disciplinas/[id]/components/ConteudoTab";
import { AvaliacoesTab } from "@/app/(ead)/professor/disciplinas/[id]/components/AvaliacoesTab";

export default function AdminDisciplineManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [tabValue, setTabValue] = useState(1);
  const [discipline, setDiscipline] = useState<DisciplineDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getDiscipline(id);
        if (!cancelled) setDiscipline(data);
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
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !discipline) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? "Disciplina não encontrada."}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/disciplinas")}>
          Voltar às disciplinas
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push(`/cursos/gerenciar/${discipline.courseId}`)}
        sx={{ mb: 2 }}
      >
        Voltar ao curso
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {discipline.name}
        </Typography>
        <Typography color="text.secondary">
          {discipline.description ||
            "Gestão de alunos, conteúdo e avaliações desta disciplina."}
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
