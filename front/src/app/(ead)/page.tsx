"use client";

import { useMemo } from "react";

import { useUser } from "@/services/auth/AuthContext";
import { DashboardProvider } from "@/services/poo/dashboard/dashboardProvider";
import { DatabaseProvider } from "@/services/poo/databaseProvider";

import StudentPage from "./studentPage";
import ProfessorPage from "./professorPage";
import AdminPage from "./adminPage";

export default function Home() {
  const { user, effectiveRole } = useUser();

  const database = DatabaseProvider.getDatabase();

  const dashboard = useMemo(() => {
    return DashboardProvider.create(
      effectiveRole,
      user,
      database
    );
  }, [effectiveRole, user]);

  const data = dashboard.getData();

  if (effectiveRole === "Aluno") {
    return <StudentPage user={user} data={data} />;
  }

  if (effectiveRole === "Professor") {
    return <ProfessorPage user={user} data={data} />;
  }

  if (effectiveRole === "Admin") {
    return <AdminPage user={user} data={data} />;
  }

  return null;
}