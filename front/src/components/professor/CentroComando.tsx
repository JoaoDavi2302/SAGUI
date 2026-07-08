"use client";

import { 
  Box, Container, Grid, Typography, Stack, Paper 
} from "@mui/material";
import { 
  HomeOutlined, MenuBookOutlined, AssessmentOutlined, CalendarTodayOutlined 
} from "@mui/icons-material";
import DrawerLayout from "@/components/drawer";
import mockData from "@/components/mock.json";

// Importando os componentes modulares
import { PendenciasTable } from "./PendenciasTable";
import { DisciplinaCard } from "./DisciplinaCard";

const professorItems = [
  { label: "Início", href: "/professor/dashboard", icon: <HomeOutlined /> },
  { label: "Disciplinas", href: "/professor/disciplinas", icon: <MenuBookOutlined /> },
  { label: "Calendário", href: "/professor/calendario", icon: <CalendarTodayOutlined /> },
  { label: "Relatórios", href: "/professor/relatorios", icon: <AssessmentOutlined /> },
];

export default function CentroComando({ user }: { user: any }) {
  const disciplinas = mockData.disciplinas || [];
  const atividades = mockData.atividades || [];
  const professorId = Number(user?.id) || 2; 
  
  const minhasDisciplinas = disciplinas.filter((d: any) => Number(d.professor_id) === professorId);
  const disciplinaIds = minhasDisciplinas.map((d: any) => d.id);
  const atividadesPendentes = atividades.filter((a: any) => 
    disciplinas.some((d: any) => d.id === a.modulo_id && disciplinaIds.includes(d.id))
  );

  return (
    <DrawerLayout title="Centro de Comando Docente" items={professorItems}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        
        {/* Cabeçalho do Centro de Comando */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b" }}>
            Dashboard de Gestão
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1.1rem" }}>
            Bem-vindo, Prof. {user?.nome || "Carlos"}. Você tem 
            <Box component="span" sx={{ fontWeight: 'bold', color: '#e65100', mx: 0.5 }}>
              {atividadesPendentes.length} pendências
            </Box>
            hoje.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Fluxo Operacional: Foco no que exige ação imediata */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Próximas Correções</Typography>
            <PendenciasTable pendencias={[]} />
          </Grid>

          {/* Gestão Estrutural: Foco na carga docente[cite: 1] */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Minhas Disciplinas</Typography>
            <Stack spacing={2}>
              {minhasDisciplinas.map((subject: any) => (
                <DisciplinaCard key={subject.id} disciplina={subject} />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </DrawerLayout>
  );
}