import React from 'react';
import { 
  Card as MuiCard, 
  CardProps as MuiCardProps, 
  CardContent as MuiCardContent, 
  CardActions as MuiCardActions, 
  CardHeader as MuiCardHeader 
} from '@mui/material';

// 1. Componente Principal (Container)
interface CardProps extends MuiCardProps {
  variant?: 'elevation' | 'outlined';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'outlined',
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <MuiCard
      variant={variant}
      className={`bg-white rounded-xl border border-gray-100 transition-all duration-200 ${className}`}
      sx={{
        boxShadow: hoverable ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '&:hover': {
          transform: hoverable ? 'translateY(-2px)' : 'none',
        },
        cursor: hoverable ? 'pointer' : 'default',
      }}
      {...props}
    >
      {children}
    </MuiCard>
  );
};

// 2. Subcomponente: Cabeçalho do Card (CORRIGIDO AQUI)
export const CardHeader: React.FC<React.ComponentProps<typeof MuiCardHeader>> = ({ className = '', ...props }) => {
  return (
    <MuiCardHeader
      className={`p-5 pb-3 border-b border-gray-50 ${className}`}
      // Tiramos os seletores esquisitos do className e tratamos com o 'sx' nativo
      sx={{
        '& .MuiCardHeader-title': {
          fontSize: '1.125rem', // text-lg
          fontWeight: 700,      // font-bold
          color: '#1f2937',     // text-gray-800
        },
      }}
      {...props}
    />
  );
};

// 3. Subcomponente: Corpo do Conteúdo
export const CardContent: React.FC<React.ComponentProps<typeof MuiCardContent>> = ({ className = '', ...props }) => {
  return (
    <MuiCardContent
      className={`p-5 text-gray-600 text-sm leading-relaxed last:pb-5 ${className}`}
      {...props}
    />
  );
};

// 4. Subcomponente: Rodapé / Área de Ações
export const CardActions: React.FC<React.ComponentProps<typeof MuiCardActions>> = ({ className = '', ...props }) => {
  return (
    <MuiCardActions
      className={`p-4 pt-2 border-t border-gray-50 flex justify-end gap-2 ${className}`}
      {...props}
    />
  );
};