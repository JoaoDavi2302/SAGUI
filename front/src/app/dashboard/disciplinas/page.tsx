"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Box, Typography, Button, IconButton, Paper } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { Add, Delete, Edit, Visibility } from "@mui/icons-material";

import { useUser } from "@/services/auth/AuthContext";

import DisciplineModal from "./edit_addModal";
import DisciplineViewModal from "./vierDiscipline_Modal";

import {
  listCourses,
  listModules,
  listProfessors,
  changeDisciplineStatus,
  DisciplineDTO,
  CourseDTO,
  ModuleDTO,
  UserProfileDTO,
} from "@/new-services/poo/shared/api/catalog";

import { AdminDiscipline } from "@/new-services/poo/discipline/Roles";

const service = new AdminDiscipline();

export default function GerenciarDisciplinasPage() {
  const [rowsDiscipline, setRowsDiscipline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string>();

  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalView, setOpenModalView] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [disciplines, courses, professors] = await Promise.all([
        service.list(),
        listCourses(),
        listProfessors(),
      ]);

      const rows = await Promise.all(
        disciplines.map(async (discipline) => {
          const modules = await listModules(discipline.id);

          return {
            ...discipline,

            courseName:
              courses.find((c) => c.id === discipline.courseId)?.name ?? "-",

            professorName:
              professors.find((p) => p.id === discipline.responsibleProfessorId)
                ?.name ?? "-",

            modulesCount: modules.length,
          };
        }),
      );

      setRowsDiscipline(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja desativar esta disciplina?")) {
      return;
    }

    await changeDisciplineStatus(id, "Inactive");
    await load();
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Disciplina",
      flex: 1,
    },
    {
      field: "professorName",
      headerName: "Professor",
      flex: 1,
    },
    {
      field: "modulesCount",
      headerName: "Módulos",
      width: 120,
    },
    {
      field: "courseName",
      headerName: "Curso",
      flex: 1,
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
        <Box sx={{ display: "flex", gap: 1 }}>
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Gerenciar Disciplinas
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedId(undefined);
            setOpenModalEdit(true);
          }}
        >
          Nova disciplina
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
          rows={rowsDiscipline}
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
                fileName: "disciplinas",
              },
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
            load();
          }
        }}
      />

      <DisciplineViewModal
        open={openModalView}
        disciplineId={selectedId}
        onClose={() => setOpenModalView(false)}
      />
    </Box>
  );
}
