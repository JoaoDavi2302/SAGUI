import React from 'react';
import {
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableContainer as MuiTableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  Paper
} from '@mui/material';

// 1. Container da Tabela (Garante o scroll horizontal se a tela for pequena)
export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <MuiTableContainer 
      component={Paper} 
      variant="outlined" 
      className={`rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </MuiTableContainer>
  );
};

// 2. Componente Principal da Tabela
export const Table: React.FC<React.ComponentProps<typeof MuiTable>> = ({ children, className = '', ...props }) => {
  return (
    <MuiTable className={className} {...props}>
      {children}
    </MuiTable>
  );
};

// 3. Cabeçalho da Tabela
export const TableHead: React.FC<React.ComponentProps<typeof MuiTableHead>> = ({ children, ...props }) => {
  return <MuiTableHead {...props}>{children}</MuiTableHead>;
};

// 4. Corpo da Tabela
export const TableBody: React.FC<React.ComponentProps<typeof MuiTableBody>> = ({ children, ...props }) => {
  return <MuiTableBody {...props}>{children}</MuiTableBody>;
};

// 5. Linha da Tabela (Com efeito hover suave opcional)
interface TableRowProps extends React.ComponentProps<typeof MuiTableRow> {
  hoverable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ children, hoverable = true, className = '', ...props }) => {
  return (
    <MuiTableRow 
      className={`transition-colors duration-150 ${className}`}
      sx={{
        '&:hover': {
          backgroundColor: hoverable ? '#f8fafc !important' : 'transparent', // bg-slate-50 sutil
        },
        '&:last-child td, &:last-child th': { border: 0 } // Remove a borda da última linha
      }}
      {...props}
    >
      {children}
    </MuiTableRow>
  );
};

// 6. Célula da Tabela (Cabeçalho ou Dado comum)
interface TableCellProps extends React.ComponentProps<typeof MuiTableCell> {
  isHeader?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({ children, isHeader = false, className = '', ...props }) => {
  return (
    <MuiTableCell
      className={className}
      sx={{
        padding: '14px 16px',
        fontSize: isHeader ? '0.85rem' : '0.875rem',
        fontWeight: isHeader ? 700 : 400,
        color: isHeader ? '#4b5563' : '#1f2937', // text-gray-600 para header, text-gray-900 para dados
        backgroundColor: isHeader ? '#fdfdfd' : 'transparent',
        borderColor: '#f3f4f6', // border-gray-100 sutil
      }}
      {...props}
    >
      {children}
    </MuiTableCell>
  );
};