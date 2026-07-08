import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
} from '@mui/material';
import type { ActivityAttemptSummaryResponse } from '@/new-services/poo/shared/api/activities';

interface AttemptHistoryListProps {
  attempts: ActivityAttemptSummaryResponse[];
  minimumScore: number;
}

export function AttemptHistoryList({
  attempts,
  minimumScore,
}: AttemptHistoryListProps) {
  if (attempts.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        Nenhuma tentativa realizada ainda.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Histórico de tentativas
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tentativa</TableCell>
              <TableCell align="right">Nota</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attempts.map((attempt) => (
              <TableRow key={attempt.attemptId}>
                <TableCell>{attempt.attemptNumber}ª</TableCell>
                <TableCell align="right">
                  {attempt.score !== undefined && attempt.score !== null
                    ? attempt.score.toFixed(1)
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  {attempt.approved ? (
                    <Chip label="Aprovado" color="success" size="small" />
                  ) : attempt.score !== undefined && attempt.score !== null ? (
                    <Chip
                      label={`Reprovado (mín: ${minimumScore})`}
                      color="error"
                      size="small"
                    />
                  ) : (
                    <Chip label="Pendente" color="warning" size="small" />
                  )}
                </TableCell>
                <TableCell align="right">
                  {attempt.submittedAt
                    ? new Date(attempt.submittedAt).toLocaleDateString('pt-BR')
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
