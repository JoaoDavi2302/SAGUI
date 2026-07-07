"use client";

import { useDashboard } from "@/components/DashboardProvider";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box 
} from "@mui/material";

export function AvaliacoesCorrecao({ disciplinaId }: { disciplinaId: number }) {
  const { data } = useDashboard();

  // Filtra tentativas de atividades onde a nota ainda é nula (pendente)
  // e que pertencem à disciplina atual
  const pendencias = data.tentativas_atividade.filter((t: any) => {
    const atividade = data.atividades.find((a: any) => a.id === t.atividade_id);
    const modulo = data.modulos.find((m: any) => m.id === atividade?.modulo_id);
    return modulo?.disciplina_id === disciplinaId && t.nota === null;
  });

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0, border: '1px solid #e2e8f0' }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Aluno</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Atividade</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Ação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendencias.length > 0 ? (
            pendencias.map((p: any) => {
              const aluno = data.usuarios.find((u: any) => u.id === p.aluno_id);
              const ativ = data.atividades.find((a: any) => a.id === p.atividade_id);
              return (
                <TableRow key={p.id} hover>
                  <TableCell>{aluno?.nome || "Desconhecido"}</TableCell>
                  <TableCell>{ativ?.titulo || "Atividade Removida"}</TableCell>
                  <TableCell align="center">
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => {
                        // Aqui você pode implementar a lógica para abrir o modal de correção
                        console.log("Abrir modal de correção para a tentativa:", p.id);
                      }}
                    >
                      Corrigir
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={3} sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">Nenhuma pendência de correção encontrada.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}