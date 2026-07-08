'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Box,
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

interface GroupedActivity {
  disciplineName: string;
  moduleId: string;
  moduleName: string;
  activities: ActivityWithDetails[];
}

function AvaliacoesPageContent() {
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
      if (loadingRef.current) return;
      loadingRef.current = true;

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
                    moduleName: mod.moduleName,
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

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 2 }}
                    >
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
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {filteredGroups.length > 0 && (
        <Box sx={{ py: 6, borderTop: '1px solid #e0e0e0', textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CheckCircleOutlineOutlined fontSize="small" />
            Você visualizou todas as atividades disponíveis.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default function AvaliacoesPage() {
  return <AvaliacoesPageContent />;
}
