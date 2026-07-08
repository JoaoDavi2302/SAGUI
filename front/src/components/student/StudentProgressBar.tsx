import { Box, LinearProgress, Typography } from '@mui/material';

interface StudentProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
}

export function StudentProgressBar({
  value,
  label,
  showPercentage = true,
}: StudentProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <Box>
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption">{label}</Typography>
          {showPercentage && (
            <Typography variant="caption" color="text.secondary">
              {Math.round(clampedValue)}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={clampedValue}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
}
