import React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';

// Herdamos as propriedades oficiais do TextField do Material UI (MUI)
interface InputProps extends Omit<MuiTextFieldProps, 'variant'> {
  errorText?: string; // Facilita passar mensagens de erro textuais
  icon?: React.ReactNode; // Ícone no início do campo (ex: lupa de busca)
  endIcon?: React.ReactNode; // Ícone no fim do campo (ex: olho para mostrar senha)
}

export const Input = React.forwardRef<HTMLDivElement, InputProps>(({
  label,
  errorText,
  helperText,
  error,
  icon,
  endIcon,
  className = '',
  fullWidth = true, // Ocupa toda a largura do container por padrão
  ...props
}, ref) => {
  
  // Define o estado de erro caso seja passado o booleano 'error' ou um texto em 'errorText'
  const hasError = Boolean(error || errorText);

return (
    <MuiTextField
      ref={ref}
      label={label}
      fullWidth={fullWidth}
      variant="outlined"
      error={hasError}
      helperText={errorText || helperText}
      className={className}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          backgroundColor: '#ffffff',
        },
        '& .MuiFormHelperText-root': {
          fontSize: '0.75rem',
          marginTop: '4px',
        },
      }}
      // NOVA SINTAXE DO MUI: Substitua o InputProps por isso aqui
      slotProps={{
        input: {
          startAdornment: icon ? (
            <span className="text-gray-400 mr-2 flex items-center">{icon}</span>
          ) : undefined,
          endAdornment: endIcon ? (
            <span className="text-gray-400 ml-2 flex items-center">{endIcon}</span>
          ) : undefined,
        },
      }}
      {...props}
    />
  );
});

Input.displayName = 'Input';