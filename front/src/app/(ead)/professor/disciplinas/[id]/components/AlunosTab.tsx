"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { listEnrollmentsByDiscipline } from "@/new-services/poo/shared/api/enrollment";
import { listDisciplineStudentsProgress } from "@/new-services/poo/shared/api/progress";
import { ApiError } from "@/new-services/poo/shared/api/client";
import { StudentProgressDialog } from "@/components/professor/StudentProgressDialog";

interface StudentRow {
  enrollmentId: string;
  studentId: string;
  name: string;
  email?: string;
  status: string;
  overallPercentage: number;
  completedModules: number;
  totalModules: number;
}

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Aprovada",
  PENDING: "Pendente",
  REJECTED: "Rejeitada",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "default"> =
  {
    APPROVED: "success",
    PENDING: "warning",
    REJECTED: "error",
    CANCELLED: "default",
  };

export function AlunosTab({ disciplinaId }: { disciplinaId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [enrollmentsPage, progressPage] = await Promise.all([
          listEnrollmentsByDiscipline(disciplinaId, { page: 0, size: 50 }),
          listDisciplineStudentsProgress(disciplinaId, 0, 50),
        ]);

        const progressByStudent = new Map(
          (progressPage.content ?? []).map((item) => [item.studentId, item]),
        );

        if (!cancelled) {
          setStudents(
            (enrollmentsPage.content ?? []).map((enrollment) => {
              const progress = progressByStudent.get(enrollment.studentId);

              return {
                enrollmentId: enrollment.id,
                studentId: enrollment.studentId,
                name: enrollment.studentName,
                email: enrollment.studentEmail,
                status: enrollment.status,
                overallPercentage: progress?.overallPercentage ?? 0,
                completedModules: progress?.completedModules ?? 0,
                totalModules: progress?.totalModules ?? 0,
              };
            }),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setStudents([]);
          if (err instanceof ApiError && err.status === 404) {
            setError(null);
          } else {
            setError(
              err instanceof ApiError
                ? err.message
                : "Não foi possível carregar os alunos.",
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [disciplinaId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: 0, border: "1px solid #e2e8f0" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell>Aluno</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progresso</TableCell>
              <TableCell>Módulos</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Detalhe</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length > 0 ? (
              students.map((aluno) => (
                <TableRow key={aluno.studentId} hover>
                  <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#1976d2",
                        width: 32,
                        height: 32,
                        fontSize: "0.8rem",
                      }}
                    >
                      {aluno.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {aluno.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[aluno.status] ?? aluno.status}
                      color={STATUS_COLORS[aluno.status] ?? "default"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 140 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={aluno.overallPercentage}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 32 }}>
                        {aluno.overallPercentage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {aluno.completedModules}/{aluno.totalModules}
                  </TableCell>
                  <TableCell>{aluno.email ?? "—"}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => setSelectedStudent(aluno)}
                      aria-label={`Ver progresso de ${aluno.name}`}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    Nenhum aluno matriculado nesta disciplina.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <StudentProgressDialog
        open={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        enrollmentId={selectedStudent?.enrollmentId ?? null}
        studentName={selectedStudent?.name ?? ""}
      />
    </>
  );
}
