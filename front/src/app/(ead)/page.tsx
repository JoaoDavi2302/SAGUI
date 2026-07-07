"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/new-services/auth/AuthContext";
import { DashboardProvider } from "@/services/poo/dashboard/dashboardProvider";
import { DatabaseProvider } from "@/services/poo/databaseProvider";

import StudentPage from "./studentPage";
import ProfessorPage from "./professorPage";

export default function Home() {
  const router = useRouter();
  const { user, effectiveRole, loading } = useUser();

  useEffect(() => {
    if (!loading && effectiveRole === "Admin") {
      router.replace("/dashboard");
    }
  }, [loading, effectiveRole, router]);

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

  return null;
}