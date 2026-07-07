"use client";

import { use, useState } from "react";
import { Box, Container, Typography, Tabs, Tab, Paper } from "@mui/material";

// Importação dos componentes modulares
import { AlunosTab } from "./components/AlunosTab";
import { ConteudoTab } from "./components/ConteudoTab";
import { AvaliacoesTab } from "./components/AvaliacoesTab";

export default function TurmaDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  // Desembrulhando os parâmetros de forma assíncrona conforme padrão Next.js 15+
  const { id } = use(params);
  
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho da Turma */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Disciplina - Turma {id}
        </Typography>
        <Typography color="text.secondary">
          Gestão completa de alunos, cronograma de módulos e central de avaliações.
        </Typography>
      </Box>

      {/* Navegação Interna (Tabs) */}
      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Alunos" />
          <Tab label="Conteúdo" />
          <Tab label="Avaliações" />
        </Tabs>
      </Paper>

      {/* Conteúdo Dinâmico das Abas */}
      <Box sx={{ minHeight: '400px' }}>
        {/* Aba 0: Gestão de Pessoas */}
        {tabValue === 0 && <AlunosTab disciplinaId={id} />}
        
        {/* Aba 1: Gestão de Conteúdo */}
        {tabValue === 1 && <ConteudoTab disciplinaId={id} />}
        
        {/* Aba 2: Central de Avaliações */}
        {tabValue === 2 && <AvaliacoesTab disciplinaId={id} />}
      </Box>
    </Container>
  );
}