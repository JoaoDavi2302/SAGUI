"use client";

import { useCallback, useEffect, useState } from "react";

import { Box, Typography, Button, IconButton, Paper } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { Add, Delete, Edit, Visibility } from "@mui/icons-material";

import {
  listCourses,
  changeCourseStatus,
  CourseDTO,
} from "@/new-services/poo/shared/api/catalog";

import { AdminCourse } from "@/new-services/poo/course/Roles";

import CourseModal from "./edit_addModal";
import CourseViewModal from "./viewCourse_Modal";

const service = new AdminCourse();

export default function GerenciarCursosPage() {
  const [rows, setRows] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string>();

  const [openEdit, setOpenEdit] = useState(false);

  const [openView, setOpenView] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const courses = await service.listCourses();

      const data = courses.map((course) => ({
        ...course,
      }));

      setRows(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Deseja desativar este curso?")) return;

    await changeCourseStatus(id, "Inactive");

    load();
  }

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Curso",
      flex: 1,
    },

    {
      field: "description",
      headerName: "Descrição",
      flex: 2,
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

      renderCell: ({ row }) => (
        <Box sx={{display:"flex", gap:1}}>
          <IconButton
            onClick={() => {
              setSelectedId(row.id);
              setOpenView(true);
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>

          <IconButton
            onClick={() => {
              setSelectedId(row.id);
              setOpenEdit(true);
            }}
          >
            <Edit fontSize="small" />
          </IconButton>

          <IconButton color="error" onClick={() => handleDelete(row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{p:3}}>
      <Box sx={{display:"flex", justifyContent:"space-between", mb:2}}>
        <Typography variant="h5" sx={{fontWeight:"bold"}}>
          Gerenciar Cursos
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedId(undefined);
            setOpenEdit(true);
          }}
        >
          Novo Curso
        </Button>
      </Box>

      <Paper
        sx={{
          height: 650,
          p: 2,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          showToolbar
          sx={{
            border: "none",
          }}
        />
      </Paper>

      <CourseModal
        open={openEdit}
        courseId={selectedId}
        onClose={(reload) => {
          setOpenEdit(false);

          if (reload) load();
        }}
      />

      {/* <CourseViewModal
        open={openView}
        courseId={selectedId}
        onClose={() => setOpenView(false)}
      /> */}
    </Box>
  );
}
