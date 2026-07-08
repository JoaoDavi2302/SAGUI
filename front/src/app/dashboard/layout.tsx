"use client";

import DrawerLayout from "@/components/drawer";
import { useUser } from "@/new-services/auth/AuthContext";
import {
  DashboardOutlined,
  HowToRegOutlined,
  MenuBookOutlined,
  PeopleOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
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
        {
          icon: <DashboardOutlined />,
          label: "Painel",
          href: "/dashboard",
          exact: true,
        },
        {
          icon: <SchoolOutlined />,
          label: "Cursos",
          href: "/dashboard/cursos",
        },
        {
          icon: <MenuBookOutlined />,
          label: "Disciplinas",
          href: "/dashboard/disciplinas",
        },
        {
          icon: <PeopleOutlined />,
          label: "Usuários",
          href: "/dashboard/usuarios",
        },
        {
          icon: <HowToRegOutlined />,
          label: "Matrículas",
          href: "/dashboard/matriculas",
        },
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
