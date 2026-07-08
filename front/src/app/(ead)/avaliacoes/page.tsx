'use client';

<<<<<<< HEAD
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
=======
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
>>>>>>> b9cf9fa16ffec7fd25b3dd99c1514ec7d8b269aa
import {
  Alert,
  Box,
<<<<<<< HEAD
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Cancel,
  Pending,
  SearchOutlined,
  QuizOutlined,
  MenuBookOutlined,
  CheckCircleOutlineOutlined,
} from '@mui/icons-material';
import { useUser } from '@/new-services/auth/AuthContext';
import { useMyEnrollments } from '@/hooks/useMyEnrollments';
import { getDisciplineProgress } from '@/new-services/poo/shared/api/progress';
import { listStudentActivities } from '@/new-services/poo/shared/api/activities';
import { getApiErrorMessage } from '@/utils/apiErrorMessage';
import { useRouter, useSearchParams } from 'next/navigation';
=======
  Button,
  Card,
  CardContent,
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
  SearchOutlined,
} from "@mui/icons-material";
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
>>>>>>> b9cf9fa16ffec7fd25b3dd99c1514ec7d8b269aa

interface ActivityWithDetails {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
  disciplineId: string;
  disciplineName: string;
  attemptsUsed: number;
  attemptLimit: number;
  bestScore: number | null;
  hasApprovedAttempt: boolean;
  minimumScore: number;
}

<<<<<<< HEAD
interface GroupedActivity {
  disciplineName: string;
  moduleId: string;
  moduleName: string;
  activities: ActivityWithDetails[];
}

