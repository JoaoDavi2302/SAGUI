"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, Typography, Accordion, AccordionSummary, AccordionDetails, 
  Button, Divider, Dialog, DialogTitle, DialogContent, 
  TextField, DialogActions, IconButton 
} from "@mui/material";
import { ExpandMore, Edit, Add, PlayCircleOutlineOutlined, Delete } from "@mui/icons-material";
import { useDashboard } from "@/components/DashboardProvider";
import toast from 'react-hot-toast';

export function ConteudoTab({ disciplinaId }: { disciplinaId: number }) {
  const { 
    data, 
    handleAddAula, // Adicionado para criação correta
    handleEditAula, 
    handleDeleteAula, 
    handleAddModulo, 
    handleEditModulo, 
    handleDeleteModulo 
  } = useDashboard();
  
  const router = useRouter();
  
  const [openModal, setOpenModal] = useState<{
    type: 'addModulo' | 'editAula' | 'editModulo' | undefined, 
    id?: number, 
    value: string
  }>({ type: undefined, value: '' });

  const abrirAula = (aulaId: number) => {
    router.push(`/professor/disciplinas/${disciplinaId}/aula/${aulaId}`);
  };

  const handleCriarAulaRapida = (moduloId: number) => {
    const novaAulaId = Date.now();
    // Persiste no Provider antes de navegar
    handleAddAula({ 
      id: novaAulaId, 
      titulo: "Nova Aula", 
      modulo_id: moduloId,
      conteudo: "", 
      video_url: "", 
      material_apoio: [] 
    });
    router.push(`/professor/disciplinas/${disciplinaId}/aula/${novaAulaId}`);
    toast.success("Aula criada! Adicione o conteúdo.");
  };

  const handleSalvar = () => {
    if (openModal.type === 'editAula' && openModal.id) {
      handleEditAula(openModal.id, openModal.value);
      toast.success("Aula renomeada!");
    } else if (openModal.type === 'addModulo') {
      handleAddModulo({ nome: openModal.value, disciplina_id: disciplinaId });
      toast.success("Módulo criado!");
    } else if (openModal.type === 'editModulo' && openModal.id) {
      handleEditModulo(openModal.id, openModal.value);
      toast.success("Módulo renomeado!");
    }
    setOpenModal({ type: undefined, id: undefined, value: '' });
  };

  const modulos = data.modulos.filter((m: any) => m.disciplina_id === disciplinaId);

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal({ type: 'addModulo', value: '' })}>
          Novo Módulo
        </Button>
      </Box>

      {modulos.map((modulo: any) => (
        <Accordion key={modulo.id} sx={{ mb: 1, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography sx={{ fontWeight: 600 }}>{modulo.nome}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                <Box component="span" onClick={() => setOpenModal({ type: 'editModulo', id: modulo.id, value: modulo.nome })} sx={{ cursor: 'pointer', display: 'flex', color: 'action.active' }}>
                  <Edit fontSize="small" />
                </Box>
                <Box component="span" onClick={() => { handleDeleteModulo(modulo.id); toast.error("Módulo excluído"); }} sx={{ cursor: 'pointer', display: 'flex', color: 'error.main' }}>
                  <Delete fontSize="small" />
                </Box>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: '#f8fafc' }}>
            {data.aulas.filter((a: any) => a.modulo_id === modulo.id).map((aula: any) => (
              <Box key={aula.id} sx={{ display: 'flex', alignItems: 'center', py: 1, px: 2 }}>
                <IconButton onClick={() => abrirAula(aula.id)}>
                  <PlayCircleOutlineOutlined color="primary" />
                </IconButton>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>{aula.titulo}</Typography>
                <IconButton size="small" onClick={() => setOpenModal({ type: 'editAula', id: aula.id, value: aula.titulo })}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => { handleDeleteAula(aula.id); toast.error("Aula excluída"); }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Button startIcon={<Add />} size="small" onClick={() => handleCriarAulaRapida(modulo.id)}>
              Novo Material
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={!!openModal.type} onClose={() => setOpenModal({ type: undefined, id: undefined, value: '' })} fullWidth maxWidth="xs">
        <DialogTitle>{openModal.type === 'editAula' ? 'Renomear Aula' : openModal.type === 'addModulo' ? 'Novo Módulo' : 'Renomear Módulo'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Título" sx={{ mt: 1 }} value={openModal.value} onChange={(e) => setOpenModal({ ...openModal, value: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal({ type: undefined, id: undefined, value: '' })}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvar}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}