"use client";

import { useCallback, useEffect, useState } from "react";

import { Box, Typography, Button, IconButton, Paper } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { Add, Delete, Edit, Visibility } from "@mui/icons-material";

import LessonModal from "./edit_addModal";
import LessonViewModal from "./viewLesson_modal";

import {
  listModules,
  listDisciplines,
  listCourses,
} from "@/new-services/poo/shared/api/catalog";

import { changeLessonStatus } from "@/new-services/poo/shared/api/lessons";

import { AdminLesson } from "@/new-services/poo/lessons/Roles";

const service = new AdminLesson();

export default function GerenciarAulasPage() {
  const [rowsLesson, setRowsLesson] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string>();

  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalView, setOpenModalView] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      console.log("Lessons...");
      const lessons = await service.list();

      console.log("Modules...");
      const modules = await listModules();

      console.log("Disciplines...");
      const disciplines = await listDisciplines();

      console.log("Courses...");
      const courses = await listCourses();

      console.log({
        lessons,
        modules,
        disciplines,
        courses,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Deseja desativar esta aula?")) {
      return;
    }

    await changeLessonStatus(id, "Inactive");

    load();
  }

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Aula",
      flex: 1.3,
    },
    {
      field: "moduleName",
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Gerenciar Aulas
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedId(undefined);
            setOpenModalEdit(true);
          }}
        >
          Nova Aula
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
          rows={rowsLesson}
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
                fileName: "aulas",
              },
            },
          }}
        />
      </Paper>

      <LessonModal
        open={openModalEdit}
        lessonId={selectedId}
        onClose={(reload) => {
          setOpenModalEdit(false);

          if (reload) {
            load();
          }
        }}
      />

      <LessonViewModal
        open={openModalView}
        lessonId={selectedId}
        onClose={() => setOpenModalView(false)}
      />
    </Box>
  );
}
