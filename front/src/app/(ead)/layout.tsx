"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
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
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

export default function EadLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, effectiveRole } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (!loading && effectiveRole === "ADMIN") {
      router.replace("/dashboard");
    }
  }, [loading, user, effectiveRole, router]);

  const menuItems = useMemo(() => {
    if (!user || effectiveRole === "ADMIN") return [];

    const items = [{ icon: <HomeOutlined />, label: "Início", href: "/" }];

    items.push({
      icon: <SchoolOutlined />,
      label: "Cursos",
      href: "/cursos",
    });

    if (effectiveRole === "PROFESSOR") {
      items.push({
        icon: <MenuBookOutlined />,
        label: "Disciplinas",
        href: "/disciplinas",
      });
    }

    items.push(
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
    );

    return items;
  }, [user, effectiveRole]);

  const settings: HeaderItem[] = useMemo(
    () => [
      { label: "Perfil", href: "/perfil" },
      { label: "Sair", action: "logout" },
    ],
    [],
  );

  if (loading) {
    // criar ui loading
    return <div>Carregando...</div>;
  }

  if (!user || effectiveRole === "ADMIN") {
    return null;
  }

  return (
    <RouteGuard>
      <DrawerLayout
        title=""
        avatarSrc="/avatar.png"
        items={menuItems}
        settings={settings}
      >
        {children}
      </DrawerLayout>
    </RouteGuard>
  );
}
