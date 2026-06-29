import React from 'react';
import { 
  Dialog as MuiDialog, 
  DialogProps as MuiDialogProps, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps extends Omit<MuiDialogProps, 'open'> {
  isOpen: boolean; // Controla se o modal está visível
  onClose: () => void; // Função disparada ao fechar o modal
  title?: string;
  actions?: React.ReactNode; // Botões de ação no rodapé (ex: Cancelar, Confirmar)
}

export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  title,
  actions,
  maxWidth = 'sm', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <MuiDialog
      open={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      className={className}
      // Estilização segura para o container do diálogo
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '12px',
          padding: '8px',
          backgroundColor: '#ffffff',
        },
      }}
      {...props}
    >
      {/* Cabeçalho do Modal com botão de fechar (X) integrado */}
      {title && (
        <DialogTitle 
          sx={{ 
            m: 0, 
            p: 2, 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: '#183153',
            display: 'flex',
            justifyContent: 'between',
            alignItems: 'center'
          }}
        >
          <span className="flex-1">{title}</span>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: '#9ca3af',
              '&:hover': { color: '#4b5563' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}

      {/* Corpo com o conteúdo recebido por parâmetro */}
      <DialogContent dividers sx={{ p: 3, borderTop: '1px solid #f3f4f6', borderBottom: actions ? '1px solid #f3f4f6' : 'none' }}>
        {children}
      </DialogContent>

      {/* Rodapé reservado para botões, renderizado apenas se houver ações */}
      {actions && (
        <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'end' }}>
          {actions}
        </DialogActions>
      )}
    </MuiDialog>
  );
};