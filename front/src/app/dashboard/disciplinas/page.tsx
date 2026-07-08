"use client";

<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useState } from "react";
=======
import { useMemo, useState } from "react";
>>>>>>> origin/develop

import { Box, Typography, Button, IconButton, Paper } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/develop
    },
    {
      field: "actions",
      headerName: "Ações",
<<<<<<< HEAD
      width: 170,
      sortable: false,

      renderCell: ({ row }) => (
=======
      width: 160,
      sortable: false,
      renderCell: (params) => (
>>>>>>> origin/develop
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => {
<<<<<<< HEAD
              setSelectedId(row.id);
=======
              setSelectedId(params.row.id);
>>>>>>> origin/develop
              setOpenModalView(true);
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>

          <IconButton
<<<<<<< HEAD
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
=======
            onClick={() => {
              setSelectedId(params.row.id);
              setOpenModalEdit(true);
            }}
          >
            <Edit />
          </IconButton>

          <IconButton size="small" color="error">
>>>>>>> origin/develop
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
<<<<<<< HEAD
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Gerenciar Disciplinas
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
=======
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
>>>>>>> origin/develop
          onClick={() => {
            setSelectedId(undefined);
            setOpenModalEdit(true);
          }}
        >
          Nova disciplina
        </Button>
      </Box>

<<<<<<< HEAD
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
=======
      {/* TABLE */}
      <Paper sx={{ height: 650, p: 2, borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              fontWeight: "bold",
            },
>>>>>>> origin/develop
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
          }}
<<<<<<< HEAD
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              csvOptions: {
                fileName: "disciplinas",
              },
=======
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          showToolbar
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              printOptions: { disableToolbarButton: false },
              csvOptions: { fileName: "disciplinas" },
>>>>>>> origin/develop
            },
          }}
        />
      </Paper>
<<<<<<< HEAD

=======
>>>>>>> origin/develop
      <DisciplineModal
        open={openModalEdit}
        disciplineId={selectedId}
        onClose={(reload) => {
          setOpenModalEdit(false);

          if (reload) {
<<<<<<< HEAD
            load();
=======
            // atualizar listagem
>>>>>>> origin/develop
          }
        }}
      />

      <DisciplineViewModal
        open={openModalView}
        disciplineId={selectedId}
<<<<<<< HEAD
        onClose={() => setOpenModalView(false)}
=======
        onClose={() => {
          setOpenModalView(false);
        }}
>>>>>>> origin/develop
      />
    </Box>
  );
}
