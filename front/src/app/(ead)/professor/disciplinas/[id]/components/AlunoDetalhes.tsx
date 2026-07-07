"use client";

import { 
  Box, Typography, Divider, Drawer, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip 
} from "@mui/material";
import { useDashboard } from "@/components/DashboardProvider";

export function AlunoDetalhes({ alunoId, open, onClose }: { alunoId: number, open: boolean, onClose: () => void }) {
  const { data } = useDashboard();
  
  const aluno = data.usuarios.find((u: any) => u.id === alunoId);
  // Filtra apenas as tentativas deste aluno
  const tentativas = data.tentativas_atividade.filter((t: any) => t.aluno_id === alunoId);

  if (!aluno) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ sx: { width: 600 } }}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{aluno.nome}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{aluno.email}</Typography>
        
        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Histórico de Atividades</Typography>
        
        <TableContainer component={Paper} sx={{ boxShadow: 0, border: '1px solid #e2e8f0' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Atividade</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Nota</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tentativas.length > 0 ? (
                tentativas.map((t: any) => {
                  // Busca o título da atividade no mock.json usando o atividade_id
                  const atividade = data.atividades?.find((a: any) => a.id === t.atividade_id);
                  
                  // Formata a data (removendo o "T" e segundos para ficar limpo)
                  const dataFormatada = new Date(t.realizado_em).toLocaleDateString('pt-BR');

                  return (
                    <TableRow key={t.id}>
                      <TableCell>{atividade?.titulo || "Atividade não encontrada"}</TableCell>
                      <TableCell>{dataFormatada}</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{t.nota.toFixed(2)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip 
                          size="small" 
                          label={t.nota >= 70 ? "Aprovado" : "Pendente"} 
                          color={t.nota >= 70 ? "success" : "warning"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}>
                    Nenhuma atividade registrada para este aluno.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Drawer>
  );
}