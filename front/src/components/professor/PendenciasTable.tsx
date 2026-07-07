import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import type { ActivityDTO } from "@/new-services/poo/shared/api/activities";

export function PendenciasTable({ atividades }: { atividades: ActivityDTO[] }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell>Atividade</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {atividades.map((ativ) => (
            <TableRow key={ativ.id} hover>
              <TableCell>{ativ.title}</TableCell>
              <TableCell>
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
