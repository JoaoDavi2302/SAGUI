import React from 'react';
import { Chip as MuiChip, ChipProps as MuiChipProps } from '@mui/material';

// Definindo os tipos de variantes e cores suportados pelo  Badge
type BadgeVariant = 'filled' | 'outlined' | 'soft';
type BadgeColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface BadgeProps extends Omit<MuiChipProps, 'variant' | 'color'> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  dot?: boolean; // Adiciona um pontinho de status antes do texto
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  children,
  variant = 'soft', // Definimos 'soft' como o padrão moderno (fundo claro, texto escuro)
  color = 'primary',
  dot = false,
  className = '',
  ...props
}) => {

  // Cores de fundo e texto para a variante 'soft' (estilizadas via Tailwind v4)
  const softStyles: Record<BadgeColor, string> = {
    primary: 'bg-blue-50 text-blue-700 border-none',
    secondary: 'bg-purple-50 text-purple-700 border-none',
    success: 'bg-emerald-50 text-emerald-700 border-none',
    error: 'bg-rose-50 text-rose-700 border-none',
    warning: 'bg-amber-50 text-amber-800 border-none',
    info: 'bg-sky-50 text-sky-700 border-none',
    neutral: 'bg-gray-100 text-gray-700 border-none',
  };

  // Cores de ponto (dot) indicador de status
  const dotStyles: Record<BadgeColor, string> = {
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    neutral: 'bg-gray-400',
  };

  const isSoft = variant === 'soft';
  const muiVariant = isSoft ? 'filled' : variant;

  return (
    <MuiChip
      label={
        <span className="flex items-center gap-1.5">
          {dot && (
            <span className={`w-2 h-2 rounded-full animate-pulse ${dotStyles[color]}`} />
          )}
          {label || children}
        </span>
      }
      variant={muiVariant}
      // Passa a cor nativa do MUI apenas se não for uma estilização customizada nossa
      color={['primary', 'secondary', 'error', 'warning', 'info', 'success'].includes(color) && !isSoft ? (color as any) : undefined}
      className={`
        font-medium text-xs rounded-full h-6 px-1 transition-all
        ${isSoft ? softStyles[color] : ''}
        ${className}
      `}
      {...props}
    />
  );
};