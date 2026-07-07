"use client";

import { useMemo, useState } from "react";

import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
} from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { Edit, Delete, Visibility, Add } from "@mui/icons-material";

import { useUser } from "@/services/auth/AuthContext";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import UserViewModal from "./viewUsers_Modal";

const database = DatabaseProvider.getDatabase();

export default function GerenciarUsuariosPage() {
  const { user } = useUser();

  const [selectedId, setSelectedId] = useState<number>();

  const [openModalEdit, setOpenModalEdit] = useState(false);

  const [openModalView, setOpenModalView] = useState(false);

  const rows = useMemo(() => {
    return database.usuarios.map((usuario) => ({
      ...usuario,

      perfilLabel:
        usuario.perfil === "Admin"
          ? "Administrador"
          : usuario.perfil === "Professor"
            ? "Professor"
            : "Aluno",

      status: usuario.ativo ? "Ativo" : "Inativo",

      dataCadastro: new Date(usuario.criado_em).toLocaleDateString("pt-BR"),
    }));
  }, []);

  const columns: GridColDef[] = [
    {
      field: "nome",
      headerName: "Nome",
      flex: 1,
    },

    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
    },

    {
      field: "perfilLabel",
      headerName: "Perfil",
      width: 160,

      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.row.perfil === "Admin"
              ? "error"
              : params.row.perfil === "Professor"
                ? "primary"
                : "success"
          }
        />
      ),
    },

    {
      field: "cidade",
      headerName: "Cidade",
      flex: 1,
    },

    {
      field: "status",
      headerName: "Status",
      width: 120,

      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "Ativo" ? "success" : "default"}
        />
      ),
    },

    {
      field: "dataCadastro",
      headerName: "Cadastro",
      width: 130,
    },

    {
      field: "actions",
      headerName: "Ações",
      width: 160,
      sortable: false,

      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={() => {
              setSelectedId(params.row.id);
              setOpenModalView(true);
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>

          <IconButton
            onClick={() => {
              setSelectedId(params.row.id);
              setOpenModalEdit(true);
            }}
          >
            <Edit />
          </IconButton>

          <IconButton size="small" color="error">
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
            }}
          >
            Gerenciar Usuários
          </Typography>

          <Typography color="text.secondary">
            Controle dos usuários cadastrados no sistema.
          </Typography>
        </Box>

        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            setSelectedId(undefined);
            setOpenModalEdit(true);
          }}
        >
          Novo usuário
        </Button>
      </Box>

      {/* TABLE */}

      <Paper
        sx={{
          height: 650,
          p: 2,
          borderRadius: 2,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          sx={{
            border: "none",

            "& .MuiDataGrid-columnHeaders": {
              fontWeight: "bold",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
          }}
          showToolbar
          slotProps={{
            toolbar: {
              showQuickFilter: true,

              csvOptions: {
                fileName: "usuarios",
              },
            },
          }}
        />
      </Paper>
      <UserViewModal
        open={openModalView}
        userId={selectedId}
        onClose={() => {
          setOpenModalView(false);
        }}
      />
    </Box>
  );
}