function AvaliacoesPageContent() {
=======
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
    return text.includes(search.toLowerCase());
  });

  const groups = useMemo(() => {
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
>>>>>>> b9cf9fa16ffec7fd25b3dd99c1514ec7d8b269aa
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const { user, effectiveRole } = useUser();
  const { approvedEnrollments, loading: loadingEnrollments } = useMyEnrollments();
  const [activities, setActivities] = useState<ActivityWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    async function loadData() {
      // Evitar múltiplas chamadas
      if (loadingRef.current) return;
      loadingRef.current = true;

      // Se já carregou, não recarregar
      if (loaded) {
        loadingRef.current = false;
        return;
      }

      if (approvedEnrollments.length === 0) {
        setActivities([]);
        setLoading(false);
        setLoaded(true);
        loadingRef.current = false;
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const allActivities: ActivityWithDetails[] = [];

        for (const enrollment of approvedEnrollments) {
          try {
            const progress = await getDisciplineProgress(enrollment.disciplineId);

            const unlockedModules = progress.modules?.filter((m) => m.unlocked) || [];

            for (const mod of unlockedModules) {
              try {
                const moduleActivities = await listStudentActivities(mod.moduleId);
                allActivities.push(
                  ...moduleActivities.map((a) => ({
                    ...a,
                    disciplineId: enrollment.disciplineId,
                    disciplineName: enrollment.disciplineName,
                  }))
                );
              } catch {
                // Módulo sem atividades ou erro
              }
            }
          } catch {
            // Disciplina sem progresso
          }
        }

        setActivities(allActivities);
        setLoaded(true);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    }

    if (!loadingEnrollments) {
      loadData();
    }
  }, [approvedEnrollments, loadingEnrollments]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, GroupedActivity> = {};

    activities.forEach((activity) => {
      const key = `${activity.disciplineName}-${activity.moduleId}`;
      if (!groups[key]) {
        groups[key] = {
          disciplineName: activity.disciplineName,
          moduleId: activity.moduleId,
          moduleName: activity.moduleName,
          activities: [],
        };
      }
      groups[key].activities.push(activity);
    });

    return Object.values(groups);
  }, [activities]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedActivities;

    return groupedActivities.filter((group) =>
      group.disciplineName.toLowerCase().includes(search.toLowerCase()) ||
      group.moduleName.toLowerCase().includes(search.toLowerCase())
    );
  }, [groupedActivities, search]);

  if (loading || loadingEnrollments) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Avaliações
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
<<<<<<< HEAD
        {search.trim()
          ? `Exibindo ${filteredGroups.reduce((acc, g) => acc + g.activities.length, 0)} resultado(s) para "${search}".`
          : 'Quizzes e exercícios organizados por disciplina.'}
      </Typography>

      <TextField
        fullWidth
        placeholder="Buscar por disciplina ou módulo..."
        value={search}
        onChange={(e) => {
          const value = e.target.value;
          router.push(
            value.trim()
              ? `/avaliacoes?q=${encodeURIComponent(value)}`
              : '/avaliacoes'
          );
        }}
        sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ color: 'gray' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {filteredGroups.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            {search.trim()
              ? 'Nenhum resultado encontrado para sua busca.'
              : 'Nenhuma avaliação disponível no momento.'}
          </Typography>
          {search.trim() && (
            <Button
              variant="outlined"
              onClick={() => router.push('/avaliacoes')}
              sx={{ mt: 2 }}
            >
              Limpar busca
            </Button>
          )}
        </Box>
      )}

      {filteredGroups.map((group) => (
        <Box key={`${group.disciplineName}-${group.moduleId}`} sx={{ mb: 6 }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
            <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.main' }}>
=======
        Quizzes e exercícios organizados por disciplina.
      </Typography>

      {groups.map(([discipline, activities]) => (
        <Box key={discipline} sx={{ mb: 6 }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: "center" }}>
            <Box sx={{ p: 1.5, bgcolor: "primary.light", borderRadius: 2, color: "primary.main" }}>
>>>>>>> b9cf9fa16ffec7fd25b3dd99c1514ec7d8b269aa
              <MenuBookOutlined fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {group.disciplineName}
            </Typography>
            <Chip
              size="small"
              label={`${group.activities.length} atividade(s)`}
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Grid container spacing={3}>
<<<<<<< HEAD
            {group.activities.map((activity) => (
              <Grid key={activity.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  component={Link}
                  href={`/avaliacoes/atividade?id=${activity.id}`}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: 'none',
                    border: '1px solid #e0e0e0',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2, color: 'primary.main' }}>
                        <QuizOutlined />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                        {activity.title}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      {group.moduleName}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${activity.attemptsUsed}/${activity.attemptLimit} tentativas`}
                        size="small"
                        color={activity.attemptsUsed >= activity.attemptLimit ? 'error' : 'info'}
                      />

                      {activity.bestScore !== null && (
                        <Chip
                          label={`Nota: ${activity.bestScore.toFixed(1)}`}
                          size="small"
                          color={activity.hasApprovedAttempt ? 'success' : 'warning'}
                        />
                      )}

                      {activity.hasApprovedAttempt && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Aprovado"
                          size="small"
                          color="success"
                        />
                      )}

                      {!activity.hasApprovedAttempt && activity.attemptsUsed >= activity.attemptLimit && (
                        <Chip
                          icon={<Cancel />}
                          label="Limite atingido"
                          size="small"
                          color="error"
                        />
                      )}

                      {!activity.hasApprovedAttempt && activity.attemptsUsed < activity.attemptLimit && (
                        <Chip
                          icon={<Pending />}
                          label="Pendente"
                          size="small"
                          color="warning"
                        />
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Button
                      fullWidth
                      variant="outlined"
                      endIcon={<Assignment />}
                      disabled={activity.attemptsUsed >= activity.attemptLimit && !activity.hasApprovedAttempt}
                    >
                      {activity.hasApprovedAttempt ? '✅ Concluída' : 'Responder'}
=======
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
>>>>>>> b9cf9fa16ffec7fd25b3dd99c1514ec7d8b269aa
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
<<<<<<< HEAD

      {filteredGroups.length > 0 && (
        <Box sx={{ py: 6, borderTop: '1px solid #e0e0e0', textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CheckCircleOutlineOutlined fontSize="small" />
            Você visualizou todas as atividades disponíveis.
          </Typography>
        </Box>
      )}
=======
>>>>>>> b9cf9fa16ffec7fd25b3dd99c1514ec7d8b269aa
    </Box>
  );
}

<<<<<<< HEAD
export default function AvaliacoesPage() {
  return <AvaliacoesPageContent />;
}
=======
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
>>>>>>> b9cf9fa16ffec7fd25b3dd99c1514ec7d8b269aa
