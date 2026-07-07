"use client";

import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Button, Chip, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, Box 
} from "@mui/material";
import { useDashboard } from "@/components/DashboardProvider";
import toast from 'react-hot-toast'; // Importação do feedback visual

export function AvaliacoesTab({ disciplinaId }: { disciplinaId: number }) {
  const { data, handleUpdateNota } = useDashboard();
  
  const [open, setOpen] = useState(false);
  const [selectedAtv, setSelectedAtv] = useState<any>(null);
  const [novaNota, setNovaNota] = useState("");

  const atividades = data.atividades.filter(
    (a: any) => data.modulos.find((m: any) => m.id === a.modulo_id)?.disciplina_id === disciplinaId
  );

  const handleOpen = (ativ: any) => {
    // Busca a primeira tentativa pendente desta atividade
    const tentativa = data.tentativas_atividade.find((t: any) => t.atividade_id === ativ.id);
    setSelectedAtv({ ...ativ, tentativa });
    setNovaNota("");
    setOpen(true);
  };

  const handleSalvar = () => {
    if (!selectedAtv?.tentativa) return;
    
    // Atualiza a nota e dispara o gatilho de status via Provider
    handleUpdateNota(selectedAtv.tentativa.aluno_id, selectedAtv.id, Number(novaNota));
    
    setOpen(false);
    toast.success("Nota atualizada com sucesso!"); // Feedback visual[cite: 6]
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0, border: '1px solid #e2e8f0' }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Atividade</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Módulo</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Submissões</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Ação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {atividades.map((ativ: any) => {
            const modulo = data.modulos.find((m: any) => m.id === ativ.modulo_id);
            const tentativas = data.tentativas_atividade.filter((t: any) => t.atividade_id === ativ.id);
            
            return (
              <TableRow key={ativ.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{ativ.titulo}</Typography>
                </TableCell>
                <TableCell>{modulo?.nome}</TableCell>
                <TableCell align="center">
                  <Chip label={`${tentativas.length} enviadas`} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" onClick={() => handleOpen(ativ)}>
                    Ver Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Correção: {selectedAtv?.titulo}</DialogTitle>
        <DialogContent>
          {/* Identificação do Aluno */}
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">Aluno:</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {data.usuarios.find((u: any) => u.id === selectedAtv?.tentativa?.aluno_id)?.nome || "Aluno não identificado"}
            </Typography>
          </Box>

          <TextField 
            fullWidth label="Nota do Aluno" type="number" sx={{ mt: 2, mb: 2 }} 
            value={novaNota}
            onChange={(e) => setNovaNota(e.target.value)}
          />
          <TextField fullWidth label="Feedback ao Aluno" multiline rows={4} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvar}>
            Salvar e Notificar
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
}