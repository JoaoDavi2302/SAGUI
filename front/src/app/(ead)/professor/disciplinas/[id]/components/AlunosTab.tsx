"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { listEnrollmentsByDiscipline } from "@/new-services/poo/shared/api/enrollment";
import { ApiError } from "@/new-services/poo/shared/api/client";

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
  const [students, setStudents] = useState<
    Array<{
      id: string;
      name: string;
      email?: string;
      status: string;
    }>
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const page = await listEnrollmentsByDiscipline(disciplinaId, {
          page: 0,
          size: 20,
        });

        if (!cancelled) {
          setStudents(
            (page.content ?? []).map((enrollment) => ({
              id: enrollment.studentId,
              name: enrollment.studentName,
              email: enrollment.studentEmail,
              status: enrollment.status,
            })),
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
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 3, boxShadow: 0, border: "1px solid #e2e8f0" }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell>Aluno</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.length > 0 ? (
            students.map((aluno) => (
              <TableRow key={aluno.id} hover>
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
                <TableCell>{aluno.email ?? "—"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  Nenhum aluno matriculado nesta disciplina.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
