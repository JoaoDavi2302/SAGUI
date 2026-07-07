"use client";

import { useMemo } from "react";

import { useSearchParams } from "next/navigation";
import { useUser } from "@/services/auth/AuthContext";

import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";

import StudentDisciplineDetailsPage from "./studentDisciplineDetailsPage";
import ProfessorDisciplineDetailsPage from "./professorDisciplineDetailsPage";
import AdminDisciplineDetailsPage from "./adminDisciplineDetailsPage";

const database = DatabaseProvider.getDatabase();

export default function DisciplinePage() {
  const searchParams = useSearchParams();

  const disciplineId = Number(searchParams.get("id"));

  const { user, effectiveRole } = useUser();

  const provider = useMemo(() => {
    if (!user) return null;

    return DisciplineProvider.create(effectiveRole, database, user);
  }, [user, effectiveRole]);

  const data = useMemo(() => {
    if (!provider || !disciplineId) return null;

    return provider.getDetails(disciplineId);
  }, [provider, disciplineId]);

  if (!data || !provider) return null;

  if (effectiveRole === "ALUNO") {
    return <StudentDisciplineDetailsPage data={data} user={user} />;
  }

  if (effectiveRole === "PROFESSOR") {
    return <ProfessorDisciplineDetailsPage data={data} user={user} />;
  }

  return <AdminDisciplineDetailsPage data={data} user={user} />;
}
