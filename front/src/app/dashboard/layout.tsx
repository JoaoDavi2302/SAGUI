"use client";

import DrawerLayout from "@/components/drawer";
import { useUser } from "@/new-services/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

export default function DashboardLayout({
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

    if (effectiveRole !== "Admin") {
      router.replace("/not-found");
    }
  }, [user, loading, effectiveRole, router]);

  if (loading || !user) return null;

  if (effectiveRole !== "Admin") return null;

  return (
    <DrawerLayout
      title="Sagui Admin"
      avatarSrc="/avatar.png"
      items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Cursos", href: "/dashboard/cursos" },
        { label: "Disciplinas", href: "/dashboard/disciplinas" },
        { label: "Usuarios", href: "/dashboard/usuarios" },
      ]}
      settings={[
        { label: "Site", href: "/" },
        { label: "Perfil", href: "/perfil" },
        { label: "Sair", action: "logout" },
      ]}
    >
      {children}
    </DrawerLayout>
  );
}