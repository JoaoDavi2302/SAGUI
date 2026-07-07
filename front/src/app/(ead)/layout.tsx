"use client";

import DrawerLayout from "@/components/drawer";
import { HeaderItem } from "@/components/layout/types";
import { useUser } from "@/new-services/auth/AuthContext";
import {
  AssignmentOutlined,
  DashboardOutlined,
  HomeOutlined,
  MenuBookOutlined,
  CalendarTodayOutlined,
  AssessmentOutlined,
  PeopleOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import React, { useMemo } from "react";

export default function EadLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, effectiveRole } = useUser();

  const menuItems = useMemo(() => {
    if (!user) return [];

    if (effectiveRole === "Admin") {
      return [
        { icon: <DashboardOutlined />, label: "Painel", href: "/dashboard" },
        {
          icon: <PeopleOutlined />,
          label: "Usuários",
          href: "/dashboard/usuarios",
        },
      ];
    }

    // Menu para o Professor (Centro de Comando)
    if (effectiveRole === "Professor") {
      return [
        { icon: <HomeOutlined />, label: "Início", href: "/professorPage" },
        { icon: <MenuBookOutlined />, label: "Disciplinas", href: "/professor/disciplinas" },
        { icon: <CalendarTodayOutlined />, label: "Calendário", href: "/professor/calendario" },
        { icon: <AssessmentOutlined />, label: "Relatórios", href: "/professor/relatorios" },
      ];
    }

    // Menu Padrão (Aluno)
    return [
      { icon: <HomeOutlined />, label: "Início", href: "/" },
      { icon: <SchoolOutlined />, label: "Cursos", href: "/cursos" },
      { icon: <MenuBookOutlined />, label: "Disciplinas", href: "/disciplinas" },
      { icon: <AssignmentOutlined />, label: "Avaliações", href: "/avaliacoes" },
    ];
  }, [user, effectiveRole]);

  const settings: HeaderItem[] = useMemo(
    () => [
      { label: "Perfil", href: "/perfil" },
      { label: "Sair", action: "logout" },
    ],
    [effectiveRole],
  );

  if (loading) return <div>Carregando...</div>;
  if (!user) return null;

  return (
    <DrawerLayout title="Centro de Comando" avatarSrc="/avatar.png" items={menuItems} settings={settings}>
      {children}
    </DrawerLayout>
  );
}
