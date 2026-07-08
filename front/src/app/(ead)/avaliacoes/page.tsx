"use client";

<<<<<<< HEAD
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
=======
import { useMemo, useState } from "react";
>>>>>>> origin/develop
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
<<<<<<< HEAD
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutlineOutlined,
  ChevronRight,
  MenuBookOutlined,
  QuizOutlined,
=======
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
>>>>>>> origin/develop
  SearchOutlined,
  CheckCircleOutlineOutlined,
} from "@mui/icons-material";
<<<<<<< HEAD
import { useRouter, useSearchParams } from "next/navigation";

import { useUser } from "@/new-services/auth/AuthContext";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";
import { getDisciplineProgress } from "@/new-services/poo/shared/api/progress";
import {
  listStudentActivities,
  type ActivityStudentSummaryResponse,
} from "@/new-services/poo/shared/api/activities";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { ActivityProvider } from "@/services/poo/activity/activityProvider";
import { ModuleActivityCard } from "@/services/poo/shared/types";
import { slugify } from "@/components/layout/headerConfig";

const database = DatabaseProvider.getDatabase();

interface ActivityGroupItem extends ActivityStudentSummaryResponse {
  moduleName: string;
  disciplineName: string;
}

function StudentActivitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const { approvedEnrollments } = useMyEnrollments();

  const [activities, setActivities] = useState<ActivityGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const items: ActivityGroupItem[] = [];

        for (const enrollment of approvedEnrollments) {
          const progress = await getDisciplineProgress(enrollment.disciplineId);
          const unlockedModules = progress.modules.filter((m) => m.unlocked);

          for (const module of unlockedModules) {
            const moduleActivities = await listStudentActivities(module.moduleId);
            moduleActivities.forEach((activity) => {
              items.push({
                ...activity,
                moduleName: module.moduleName,
                disciplineName: enrollment.disciplineName,
              });
            });
          }
        }

        setActivities(items);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [approvedEnrollments]);

  const filtered = activities.filter((activity) => {
    const text = [activity.title, activity.moduleName, activity.disciplineName]
      .join(" ")
      .toLowerCase();
=======
import { useRouter } from "next/navigation";
import { ModuleActivityCard } from "@/services/poo/shared/types";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { useUser } from "@/services/auth/AuthContext";
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
>>>>>>> origin/develop
    return text.includes(search.toLowerCase());
  });

  const groups = useMemo(() => {
<<<<<<< HEAD
    const map = new Map<string, ActivityGroupItem[]>();
    filtered.forEach((activity) => {
      const arr = map.get(activity.disciplineName) ?? [];
      arr.push(activity);
      map.set(activity.disciplineName, arr);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1 }}>
        Atividades
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {search.trim()
          ? `Exibindo ${filtered.length} resultado(s) para "${search}".`
          : "Quizzes e exercícios organizados por disciplina."}
      </Typography>

      <TextField
        fullWidth
        placeholder="Buscar por disciplina, módulo ou atividade..."
        value={search}
        onChange={(e) => {
          const value = e.target.value;
          router.push(
            value.trim()
              ? `/avaliacoes?q=${encodeURIComponent(value)}`
              : "/avaliacoes",
          );
        }}
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

      {groups.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
          Nenhuma atividade disponível nos módulos liberados.
        </Typography>
      ) : (
        groups.map(([discipline, disciplineActivities]) => (
          <Box key={discipline} sx={{ mb: 6 }}>
            <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: "center" }}>
              <Box sx={{ p: 1.5, bgcolor: "primary.light", borderRadius: 2, color: "primary.main" }}>
                <MenuBookOutlined fontSize="small" />
              </Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{discipline}</Typography>
              <Chip size="small" label={`${disciplineActivities.length} atividades`} sx={{ fontWeight: 600 }} />
            </Stack>

            <Grid container spacing={3}>
              {disciplineActivities.map((activity) => (
                <Grid key={activity.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "none",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: "#e3f2fd", borderRadius: 2, color: "primary.main" }}>
                          <QuizOutlined />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{activity.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.moduleName}
                          </Typography>
                        </Box>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                        <Chip
                          size="small"
                          label={`${activity.attemptsUsed}/${activity.attemptLimit} tentativas`}
                          variant="outlined"
                        />
                        {activity.bestScore !== null && (
                          <Chip size="small" label={`Melhor: ${activity.bestScore.toFixed(1)}`} />
                        )}
                        {activity.hasApprovedAttempt && (
                          <Chip size="small" label="Aprovado" color="success" />
                        )}
                      </Stack>
                    </CardContent>

                    <Box sx={{ p: 2 }}>
                      <Button
                        component={Link}
                        href={`/avaliacoes/atividade?id=${activity.id}`}
                        fullWidth
                        variant="outlined"
                        endIcon={<ChevronRight />}
                      >
                        {activity.hasApprovedAttempt ? "Ver resultado" : "Iniciar atividade"}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {groups.length > 0 && (
        <Box sx={{ py: 6, borderTop: "1px solid #e0e0e0", textAlign: "center", mt: 4 }}>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
          >
            <CheckCircleOutlineOutlined fontSize="small" />
            Você visualizou todas as atividades disponíveis.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function LegacyActivitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, effectiveRole } = useUser();
  const isAdmin = effectiveRole === "Admin";
  const search = searchParams.get("q") ?? "";

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
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1 }}>
        {isAdmin ? "Avaliações" : "Atividades"}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Quizzes e exercícios organizados por disciplina.
      </Typography>

      {groups.map(([discipline, activities]) => (
        <Box key={discipline} sx={{ mb: 6 }}>
=======
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined sx={{ color: "gray" }} />
            </InputAdornment>
          ),
        }}
      /> 

      {/* MODIFICAÇÃO (Etapa 1): Grid responsivo de cards agrupados */}
      {groups.map(([discipline, activities]) => (
        <Box key={discipline} sx={{ mb: 6 }}>
          {/* Cabeçalho da disciplina com contador */}
>>>>>>> origin/develop
          <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: "center" }}>
            <Box sx={{ p: 1.5, bgcolor: "primary.light", borderRadius: 2, color: "primary.main" }}>
              <MenuBookOutlined fontSize="small" />
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{discipline}</Typography>
            <Chip size="small" label={`${activities.length} atividades`} sx={{ fontWeight: 600 }} />
          </Stack>

<<<<<<< HEAD
          <Grid container spacing={3}>
            {activities.map((module) => (
              <Grid key={module.moduleId} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ borderRadius: 3, height: "100%", border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 700 }}>{module.moduleName}</Typography>
                    <Chip label={`${module.quizzes.length} Quizzes`} size="small" sx={{ mt: 1 }} />
                  </CardContent>
                  <Box sx={{ p: 2 }}>
                    <Button fullWidth variant="outlined" endIcon={<ChevronRight />} onClick={() => handleOpen(module)}>
                      Ver atividades
=======
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
>>>>>>> origin/develop
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
<<<<<<< HEAD
}

function AtividadesPageContent() {
  const { effectiveRole } = useUser();

  if (effectiveRole === "Aluno") {
    return <StudentActivitiesContent />;
  }

  return <LegacyActivitiesContent />;
}

export default function AtividadesPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <AtividadesPageContent />
    </Suspense>
  );
}
=======
}
>>>>>>> origin/develop
