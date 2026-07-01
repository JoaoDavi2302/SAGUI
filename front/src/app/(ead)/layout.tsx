"use client";

import DrawerLayout from "@/components/drawer";
import { HeaderItem } from "@/components/layout/types";
import { useUser } from "@/services/auth/AuthContext";
import {
  AssignmentOutlined,
  HomeOutlined,
  Inventory2Outlined,
  MenuBookOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import React, { useMemo } from "react";

export default function EadLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, effectiveRole } = useUser();

  const menuItems = useMemo(() => {
    if (!user) return [];

    return [
      { icon: <HomeOutlined />, label: "Início", href: "/" },

      ...(effectiveRole === "ADMIN" || effectiveRole === "PROFESSOR"
        ? [
            {
              icon: <SchoolOutlined />,
              label: "Cursos",
              href: "/cursos",
            },
          ]
        : []),

      {
        icon: <MenuBookOutlined />,
        label: "Disciplinas",
        href: "/disciplinas",
      },
      {
        icon: <Inventory2Outlined />,
        label: "Materiais",
        href: "/materiais",
      },
      {
        icon: <AssignmentOutlined />,
        label: "Avaliações",
        href: "/avaliacoes",
      },
    ];
  }, [user, effectiveRole]);

  const settings: HeaderItem[] = useMemo(
    () => [
      { label: "Perfil", href: "/perfil" },
      ...(effectiveRole === "ADMIN"
        ? [{ label: "Dashboard", href: "/dashboard" }]
        : []),
      { label: "Sair", action: "logout" },
    ],
    [effectiveRole],
  );

  if (loading) {
    // criar ui loading
    return <div>Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <DrawerLayout
      title=""
      avatarSrc="/avatar.png"
      items={menuItems}
      settings={settings}
    >
      {children}
    </DrawerLayout>
  );
}
