import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { CheckCircle, Cancel, Replay } from '@mui/icons-material';

interface ActivityResultDialogProps {
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  canRetry?: boolean;
  result: {
    score: number;
    approved: boolean;
    message: string;
    minimumScore: number;
    attemptNumber: number;
    attemptsRemaining?: number;
  };
}

export function ActivityResultDialog({
  open,
  onClose,
  onRetry,
  canRetry = false,
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

          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
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
            {result.attemptsRemaining !== undefined && (
              <Chip
                label={`${result.attemptsRemaining} tentativa(s) restante(s)`}
                variant="outlined"
                size="small"
              />
            )}
          </Stack>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            {result.message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {canRetry && onRetry && (
          <Button
            onClick={() => {
              onRetry();
              onClose();
            }}
            variant="outlined"
            startIcon={<Replay />}
          >
            Tentar novamente
          </Button>
        )}
        <Button onClick={onClose} variant="contained">
          {result.approved ? 'Continuar' : 'Fechar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
