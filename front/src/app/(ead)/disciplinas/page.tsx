"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  Divider,
  FormGroup,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Circle,
  LayersOutlined,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircleOutlineOutlined, // Ícone adicionado para finalização
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useUser } from "@/services/auth/AuthContext";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";
import { DisciplineCard } from "@/services/poo/shared/types";

const database = DatabaseProvider.getDatabase();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function DisciplinasPage() {
  const router = useRouter();
  const { user, effectiveRole } = useUser();
  const isStudent = effectiveRole === "ALUNO";
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (id: number) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const provider = useMemo(() => {
    if (!user) return null;
    return DisciplineProvider.create(effectiveRole, database, user);
  }, [effectiveRole, user]);

  const data = useMemo(() => {
    if (!provider) return { grouped: [], modules: [], lessons: [], moduleProgress: [] };
    return provider.getPageData();
  }, [provider]);

  const openDiscipline = (discipline: DisciplineCard) => {
    const slug = slugify(discipline.nome);
    router.push(`/disciplinas/${slug}?id=${discipline.id}`);
  };

  const openModule = (moduleId: number) => {
    const firstLesson = data.lessons
      .filter((lesson) => lesson.modulo_id === moduleId)
      .sort((a, b) => a.ordem - b.ordem)[0];
    if (firstLesson) router.push(`/aulas/${firstLesson.id}`);
  };

  if (!provider) return <Box sx={{ p: 3 }}><Typography>Carregando...</Typography></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
        {isStudent ? "Minhas Disciplinas" : "Disciplinas"}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "gray", mb: 3 }}>
        {isStudent ? "Disciplinas do seu curso" : "Disciplinas disponíveis"}
      </Typography>

      {/* MODIFICAÇÃO (Etapa 4): mb: 6 para respiro final */}
      {data.grouped.map((group) => (
        <Box key={group.course?.id} sx={{ mb: 6 }}>
          {!isStudent && group.course && (
            <>
              <Typography sx={{ fontSize: 16, color: "gray" }}>{group.course.nome}</Typography>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <Grid container spacing={3}>
            {group.subjects.map((subject) => {
              const isOpen = openMap[subject.id] ?? false;
              const progress = subject.progress;

              return (
                <Grid key={subject.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1976d2', textTransform: 'uppercase' }}>
                          {group.course?.nome || "Disciplina"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {subject.modules.length} módulos
                        </Typography>
                      </Box>

                      <Box 
                        sx={{ cursor: "pointer", transition: "0.2s", "&:hover": { opacity: 0.8 } }} 
                        onClick={() => openDiscipline(subject)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                          <Box sx={{ p: 1.5, bgcolor: "#add3f8", borderRadius: 2 }}>
                            <LayersOutlined fontSize="small" sx={{ color: "#1976d2" }} />
                          </Box>
                          <Typography sx={{ fontWeight: "bold" }}>{subject.nome}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {subject.descricao}
                        </Typography>
                      </Box>

                      {isStudent && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="caption" color="text.secondary">Progresso</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{progress.percentage}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={progress.percentage} sx={{ mt: 0.5, height: 6, borderRadius: 5 }} />
                        </Box>
                      )}

                      <Divider sx={{ my: 1 }} />

                      <Box 
                        component="button" 
                        onClick={() => toggle(subject.id)} 
                        sx={{ 
                          border: "none", 
                          background: "transparent", 
                          width: "100%", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between", 
                          cursor: "pointer", 
                          p: 1,
                          borderRadius: 2,
                          "&:hover": { bgcolor: "#f5f5f5" }
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: "bold", color: isOpen ? 'primary.main' : 'text.primary' }}>
                          {isOpen ? "Ocultar módulos" : `Ver módulos (${subject.modules.length})`}
                        </Typography>
                        {isOpen ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon />}
                      </Box>

                      <Collapse in={isOpen}>
                        <Box sx={{ mt: 2 }}>
                          <FormGroup>
                            {subject.modules.map((module) => {
                              const completed = isStudent && subject.progress.completedModules > 0 
                                ? data.moduleProgress.some((p) => p.aluno_id === user?.id && p.modulo_id === module.id && p.concluido) 
                                : false;
                              const lessonsCount = data.lessons.filter((l) => l.modulo_id === module.id).length;
                              return (
                                <Box key={module.id} onClick={() => openModule(module.id)} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1, borderRadius: 2, cursor: "pointer", "&:hover": { bgcolor: "#f5f5f5" } }}>
                                  {completed ? <CheckCircle sx={{ fontSize: 18, color: "green" }} /> : <Circle sx={{ fontSize: 18, color: "gray" }} />}
                                  <Typography variant="body2">{module.nome}</Typography>
                                  <Typography variant="caption" sx={{ ml: "auto", color: "gray" }}>({lessonsCount} aulas)</Typography>
                                </Box>
                              );
                            })}
                          </FormGroup>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}

      {/* MODIFICAÇÃO (Etapa 4): Rodapé de conclusão profissional */}
      <Box sx={{ py: 3, borderTop: "1px solid #e0e0e0", textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CheckCircleOutlineOutlined fontSize="small" />
          Você visualizou todas as suas disciplinas.
        </Typography>
      </Box>
    </Box>
  );
}