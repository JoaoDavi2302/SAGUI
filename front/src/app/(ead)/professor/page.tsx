"use client";

import { Box, Container, Grid, Typography, Stack } from "@mui/material";
import { PendenciasTable } from "@/components/professor/PendenciasTable";
import { DisciplinaCard } from "@/components/professor/DisciplinaCard";
import mockData from "@/components/mock.json"; // Garantindo acesso ao mock completo

export default function ProfessorPage({ user, data }: { user: any; data: any }) {
  // Acessa os dados globalmente via mockData ou props
  const disciplinas = data?.disciplinas || mockData.disciplinas || [];
  const modulos = data?.modulos || mockData.modulos || [];
  const atividades = data?.atividades || mockData.atividades || [];
  
  // 1. Disciplinas do professor
  const minhasDisciplinas = disciplinas.filter((d: any) => Number(d.professor_id) === Number(user?.id));
  const disciplinaIds = minhasDisciplinas.map((d: any) => d.id);

  // 2. Hierarquia correta: Disciplina -> Módulo -> Atividade
  const modulosDasDisciplinas = modulos
    .filter((m: any) => disciplinaIds.includes(m.disciplina_id))
    .map((m: any) => m.id);

  const atividadesPendentes = atividades.filter((a: any) => 
    modulosDasDisciplinas.includes(a.modulo_id)
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Dashboard de Gestão</Typography>
        <Typography color="text.secondary">
          Bem-vindo, Prof. {user?.nome}. 
          {atividadesPendentes.length > 0 ? (
            <> Você tem <strong>{atividadesPendentes.length} pendências</strong> hoje.</>
          ) : (
            <> Tudo certo! Nenhuma correção pendente no momento.</>
          )}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid xs={12} lg={7}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Próximas Correções</Typography>
          {atividadesPendentes.length > 0 ? (
            <PendenciasTable atividades={atividadesPendentes.slice(0, 5)} />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
              <Typography color="text.secondary">Nenhuma atividade aguardando correção.</Typography>
            </Box>
          )}
        </Grid>

        <Grid xs={12} lg={5}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Minhas Disciplinas</Typography>
          <Stack spacing={2}>
            {minhasDisciplinas.length > 0 ? (
              minhasDisciplinas.map((subject: any) => (
                <DisciplinaCard key={subject.id} disciplina={subject} />
              ))
            ) : (
              <Typography color="text.secondary">Nenhuma disciplina vinculada.</Typography>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}