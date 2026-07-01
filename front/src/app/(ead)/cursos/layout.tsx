// para bloqueio do aluno
"use client";

import { useUser } from "@/services/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, effectiveRole } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // redireciona para não encontrado
    // if (effectiveRole === "ALUNO") {
    //   router.replace("/not-found");
    // }
  }, [user, loading, effectiveRole, router]);

  if (loading) return null;

  if (!user) {
    return <></>; // middleware já redireciona
  }

  // retorna rota vazia
  // if (effectiveRole === "ALUNO") return null;

  return <>{children}</>;
}
