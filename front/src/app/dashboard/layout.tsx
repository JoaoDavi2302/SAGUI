"use client";

import DrawerLayout from "@/components/drawer";
import { useUser } from "@/services/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();

  const router = useRouter();

  useEffect(() => {
    console.log("LAYOUT", {
      user,
      loading,
    });

    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading]);

  if (loading) return null;

  if (!user) return null;

  return (
    <DrawerLayout
      title="Sagui Admin"
      avatarSrc="/avatar.png"
      items={[
        {
          label: "Dashboard",
          href: "/dashboard",
        },
      ]}
      settings={[
        {
          label: "Site",
          href: "/",
        },
        {
          label: "Perfil",
          href: "/perfil",
        },
        {
          label: "Sair",
          action: "logout",
        },
      ]}
    >
      {children}
    </DrawerLayout>
  );
}
