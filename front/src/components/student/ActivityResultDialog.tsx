import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface ActivityResultDialogProps {
  open: boolean;
  onClose: () => void;
  result: {
    score: number;
    approved: boolean;
    message: string;
    minimumScore: number;
    attemptNumber: number;
  };
}

export function ActivityResultDialog({
  open,
  onClose,
  result,
}: ActivityResultDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {result.approved ? (
            <CheckCircle color="success" />
          ) : (
            <Cancel color="error" />
          )}
          {result.approved ? 'Aprovado!' : 'Reprovado'}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 700 }}>
            {result.score.toFixed(1)}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            pontos (nota mínima: {result.minimumScore})
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            <Chip
              label={`Tentativa ${result.attemptNumber}`}
              color="info"
              size="small"
            />
            <Chip
              label={result.approved ? 'Aprovado' : 'Reprovado'}
              color={result.approved ? 'success' : 'error'}
              size="small"
            />
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            {result.message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
