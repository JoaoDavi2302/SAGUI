"use client";

import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Avatar, Typography, Chip 
} from "@mui/material";
import mockData from "@/components/mock.json"; // Ajuste o caminho conforme seu projeto

export function AlunosTab({ disciplinaId }: { disciplinaId: string }) {
  // 1. Encontrar a disciplina atual para saber qual o curso_id dela
  const disciplina = mockData.disciplinas.find(d => d.id === Number(disciplinaId));
  
  // 2. Filtrar as matrículas que pertencem ao curso da disciplina
  const matriculasDoCurso = mockData.matriculas.filter(
    (m: any) => m.curso_id === disciplina?.curso_id
  );

  // 3. Mapear os usuários encontrados nessas matrículas
  const alunos = matriculasDoCurso.map((m: any) => {
    const usuario = mockData.usuarios.find((u: any) => u.id === m.aluno_id);
    return { ...usuario, status: m.status };
  });

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0, border: '1px solid #e2e8f0' }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell>Aluno</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alunos.length > 0 ? (
            alunos.map((aluno: any) => (
              <TableRow key={aluno.id} hover>
                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, fontSize: '0.8rem' }}>
                    {aluno.nome?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {aluno.nome}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={aluno.status} 
                    color={aluno.status === "APROVADA" ? "success" : "warning"} 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>{aluno.email}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  Nenhum aluno matriculado nesta disciplina.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}