"use client";

import { useCallback, useEffect, useState } from "react";

import { Box, Typography, Button, IconButton, Paper } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { Add, Delete, Edit, Visibility } from "@mui/icons-material";

import ModuleModal from "./edit_addModal";
// import ModuleViewModal from "./viewModuleModal";

import {
  listCourses,
  listDisciplines,
} from "@/new-services/poo/shared/api/catalog";

import { changeModuleStatus } from "@/new-services/poo/shared/api/modules";

import { AdminModule } from "@/new-services/poo/module/Roles";

const service = new AdminModule();

export default function GerenciarModulosPage() {
  const [rowsModule, setRowsModule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string>();

  const [openModalEdit, setOpenModalEdit] = useState(false);

  const [openModalView, setOpenModalView] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [modules, disciplines, courses] = await Promise.all([
        service.list(),
        listDisciplines(),
        listCourses(),
      ]);

      const rows = modules.map((module) => {
        const discipline = disciplines.find(
          (d) => d.id === module.disciplineId,
        );

        const course = courses.find((c) => c.id === discipline?.courseId);

        return {
          ...module,
          disciplineName: discipline?.name ?? "-",
          courseName: course?.name ?? "-",
        };
      });

      setRowsModule(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Deseja desativar este módulo?")) return;

    await changeModuleStatus(id, "Inactive");

    await load();
  }

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Módulo",
      flex: 1,
    },
    {
      field: "disciplineName",
      headerName: "Disciplina",
      flex: 1,
    },
    {
      field: "courseName",
      headerName: "Curso",
      flex: 1,
    },
    {
      field: "orderIndex",
      headerName: "Ordem",
      width: 100,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 170,
      sortable: false,

      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={() => {
              setSelectedId(row.id);
              setOpenModalView(true);
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => {
              setSelectedId(row.id);
              setOpenModalEdit(true);
            }}
          >
            <Edit fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(row.id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
          }}
        >
          Gerenciar Módulos
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedId(undefined);
            setOpenModalEdit(true);
          }}
        >
          Novo módulo
        </Button>
      </Box>

      <Paper
        sx={{
          height: 650,
          p: 2,
        }}
      >
        <DataGrid
          loading={loading}
          rows={rowsModule}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          showToolbar
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              csvOptions: {
                fileName: "modulos",
              },
            },
          }}
        />
      </Paper>

      <ModuleModal
        open={openModalEdit}
        moduleId={selectedId}
        onClose={(reload) => {
          setOpenModalEdit(false);

          if (reload) load();
        }}
      />

      {/* <ModuleViewModal
        open={openModalView}
        moduleId={selectedId}
        onClose={() => setOpenModalView(false)}
      /> */}
    </Box>
  );
}
