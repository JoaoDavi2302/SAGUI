"use client";

import { Box, Container, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, IconButton, Divider } from "@mui/material";
import { Event, ChevronRight, School } from "@mui/icons-material";
import { useUser } from "@/services/auth/AuthContext";
import mockData from "@/components/mock.json";

export default function CalendarioPage() {
  const { user } = useUser();

  const minhasDisciplinas = mockData.disciplinas.filter((d: any) => Number(d.professor_id) === Number(user?.id));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Calendário Acadêmico</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Gestão de prazos e eventos por disciplina.
      </Typography>

      {minhasDisciplinas.map((disciplina: any) => {
        const eventosDaDisciplina = mockData.atividades
          .filter((a: any) => a.data_entrega && mockData.modulos.find(m => m.id === a.modulo_id)?.disciplina_id === disciplina.id);

        if (eventosDaDisciplina.length === 0) return null;

        return (
          <Paper key={disciplina.id} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.main', p: 2, display: 'flex', alignItems: 'center' }}>
              <School sx={{ color: 'white', mr: 1 }} />
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>{disciplina.nome}</Typography>
            </Box>
            <List disablePadding>
              {eventosDaDisciplina.map((evento: any) => (
                <ListItem key={evento.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'background.default', color: 'primary.main' }}><Event /></Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={evento.titulo} 
                    secondary={`Prazo: ${new Date(evento.data_entrega).toLocaleDateString('pt-BR')}`} 
                  />
                  <Chip label="Corrigir" color="primary" size="small" clickable onClick={() => console.log('Redirecionar')} />
                  <IconButton><ChevronRight /></IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        );
      })}
    </Container>
  );
}