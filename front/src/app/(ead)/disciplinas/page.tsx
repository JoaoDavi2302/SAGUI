"use client";

import { useMemo } from "react";

import { useUser } from "@/services/auth/AuthContext";
import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";

import StudentDisciplinesPage from "./studentDisciplinesPage";
import ProfessorDisciplinesPage from "./professorDisciplinesPage";
import AdminDisciplinesPage from "./adminDisciplinesPage";

const database = DatabaseProvider.getDatabase();

export default function DisciplinasPage() {
  const { user, effectiveRole } = useUser();

  const provider = useMemo(() => {
    if (!user) return null;

    return DisciplineProvider.create(
      effectiveRole,
      database,
      user
    );
  }, [effectiveRole, user]);

  const data = useMemo(() => {
    if (!provider)
      return {
        grouped: [],
        modules: [],
        lessons: [],
        moduleProgress: [],
      };

    return provider.getPageData();
  }, [provider]);

  if (!provider) return null;

  if (effectiveRole === "Aluno") {
    return (
      <StudentDisciplinesPage
        user={user}
        data={data}
      />
    );
  }

  if (effectiveRole === "Professor") {
    return (
      <ProfessorDisciplinesPage
        user={user}
        data={data}
      />
    );
  }

  return (
    <AdminDisciplinesPage
      user={user}
      data={data}
    />
  );
}