"use client";

import { useUser } from "@/services/auth/AuthContext";
import { 
  Box, Container, Grid, Typography, Stack, CircularProgress, 
  Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, TableContainer 
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/components/DashboardProvider";

export default function ProfessorPage() {
  const { user, loading } = useUser();
  const { data } = useDashboard();
  const router = useRouter();
  
  if (loading) return <CircularProgress />;

  const minhasDisciplinas = data.disciplinas.filter((d: any) => Number(d.professor_id) === Number(user?.id));
  const pendencias = data.tentativas_atividade.filter((t: any) => t.nota === null || t.nota < 70);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Dashboard de Gestão</Typography>
        <Typography color="text.secondary">
          Bem-vindo, Prof. {user?.nome}. Você tem <strong>{pendencias.length} pendências</strong> hoje.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Tabela de Correções */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Próximas Correções</Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0, border: '1px solid #e2e8f0' }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell>Atividade</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendencias.map((p: any) => {
                  const ativ = data.atividades.find((a: any) => a.id === p.atividade_id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{ativ?.titulo}</TableCell>
                      <TableCell><Chip label="Aguardando" color="warning" size="small" variant="outlined" /></TableCell>
                      <TableCell>
                        <Button 
                          variant="contained" size="small" 
                          onClick={() => router.push(`/professor/disciplinas/${ativ?.modulo_id}/avaliacoes`)}
                        >
                          CORRIGIR
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Lista de Disciplinas */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Minhas Disciplinas</Typography>
          <Stack spacing={2}>
            {minhasDisciplinas.map((disc: any) => (
              <Paper key={disc.id} sx={{ p: 3, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 0, border: '1px solid #e2e8f0' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{disc.nome}</Typography>
                  <Typography variant="body2" color="text.secondary">{disc.descricao}</Typography>
                </Box>
                <Button 
                  variant="text" 
                  onClick={() => router.push(`/professor/disciplinas/${disc.id}`)}
                >
                  GERENCIAR
                </Button>
              </Paper>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}