"use client";

import DrawerLayout from "@/components/drawer";
import { useUser } from "@/services/auth/AuthContext";
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

    if (effectiveRole !== "ADMINISTRADOR") {
      router.replace("/not-found");
    }
  }, [user, loading, effectiveRole, router]);

  if (loading || !user) return null;

  if (effectiveRole !== "ADMINISTRADOR") return null;

  return (
    <DrawerLayout
      title="Sagui Admin"
      avatarSrc="/avatar.png"
      items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Disciplinas", href: "/dashboard/disciplinas" },
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