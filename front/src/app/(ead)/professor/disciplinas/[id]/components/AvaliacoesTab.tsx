"use client";

import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Button, Chip 
} from "@mui/material";
import mockData from "@/components/mock.json";

export function AvaliacoesTab({ disciplinaId }: { disciplinaId: string }) {
  // 1. Filtra atividades da disciplina
  const atividades = mockData.atividades.filter(
    (a: any) => mockData.modulos.find(m => m.id === a.modulo_id)?.disciplina_id === Number(disciplinaId)
  );

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0, border: '1px solid #e2e8f0' }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell>Atividade</TableCell>
            <TableCell>Módulo</TableCell>
            <TableCell align="center">Submissões</TableCell>
            <TableCell align="center">Ação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {atividades.map((ativ: any) => {
            const modulo = mockData.modulos.find((m: any) => m.id === ativ.modulo_id);
            const tentativas = mockData.tentativas_atividade.filter((t: any) => t.atividade_id === ativ.id);
            
            return (
              <TableRow key={ativ.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{ativ.titulo}</Typography>
                </TableCell>
                <TableCell>{modulo?.nome}</TableCell>
                <TableCell align="center">
                  <Chip label={`${tentativas.length} enviadas`} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small">Ver Detalhes</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}