"use client";

import { useState } from "react";
import { 
  Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, 
  FormControl, InputLabel, Select, MenuItem 
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useDashboard } from "@/components/DashboardProvider";
import { AvaliacoesCorrecao } from "./AvaliacoesCorrecao"; // Importa seu componente pronto
import toast from 'react-hot-toast';

export function AvaliacoesTab({ disciplinaId }: { disciplinaId: number }) {
  const { data, handleSaveAvaliacao, handleDeleteAvaliacao } = useDashboard();
  
  const [tabAtual, setTabAtual] = useState(0);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    titulo: "", modulo_id: "", data_entrega: "", descricao: ""
  });

  const atividades = data.atividades.filter(
    (a: any) => data.modulos.find((m: any) => m.id === a.modulo_id)?.disciplina_id === disciplinaId
  );
  const modulosDaDisciplina = data.modulos.filter((m: any) => m.disciplina_id === disciplinaId);

  const handleOpen = (ativ?: any) => {
    setFormData(ativ || { titulo: "", modulo_id: "", data_entrega: "", descricao: "" });
    setOpen(true);
  };

  const handleSalvar = () => {
    handleSaveAvaliacao(formData);
    toast.success("Avaliação salva com sucesso!");
    setOpen(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Abas para alternar entre Gerenciamento e Correção */}
      <Tabs value={tabAtual} onChange={(_, newValue) => setTabAtual(newValue)} sx={{ mb: 3 }}>
        <Tab label="Gerenciamento de Avaliações" />
        <Tab label="Correções Pendentes" />
      </Tabs>

      {/* Visão 1: Gerenciamento */}
      {tabAtual === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
              Nova Avaliação
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0, border: '1px solid #e2e8f0' }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Atividade</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Módulo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Data de Entrega</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {atividades.map((ativ: any) => (
                  <TableRow key={ativ.id} hover>
                    <TableCell>{ativ.titulo}</TableCell>
                    <TableCell>{data.modulos.find((m: any) => m.id === ativ.modulo_id)?.nome}</TableCell>
                    <TableCell>{ativ.data_entrega}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleOpen(ativ)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => { handleDeleteAvaliacao(ativ.id); toast.error("Avaliação excluída"); }}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Visão 2: Correções Pendentes (Importado do seu outro arquivo) */}
      {tabAtual === 1 && (
        <AvaliacoesCorrecao disciplinaId={disciplinaId} />
      )}

      {/* Modal de Cadastro/Edição */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{formData.id ? "Editar Avaliação" : "Nova Avaliação"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Título da Atividade" sx={{ mt: 1, mb: 2 }} value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Módulo</InputLabel>
            <Select value={formData.modulo_id || ""} label="Módulo" onChange={(e) => setFormData({...formData, modulo_id: e.target.value})}>
              {modulosDaDisciplina.map((m: any) => <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth type="date" label="Data de Entrega" slotProps={{ inputLabel: { shrink: true } }} sx={{ mb: 2 }} value={formData.data_entrega} onChange={(e) => setFormData({...formData, data_entrega: e.target.value})} />
          <TextField fullWidth label="Especificação/Descrição" multiline rows={3} value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvar}>Salvar Avaliação</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}