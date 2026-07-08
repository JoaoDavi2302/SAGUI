import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { PendingActivityDTO } from "@/new-services/poo/shared/api/activities";

function formatScore(score: number | null) {
  if (score === null) return "—";
  return `${Math.round(score)}%`;
}

export function PendenciasTable({ pendencias }: { pendencias: PendingActivityDTO[] }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell>Aluno</TableCell>
            <TableCell>Atividade</TableCell>
            <TableCell>Módulo</TableCell>
            <TableCell align="center">Tentativas</TableCell>
            <TableCell align="center">Melhor nota</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendencias.map((item) => (
            <TableRow
              key={`${item.studentId}-${item.activityId}`}
              hover
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.studentName}
                </Typography>
              </TableCell>
              <TableCell>{item.activityTitle}</TableCell>
              <TableCell>{item.moduleName}</TableCell>
              <TableCell align="center">
                <Chip
                  label={`${item.attemptsUsed}/${item.attemptLimit}`}
                  size="small"
                  color={item.attemptsUsed >= item.attemptLimit ? "warning" : "default"}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="center">{formatScore(item.bestScore)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
