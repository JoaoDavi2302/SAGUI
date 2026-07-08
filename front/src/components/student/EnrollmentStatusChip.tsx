import { Chip, ChipProps } from '@mui/material';

export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface EnrollmentStatusChipProps {
  status: EnrollmentStatus;
}

const statusConfig: Record<
  EnrollmentStatus,
  { label: string; color: ChipProps['color'] }
> = {
  PENDING: { label: 'Pendente', color: 'warning' },
  APPROVED: { label: 'Aprovado', color: 'success' },
  REJECTED: { label: 'Rejeitado', color: 'error' },
};

export function EnrollmentStatusChip({ status }: EnrollmentStatusChipProps) {
  const config = statusConfig[status];
  return <Chip label={config.label} color={config.color} size="small" />;
}
