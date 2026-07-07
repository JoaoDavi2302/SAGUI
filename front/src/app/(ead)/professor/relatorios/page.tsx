"use client";

import { Box, Container, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from "@mui/material";
import { TrendingUp, WarningAmber, Group } from "@mui/icons-material";
import { useUser } from "@/services/auth/AuthContext";
import mockData from "@/components/mock.json";

export default function RelatoriosPage() {
  const { user, loading } = useUser();

  if (loading) return <div>Carregando...</div>;

  // 1. Filtro estrito: Apenas disciplinas onde este usuário é o professor[cite: 9]
  const minhasDisciplinas = mockData.disciplinas.filter((d: any) => 
    Number(d.professor_id) === Number(user?.id)
  );
  const idsMinhasDisciplinas = minhasDisciplinas.map(d => d.id);

  // 2. Filtrar turmas APENAS destas disciplinas[cite: 9]
  const minhasTurmas = mockData.turmas.filter(t => 
    idsMinhasDisciplinas.includes(t.disciplina_id)
  );

  // 3. Cálculo de alunos considerando APENAS minhas turmas[cite: 9]
  const totalAlunos = minhasTurmas.reduce((acc, t) => acc + (t.total_alunos || 0), 0);

  // 4. Média geral e risco APENAS das atividades destas disciplinas[cite: 9]
  const modulosDoProfessor = mockData.modulos
    .filter(m => idsMinhasDisciplinas.includes(m.disciplina_id))
    .map(m => m.id);
    
  const atividadesDoProfessor = mockData.atividades.filter(a => modulosDoProfessor.includes(a.modulo_id));
  const idsAtividades = atividadesDoProfessor.map(a => a.id);
  
  const minhasTentativas = mockData.tentativas_atividade.filter(t => idsAtividades.includes(t.atividade_id));
  
  const somaNotas = minhasTentativas.reduce((acc, t) => acc + t.nota, 0);
  const mediaGeral = minhasTentativas.length > 0 ? (somaNotas / minhasTentativas.length).toFixed(1) : 0;
  const alunosEmRisco = minhasTentativas.filter(t => t.nota < 60).length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Relatórios de Desempenho</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid>
          <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center' }}>
            <Group sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalAlunos}</Typography>
              <Typography color="text.secondary">Alunos Matriculados</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{mediaGeral}</Typography>
              <Typography color="text.secondary">Média Geral (Tentativas)</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center' }}>
            <WarningAmber sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{alunosEmRisco}</Typography>
              <Typography color="text.secondary">Tentativas Abaixo de 60%</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700 }}>Disciplina</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Turma</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Alunos</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {minhasTurmas.map((turma: any) => {
              const disciplina = minhasDisciplinas.find(d => d.id === turma.disciplina_id);
              return (
                <TableRow key={turma.id}>
                  <TableCell>{disciplina?.nome}</TableCell>
                  <TableCell>{turma.nome}</TableCell>
                  <TableCell>{turma.total_alunos}</TableCell>
                  <TableCell>
                    <Chip label="Ativo" color="success" size="small" variant="outlined" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}