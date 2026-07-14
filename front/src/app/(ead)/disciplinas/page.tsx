"use client";

import { Suspense, useEffect } from "react";
import { CircularProgress, Box } from "@mui/material";
import { useRouter } from "next/navigation";

import { useUser } from "@/new-services/auth/AuthContext";

import StudentDisciplinesPage from "./studentDisciplinesPage";
import AdminDisciplinesPage from "./adminDisciplinesPage";

export default function DisciplinasPage() {
  const router = useRouter();
  const { effectiveRole } = useUser();

  useEffect(() => {
    if (effectiveRole === "Professor") {
      router.replace("/professor/disciplinas");
    }
  }, [effectiveRole, router]);

  if (effectiveRole === "Aluno") {
    return <StudentDisciplinesPage />;
  }

  if (effectiveRole === "Professor") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <AdminDisciplinesPage />
    </Suspense>
  );
}
