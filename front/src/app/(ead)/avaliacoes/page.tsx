// para modificar para atividades
"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Stack,
  TextField,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  QuizOutlined,
  ChevronRight,
  MenuBookOutlined,
  SearchOutlined,
  CheckCircleOutlineOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ModuleActivityCard } from "@/services/poo/shared/types";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { useUser } from "@/new-services/auth/AuthContext";
import { ActivityProvider } from "@/services/poo/activity/activityProvider";

const database = DatabaseProvider.getDatabase();

export default function AtividadesPage() {
  const router = useRouter();
  const { user, effectiveRole } = useUser();
  const [search, setSearch] = useState("");

  const slugify = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleOpen = (module: ModuleActivityCard) => {
    if (!module?.moduleId) return;
    router.push(`/avaliacoes/${slugify(module.moduleName)}?id=${module.moduleId}`);
  };

  const data = useMemo(() => {
    if (!user) return [];
    return ActivityProvider.create(effectiveRole, database, user).listModules();
  }, [user, effectiveRole]);

  const filtered = data.filter((m) => {
    const text = [m.moduleName, m.disciplineName, m.courseName].join(" ").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((a) => {
      const arr = map.get(a.disciplineName) ?? [];
      arr.push(a);
      map.set(a.disciplineName, arr);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1 }}>Atividades</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Quizzes e exercícios organizados por disciplina.</Typography>

      {/* MODIFICAÇÃO (Etapa 3): Busca centralizada e limpa com InputAdornment corrigido */}
      <TextField
        fullWidth
        placeholder="Buscar por disciplina ou módulo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ color: "gray" }} />
              </InputAdornment>
            ),
          },
        }}
      /> 

      {/* MODIFICAÇÃO (Etapa 1): Grid responsivo de cards agrupados */}
      {groups.map(([discipline, activities]) => (
        <Box key={discipline} sx={{ mb: 6 }}>
          {/* Cabeçalho da disciplina com contador */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: "center" }}>
            <Box sx={{ p: 1.5, bgcolor: "primary.light", borderRadius: 2, color: "primary.main" }}>
              <MenuBookOutlined fontSize="small" />
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{discipline}</Typography>
            <Chip size="small" label={`${activities.length} atividades`} sx={{ fontWeight: 600 }} />
          </Stack>

          {/* MODIFICAÇÃO (Etapa 2): Cards de Atividade com status e ação clara */}
          <Grid container spacing={3}>
            {activities.map((module) => (
              <Grid key={module.moduleId} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ 
                  borderRadius: 3, 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column", 
                  boxShadow: "none", 
                  border: "1px solid #e0e0e0", 
                  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } 
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Box sx={{ p: 1.5, bgcolor: "#e3f2fd", borderRadius: 2, color: "primary.main" }}>
                        <QuizOutlined />
                      </Box>
                      <Typography sx={{ fontWeight: 700 }}>{module.moduleName}</Typography>
                    </Box>
                    <Chip label={`${module.quizzes.length} Quizzes`} size="small" sx={{ mb: 2, bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600 }} />
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Button fullWidth variant="outlined" endIcon={<ChevronRight />} onClick={() => handleOpen(module)}>
                      Iniciar Atividade
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* MODIFICAÇÃO (Etapa 4): Rodapé de conclusão limpo */}
      <Box sx={{ py: 6, borderTop: "1px solid #e0e0e0", textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CheckCircleOutlineOutlined fontSize="small" />
          Você visualizou todas as atividades disponíveis.
        </Typography>
      </Box>
    </Box>
  );
}