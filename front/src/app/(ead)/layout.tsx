"use client";

import DrawerLayout from "@/components/drawer";
import { adminSidebarItems } from "@/components/layout/adminSidebar";
import { HeaderItem } from "@/components/layout/types";
import { useUser } from "@/new-services/auth/AuthContext";
import {
  AssignmentOutlined,
  HomeOutlined,
  MenuBookOutlined,
  CalendarTodayOutlined,
  AssessmentOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import React, { useMemo } from "react";

export default function EadLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, effectiveRole } = useUser();

  const menuItems = useMemo(() => {
    if (!user) return [];

    if (effectiveRole === "Admin") {
      return adminSidebarItems;
    }

    // Menu para o Professor (Centro de Comando)
    if (effectiveRole === "Professor") {
      return [
        { icon: <HomeOutlined />, label: "Início", href: "/", exact: true },
        { icon: <MenuBookOutlined />, label: "Disciplinas", href: "/professor/disciplinas" },
        { icon: <CalendarTodayOutlined />, label: "Calendário", href: "/professor/calendario" },
        { icon: <AssessmentOutlined />, label: "Relatórios", href: "/professor/relatorios" },
      ];
    }

    // Menu Padrão (Aluno)
    return [
      { icon: <HomeOutlined />, label: "Início", href: "/" },
<<<<<<< HEAD
      { icon: <SchoolOutlined />, label: "Cursos", href: "/cursos" },
      { icon: <MenuBookOutlined />, label: "Disciplinas", href: "/disciplinas" },
      { icon: <AssignmentOutlined />, label: "Avaliações", href: "/avaliacoes" },
=======

      // ...(effectiveRole === "ADMINISTRADOR" || effectiveRole === "PROFESSOR"
      //   ? [
            {
              icon: <SchoolOutlined />,
              label: "Cursos",
              href: "/cursos",
            },
        //   ]
        // : []),

      {
        icon: <MenuBookOutlined />,
        label: "Disciplinas",
        href: "/disciplinas",
      },
      // desabilitado enquanto não há dados
      // {
      //   icon: <Inventory2Outlined />,
      //   label: "Materiais",
      //   href: "/materiais",
      // },
      {
        icon: <AssignmentOutlined />,
        label: "Avaliações",
        href: "/avaliacoes",
      },
>>>>>>> origin/develop
    ];
  }, [user, effectiveRole]);

  const settings: HeaderItem[] = useMemo(
    () => [
      { label: "Perfil", href: "/perfil" },
<<<<<<< HEAD
      ...(effectiveRole === "Admin" ? [{ label: "Dashboard", href: "/dashboard" }] : []),
=======
      ...(effectiveRole === "ADMINISTRADOR"
        ? [{ label: "Dashboard", href: "/dashboard" }]
        : []),
>>>>>>> origin/develop
      { label: "Sair", action: "logout" },
    ],
    [effectiveRole],
  );

  if (loading) return <div>Carregando...</div>;
  if (!user) return null;

  return (
    <DrawerLayout avatarSrc="/avatar.png" items={menuItems} settings={settings}>
      {children}
    </DrawerLayout>
  );
}
