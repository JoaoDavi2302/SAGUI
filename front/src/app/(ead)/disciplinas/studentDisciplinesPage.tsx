'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Tab,
  Tabs,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { SchoolOutlined, Pending } from '@mui/icons-material';
import { useMyEnrollments } from '@/hooks/useMyEnrollments';
import { listDisciplines } from '@/new-services/poo/shared/api/disciplines';
import { getDisciplineProgress } from '@/new-services/poo/shared/api/progress';
import { StudentProgressBar } from '@/components/student/StudentProgressBar';
import { EnrollmentStatusChip } from '@/components/student/EnrollmentStatusChip';
import { slugify } from '@/components/layout/headerConfig';
import { getApiErrorMessage } from '@/utils/apiErrorMessage';

interface DisciplineWithProgress {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  overallPercentage: number;
  modulesCount: number;
  enrollmentStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  enrollmentId?: string;
}

export default function StudentDisciplinesPage() {
  const {
    enrollments,
    approvedEnrollments,
    pendingEnrollments,
    loading: loadingEnrollments,
    requestEnrollment,
    refresh,
  } = useMyEnrollments();

  const [tab, setTab] = useState(0);
  const [myDisciplines, setMyDisciplines] = useState<DisciplineWithProgress[]>([]);
  const [availableDisciplines, setAvailableDisciplines] = useState<DisciplineWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const allDisciplinesResponse = await listDisciplines(undefined, 0, 100);
      const allDisciplines = allDisciplinesResponse.content;

      const enrolledIds = new Set(enrollments.map((e) => e.disciplineId));

      const enrolledDisciplines = await Promise.all(
        approvedEnrollments.map(async (enrollment) => {
          try {
            const progress = await getDisciplineProgress(enrollment.disciplineId);
            const discipline = allDisciplines.find((d) => d.id === enrollment.disciplineId);
            return {
              id: enrollment.disciplineId,
              name: discipline?.name || enrollment.disciplineName,
              description: discipline?.description || '',
              status: discipline?.status || 'Active',
              overallPercentage: progress.overallPercentage || 0,
              modulesCount: progress.totalModules || 0,
              enrollmentStatus: enrollment.status as any,
              enrollmentId: enrollment.id,
            };
          } catch {
            return null;
          }
        })
      );

      const pendingDisciplines = await Promise.all(
        pendingEnrollments.map(async (enrollment) => {
          const discipline = allDisciplines.find((d) => d.id === enrollment.disciplineId);
          return {
            id: enrollment.disciplineId,
            name: discipline?.name || enrollment.disciplineName,
            description: discipline?.description || '',
            status: discipline?.status || 'Active',
            overallPercentage: 0,
            modulesCount: 0,
            enrollmentStatus: enrollment.status as any,
            enrollmentId: enrollment.id,
          };
        })
      );

      const available = allDisciplines
        .filter((d) => !enrolledIds.has(d.id) && d.status === 'Active')
        .map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          status: d.status,
          overallPercentage: 0,
          modulesCount: 0,
        }));

      const validEnrolled = enrolledDisciplines.filter((d) => d !== null) as DisciplineWithProgress[];

      setMyDisciplines([...validEnrolled, ...pendingDisciplines]);
      setAvailableDisciplines(available);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [enrollments]);

  const handleEnroll = async (disciplineId: string) => {
    try {
      await requestEnrollment(disciplineId);
      setSnackbar({
        open: true,
        message: 'Solicitação de matrícula enviada com sucesso! Aguarde a aprovação do administrador.',
        severity: 'success',
      });
      await loadData();
      await refresh();
    } catch (err) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(err),
        severity: 'error',
      });
    }
  };

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

  const enrolledCount = myDisciplines.filter((d) => d.enrollmentStatus === 'APPROVED').length;
  const pendingCount = myDisciplines.filter((d) => d.enrollmentStatus === 'PENDING').length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Minhas Disciplinas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gerencie suas disciplinas e descubra novas opções.
      </Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label={`Matriculado (${enrolledCount})`} />
        <Tab label={`Pendentes (${pendingCount})`} />
        <Tab label={`Disponíveis (${availableDisciplines.length})`} />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          {myDisciplines
            .filter((d) => d.enrollmentStatus === 'APPROVED')
            .map((discipline) => (
              <Grid key={discipline.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <SchoolOutlined color="primary" />
                      <Chip label={`${discipline.modulesCount} módulos`} size="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {discipline.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {discipline.description || 'Sem descrição'}
                    </Typography>
                    <StudentProgressBar
                      value={discipline.overallPercentage}
                      label={`${Math.round(discipline.overallPercentage)}% concluído`}
                    />
                    <Button
                      component={Link}
                      href={`/disciplinas/${slugify(discipline.name)}?id=${discipline.id}`}
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Continuar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          {myDisciplines.filter((d) => d.enrollmentStatus === 'APPROVED').length === 0 && (
            <Grid size={12}>
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                Você ainda não está matriculado em nenhuma disciplina aprovada.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          {myDisciplines
            .filter((d) => d.enrollmentStatus === 'PENDING')
            .map((discipline) => (
              <Grid key={discipline.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card sx={{ height: '100%', borderRadius: 3, borderColor: 'warning.main', borderWidth: 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Pending color="warning" />
                      <EnrollmentStatusChip status="PENDING" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {discipline.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {discipline.description || 'Sem descrição'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      Aguardando aprovação do administrador.
                    </Typography>
                    <Button variant="outlined" fullWidth disabled sx={{ mt: 2 }}>
                      Pendente
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          {myDisciplines.filter((d) => d.enrollmentStatus === 'PENDING').length === 0 && (
            <Grid size={12}>
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                Nenhuma solicitação de matrícula pendente.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={3}>
          {availableDisciplines.map((discipline) => (
            <Grid key={discipline.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <SchoolOutlined color="primary" />
                    <Chip label="Disponível" color="info" size="small" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {discipline.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {discipline.description || 'Sem descrição'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => handleEnroll(discipline.id)}
                  >
                    Matricular-se
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {availableDisciplines.length === 0 && (
            <Grid size={12}>
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                Não há novas disciplinas disponíveis para matrícula.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}