"use client";

import { useMemo, useState } from "react";

import { Box, Typography, Button, IconButton, Paper } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { Edit, Delete, Visibility, Add } from "@mui/icons-material";

import { useUser } from "@/services/auth/AuthContext";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";
import DisciplineModal from "./edit_addModal";
import DisciplineViewModal from "./vierDiscipline_Modal";

const database = DatabaseProvider.getDatabase();

export default function GerenciarDisciplinasPage() {
  const { user, effectiveRole } = useUser();

  const provider = useMemo(() => {
    if (!user) return null;
    return DisciplineProvider.create("ADMINISTRADOR", database, user);
  }, [user]);

  const data = useMemo(() => {
    if (!provider) return { grouped: [] };
    return provider.getPageData();
  }, [provider]);

  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalView, setOpenModalView] = useState(false);
  const [selectedId, setSelectedId] = useState<number>();

  const rows = useMemo(() => {
    return data.grouped.flatMap((g) =>
      g.subjects.map((s) => ({
        ...s,
        course: g.course ?? null,
      })),
    );
  }, [data.grouped]);

  const columns: GridColDef[] = [
    { field: "nome", headerName: "Disciplina", flex: 1 },
    {
      field: "workload",
      headerName: "Carga horária",
      width: 140,
      valueGetter: (_, row) => `${row.workload}h`,
    },
    {
      field: "modules",
      headerName: "Módulos",
      width: 120,
      valueGetter: (_, row) => row.modules?.length ?? 0,
    },
    {
      field: "course",
      headerName: "Curso",
      flex: 1,
      valueGetter: (_, row) => row.course?.name ?? "-",
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
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
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Gerenciar Disciplinas
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
          Nova disciplina
        </Button>
      </Box>

      {/* TABLE */}
      <Paper sx={{ height: 650, p: 2, borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              fontWeight: "bold",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
          }}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          showToolbar
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              printOptions: { disableToolbarButton: false },
              csvOptions: { fileName: "disciplinas" },
            },
          }}
        />
      </Paper>
      <DisciplineModal
        open={openModalEdit}
        disciplineId={selectedId}
        onClose={(reload) => {
          setOpenModalEdit(false);

          if (reload) {
            // atualizar listagem
          }
        }}
      />

      <DisciplineViewModal
        open={openModalView}
        disciplineId={selectedId}
        onClose={() => {
          setOpenModalView(false);
        }}
      />
    </Box>
  );
}
