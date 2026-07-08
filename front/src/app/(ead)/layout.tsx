"use client";

import DrawerLayout from "@/components/drawer";
import { adminSidebarItems } from "@/components/layout/adminSidebar";
import { HeaderItem } from "@/components/layout/types";
import { useUser } from "@/new-services/auth/AuthContext";
import {
  AssignmentOutlined,
  HomeOutlined,
  MenuBookOutlined,
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
    [],
  );

  if (loading) return <div>Carregando...</div>;
  if (!user) return null;

  return (
    <DrawerLayout avatarSrc="/avatar.png" items={menuItems} settings={settings}>
      {children}
    </DrawerLayout>
  );
}
