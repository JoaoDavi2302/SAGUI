"use client";

import DrawerLayout from "@/components/drawer";
import { HeaderItem } from "@/components/layout/types";
import { useUser } from "@/services/AuthContext";
import { AssignmentOutlined, HomeOutlined, Inventory2Outlined, MenuBookOutlined, SchoolOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

export default function EadLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, effectiveRole } = useUser();
  const router = useRouter();

  const settings: HeaderItem[] = useMemo(
    () => [
      {
        label: "Perfil",
        href: "/perfil",
      },
      ...(effectiveRole === "ADMIN"
        ? [{ label: "Dashboard", href: "/dashboard" }]
        : []),
      {
        label: "Sair",
        action: "logout",
      },
    ],
    [effectiveRole]
  );

  useEffect(() => {
    console.log("LAYOUT", { user, loading });

    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (!user) return null;

  return (
    <DrawerLayout
      title=""
      avatarSrc="/avatar.png"
      items={[
        { icon: <HomeOutlined />, label: "Início", href: "/" },
        // caso role ou admin mostrar esse menu
        { icon: <SchoolOutlined />, label: "Cursos", href: "/cursos" }, 
        { icon: <MenuBookOutlined />, label: "Disciplinas", href: "/disciplinas" },
        { icon: <Inventory2Outlined />, label: "Materiais", href: "/materiais" },
        { icon: <AssignmentOutlined />, label: "Avaliações", href: "/avaliacoes" },
      ]}
      settings={settings}
    >
      {children}
    </DrawerLayout>
  );
}