"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/new-services/auth/AuthContext";

import StudentPage from "./studentPage";
import ProfessorHome from "./ProfessorHome";

export default function Home() {
  const router = useRouter();
  const { effectiveRole, loading } = useUser();

  useEffect(() => {
    if (!loading && effectiveRole === "Admin") {
      router.replace("/dashboard");
    }
  }, [loading, effectiveRole, router]);

  if (effectiveRole === "Aluno") {
    return <StudentPage />;
  }

  if (effectiveRole === "Professor") {
    return <ProfessorHome />;
  }

  return null;
}
