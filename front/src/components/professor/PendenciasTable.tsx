import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  Button 
} from "@mui/material";

export function PendenciasTable({ atividades }: { atividades: any[] }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell>Atividade</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Ação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {atividades.map((ativ: any) => (
            <TableRow key={ativ.id} hover>
              <TableCell>{ativ.titulo}</TableCell>
              <TableCell>
                <Chip label="Aguardando" color="warning" size="small" variant="outlined" />
              </TableCell>
              <TableCell align="center">
                <Button variant="contained" size="small">Corrigir</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}