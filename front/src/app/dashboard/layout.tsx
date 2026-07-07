"use client";

import DrawerLayout from "@/components/drawer";
import { useUser } from "@/services/auth/AuthContext";
import { DashboardOutlined, PeopleOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
        { icon: <DashboardOutlined />, label: "Painel", href: "/dashboard" },
        {
          icon: <PeopleOutlined />,
          label: "Usuários",
          href: "/dashboard/usuarios",
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
