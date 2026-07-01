import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

// Estendemos as propriedades do botão do Material UI para manter o padrão do ecossistema
interface ButtonProps extends MuiButtonProps {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained', // 'contained' é o padrão preenchido do MUI (equivalente ao primary)
  color = 'primary',
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      disabled={disabled || isLoading}
      // Se precisar de ajustes finos usando Tailwind v4, use a propriedade className:
      className={`font-semibold capitalize rounded-md transition-shadow ${props.className || ''}`}
      // O startIcon adiciona o loading perfeitamente alinhado se estiver carregando
      startIcon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" thickness={5} />
        ) : (
          props.startIcon
        )
      }
      {...props}
    >
      {isLoading ? 'Carregando...' : children}
    </MuiButton>
  );
};