"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  Paper,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  Person,
  School,
  MenuBook,
  Assessment,
  LockReset,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import { apiFetch } from "@/new-services/poo/shared/api/client";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";

interface Props {
  open: boolean;
  userId?: string;
  onClose: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  birthDate?: string;
  address?: string;
  createdAt: string;
}

interface EnrollmentData {
  id: string;
  disciplineId: string;
  disciplineName: string;
  courseId?: string;
  courseName?: string;
  status: string;
}

interface ProgressData {
  disciplineId: string;
  disciplineName: string;
  overallPercentage: number;
  completedModules: number;
  totalModules: number;
}

interface ActivityAttemptData {
  attemptId: string;
  activityId: string;
  activityTitle: string;
  attemptNumber: number;
  score: number | null;
  approved: boolean | null;
  submittedAt: string;
}

export default function UserViewModal({ open, userId, onClose }: Props) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [attempts, setAttempts] = useState<ActivityAttemptData[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!userId || !open) return;

      setLoading(true);
      setError(null);

      try {
        // Buscar dados do usuário
        const userData = await apiFetch<UserData>(`/users/${userId}`);

        // Buscar matrículas do usuário
        const enrollmentsData = await apiFetch<{ content: EnrollmentData[] }>(
          `/enrollments?studentId=${userId}&size=100`
        );

        // Buscar progresso para cada matrícula
        const progressPromises = (enrollmentsData.content || []).map(
          async (enrollment) => {
            try {
              const progressData = await apiFetch<ProgressData>(
                `/enrollments/${enrollment.id}/progress`
              );
              return {
                disciplineId: enrollment.disciplineId,
                disciplineName: enrollment.disciplineName,
                overallPercentage: progressData.overallPercentage || 0,
                completedModules: progressData.completedModules || 0,
                totalModules: progressData.totalModules || 0,
              };
            } catch {
              return null;
            }
          }
        );

        const progressResults = await Promise.all(progressPromises);
        const validProgress = progressResults.filter(
          (p): p is ProgressData => p !== null
        );

        setUser(userData);
        setEnrollments(enrollmentsData.content || []);
        setProgress(validProgress);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, open]);

  const totalAttempts = attempts.length;
  const averageScore =
    totalAttempts > 0
      ? (attempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalAttempts).toFixed(1)
      : "0";

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !user) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogContent sx={{ py: 4 }}>
          <Alert severity="error">
            {error || "Usuário não encontrado."}
          </Alert>
          <DialogActions>
            <Button variant="contained" onClick={onClose}>
              Fechar
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    );
  }

  const roleLabel = user.role === "Admin" ? "Administrador" : user.role;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg,#1565c0,#42a5f5)",
          color: "white",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar
            sx={{
              width: 70,
              height: 70,
              bgcolor: "rgba(255,255,255,.2)",
            }}
          >
            <Person />
          </Avatar>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {user.name}
            </Typography>
            <Typography>{user.email}</Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={roleLabel}
                sx={{
                  color: "white",
                  background: "rgba(255,255,255,.2)",
                }}
              />
              <Chip
                label={user.status === "Active" ? "Ativo" : "Inativo"}
                sx={{
                  color: "white",
                  background: "rgba(255,255,255,.2)",
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 2,
            mb: 3,
          }}
        >
          <Summary icon={<School />} title="Cursos" value={enrollments.filter(e => e.courseId).length} />
          <Summary icon={<MenuBook />} title="Disciplinas" value={enrollments.length} />
          <Summary icon={<Assessment />} title="Média" value={averageScore} />
          <Summary icon={<Assessment />} title="Módulos" value={progress.reduce((acc, p) => acc + p.completedModules, 0)} />
        </Box>

        <Paper>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Dados" />
            <Tab label="Disciplinas" />
            <Tab label="Desempenho" />
            <Tab label="Segurança" />
          </Tabs>

          <Divider />

          <Box sx={{ p: 3 }}>
            {tab === 0 && (
              <Stack spacing={2}>
                <Typography><strong>Email:</strong> {user.email}</Typography>
                <Typography><strong>Perfil:</strong> {roleLabel}</Typography>
                <Typography><strong>Endereço:</strong> {user.address || "Não informado"}</Typography>
                <Typography><strong>Nascimento:</strong> {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : "Não informado"}</Typography>
                <Typography><strong>Cadastro:</strong> {new Date(user.createdAt).toLocaleDateString()}</Typography>
              </Stack>
            )}

            {tab === 1 && (
              <Stack spacing={2}>
                {enrollments.length === 0 && (
                  <Typography color="text.secondary">Nenhuma disciplina matriculada.</Typography>
                )}
                {enrollments.map((enrollment) => (
                  <Paper key={enrollment.id} sx={{ p: 2 }}>
                    <Typography sx={{ fontWeight: 700 }}>{enrollment.disciplineName}</Typography>
                    {enrollment.courseName && (
                      <Typography variant="body2" color="text.secondary">
                        Curso: {enrollment.courseName}
                      </Typography>
                    )}
                    <Chip
                      label={enrollment.status === "APPROVED" ? "Aprovado" : "Pendente"}
                      color={enrollment.status === "APPROVED" ? "success" : "warning"}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                ))}
              </Stack>
            )}

            {tab === 2 && (
              <Stack spacing={2}>
                <Typography><strong>Progresso por disciplina:</strong></Typography>
                {progress.length === 0 && (
                  <Typography color="text.secondary">Nenhum progresso registrado.</Typography>
                )}
                {progress.map((p) => (
                  <Box key={p.disciplineId}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption">{p.disciplineName}</Typography>
                      <Typography variant="caption">{Math.round(p.overallPercentage)}%</Typography>
                    </Box>
                    <LinearProgress
                      value={p.overallPercentage}
                      variant="determinate"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {p.completedModules} de {p.totalModules} módulos
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}

            {tab === 3 && (
              <Box>
                <Button variant="contained" color="warning" startIcon={<LockReset />}>
                  Resetar senha
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  (Funcionalidade em desenvolvimento)
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Summary({ icon, title, value }: any) {
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        borderRadius: 3,
      }}
    >
      <Avatar>{icon}</Avatar>
      <Box>
        <Typography color="text.secondary">{title}</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
