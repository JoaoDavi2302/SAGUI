"use client";

import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText } from "@mui/material";
import { ExpandMore, PlayCircleOutlineOutlined } from "@mui/icons-material";
import mockData from "@/components/mock.json"; //

export function ConteudoTab({ disciplinaId }: { disciplinaId: string }) {
  // Filtra os módulos da disciplina selecionada
  const modulosDaDisciplina = mockData.modulos.filter(
    (m: any) => m.disciplina_id === Number(disciplinaId)
  );

  return (
    <Box>
      {modulosDaDisciplina.length > 0 ? (
        modulosDaDisciplina.map((modulo: any) => (
          <Accordion key={modulo.id} sx={{ mb: 1, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ fontWeight: 600 }}>{modulo.nome}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {modulo.descricao}
              </Typography>
              <List disablePadding>
                {/* Filtra as aulas vinculadas a este módulo */}
                {mockData.aulas.filter((a: any) => a.modulo_id === modulo.id).map((aula: any) => (
                  <ListItem key={aula.id} sx={{ borderBottom: '1px solid #f1f5f9' }}>
                    <PlayCircleOutlineOutlined sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
                    <ListItemText primary={aula.titulo} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Nenhum conteúdo disponível para esta disciplina.
        </Typography>
      )}
    </Box>
  );
}