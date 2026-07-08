"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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
import {
  getActivityAttemptDetail,
  listActivityAttempts,
  type ActivityAttemptDetailDTO,
  type ActivityAttemptSummaryDTO,
} from "@/new-services/poo/shared/api/activities";
import { ApiError } from "@/new-services/poo/shared/api/client";

interface ActivityAttemptsDialogProps {
  open: boolean;
  onClose: () => void;
  activityId: string | null;
  activityTitle: string;
}

function formatScore(score: number) {
  return `${Math.round(score)}%`;
}

function AttemptDetailView({ detail }: { detail: ActivityAttemptDetailDTO }) {
  return (
    <Box sx={{ pt: 1 }}>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip
          label={detail.approved ? "Aprovado" : "Reprovado"}
          color={detail.approved ? "success" : "error"}
          size="small"
        />
        <Chip label={`Nota: ${formatScore(detail.score)}`} size="small" variant="outlined" />
        <Chip
          label={`Mínimo: ${formatScore(detail.minimumScore)}`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`Tentativa ${detail.attemptNumber}`}
          size="small"
          variant="outlined"
        />
      </Box>

      {detail.answers.map((answer, index) => (
        <Paper
          key={answer.questionId}
          variant="outlined"
          sx={{ p: 2, mb: 2, borderRadius: 2 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {index + 1}. {answer.statement}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Resposta do aluno:
          </Typography>
          {answer.selectedAlternatives.map((alt) => (
            <Typography key={alt.id} variant="body2" sx={{ ml: 1 }}>
              • {alt.text}
            </Typography>
          ))}
          {!answer.correct && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 0.5, display: "block" }}>
                Gabarito:
              </Typography>
              {answer.correctAlternatives.map((alt) => (
                <Typography key={alt.id} variant="body2" sx={{ ml: 1, color: "success.main" }}>
                  • {alt.text}
                </Typography>
              ))}
            </>
          )}
          <Chip
            label={answer.correct ? "Correta" : "Incorreta"}
            color={answer.correct ? "success" : "error"}
            size="small"
            sx={{ mt: 1 }}
          />
        </Paper>
      ))}
    </Box>
  );
}

export function ActivityAttemptsDialog({
  open,
  onClose,
  activityId,
  activityTitle,
}: ActivityAttemptsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<ActivityAttemptSummaryDTO[]>([]);
  const [detail, setDetail] = useState<ActivityAttemptDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!open || !activityId) return;

    let cancelled = false;

    async function load() {
      if (!activityId) return;

      setLoading(true);
      setError(null);
      setDetail(null);

      try {
        const page = await listActivityAttempts(activityId, { size: 50 });
        if (!cancelled) setAttempts(page.content ?? []);
      } catch (err) {
        if (!cancelled) {
          setAttempts([]);
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar as tentativas.",
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
  }, [open, activityId]);

  async function handleViewDetail(attemptId: string) {
    if (!activityId) return;

    setDetailLoading(true);
    try {
      const data = await getActivityAttemptDetail(activityId, attemptId);
      setDetail(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar o detalhe da tentativa.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Tentativas — {activityTitle}</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!loading && !detail && attempts.length === 0 && !error && (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            Nenhuma tentativa registrada para esta atividade.
          </Typography>
        )}

        {!detail && attempts.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell align="center">Tentativa</TableCell>
                  <TableCell align="center">Nota</TableCell>
                  <TableCell align="center">Resultado</TableCell>
                  <TableCell align="center">Detalhe</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.attemptId} hover>
                    <TableCell>{attempt.studentName}</TableCell>
                    <TableCell align="center">{attempt.attemptNumber}</TableCell>
                    <TableCell align="center">{formatScore(attempt.score)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={attempt.approved ? "Aprovado" : "Reprovado"}
                        color={attempt.approved ? "success" : "error"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => void handleViewDetail(attempt.attemptId)}
                        disabled={detailLoading}
                        aria-label="Ver detalhe"
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {detailLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {detail && !detailLoading && (
          <Box>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer", mb: 2 }}
              onClick={() => setDetail(null)}
            >
              ← Voltar para lista
            </Typography>
            <AttemptDetailView detail={detail} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
