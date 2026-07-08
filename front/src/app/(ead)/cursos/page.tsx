"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

import { useUser } from "@/new-services/auth/AuthContext";

import StudentCoursesPage from "./studentCoursesPage";
import ProfessorCoursesPage from "./professorCoursesPage";
import AdminCoursesPage from "./AdminCoursesPage";

export default function CursosPage() {
  const { user, effectiveRole } = useUser();

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      {effectiveRole === "Aluno" && <StudentCoursesPage />}

      {effectiveRole === "Professor" && <ProfessorCoursesPage />}

      {effectiveRole === "Admin" && <AdminCoursesPage />}
    </Suspense>
  );
}
