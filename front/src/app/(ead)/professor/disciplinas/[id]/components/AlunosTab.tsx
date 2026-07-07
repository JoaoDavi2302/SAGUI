"use client";

import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Avatar, Typography, Chip, IconButton, Tooltip 
} from "@mui/material";
import { Message, CheckCircle, Warning, Error } from "@mui/icons-material";
import { useDashboard } from "@/components/DashboardProvider"; // Importe o contexto

export function AlunosTab({ disciplinaId }: { disciplinaId: number }) {
  // Consome os dados reativos do contexto
  const { data } = useDashboard();

  // Filtra as matrículas usando o estado reativo 'data'
  const matriculasDaDisciplina = data.matriculas.filter(
    (m: any) => m.disciplina_id === disciplinaId
  );

  const getStatusChip = (status: string) => {
    switch (status) {
      case "APROVADA": 
        return <Chip icon={<CheckCircle />} label="Aprovado" color="success" size="small" variant="outlined" />;
      case "EM_RISCO": 
        return <Chip icon={<Warning />} label="Em Risco" color="warning" size="small" variant="outlined" />;
      default: 
        return <Chip icon={<Error />} label={status} color="error" size="small" variant="outlined" />;
    }
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0, border: '1px solid #e2e8f0' }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Aluno</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Ação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matriculasDaDisciplina.map((matricula: any) => {
            const aluno = data.usuarios.find((u: any) => u.id === matricula.aluno_id);
            return (
              <TableRow key={matricula.id} hover>
                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, fontSize: '0.8rem' }}>
                    {aluno?.nome?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{aluno?.nome}</Typography>
                </TableCell>
                <TableCell>
                  {getStatusChip(matricula.status)}
                </TableCell>
                <TableCell>{aluno?.email}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Tooltip title="Enviar Mensagem Direta">
                    <IconButton color="primary">
                      <Message />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}