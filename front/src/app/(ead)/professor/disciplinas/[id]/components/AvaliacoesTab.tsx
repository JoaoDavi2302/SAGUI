"use client";

import { useEffect, useState } from "react";
import {
  Alert,
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
import { listModules } from "@/new-services/poo/shared/api/catalog";
import { listActivities, type ActivityDTO } from "@/new-services/poo/shared/api/activities";
import { ApiError } from "@/new-services/poo/shared/api/client";

interface ActivityRow extends ActivityDTO {
  moduleName: string;
}

export function AvaliacoesTab({ disciplinaId }: { disciplinaId: string }) {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const modules = await listModules(disciplinaId);
        const rows = await Promise.all(
          modules.map(async (module) => {
            const moduleActivities = await listActivities(module.id);
            return moduleActivities.map((activity) => ({
              ...activity,
              moduleName: module.name,
            }));
          }),
        );

        if (!cancelled) {
          setActivities(rows.flat());
        }
      } catch (err) {
        if (!cancelled) {
          setActivities([]);
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar as avaliações.",
          );
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

  if (activities.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
        Nenhuma atividade cadastrada nesta disciplina.
      </Typography>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 3, boxShadow: 0, border: "1px solid #e2e8f0" }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell>Atividade</TableCell>
            <TableCell>Módulo</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((ativ) => (
            <TableRow key={ativ.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {ativ.title}
                </Typography>
              </TableCell>
              <TableCell>{ativ.moduleName}</TableCell>
              <TableCell align="center">
                <Chip
                  label={ativ.status === "Active" ? "Ativa" : "Inativa"}
                  color={ativ.status === "Active" ? "success" : "default"}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
