"use client";

import DrawerLayout from "@/components/drawer";
import { HeaderItem } from "@/components/layout/types";
import { useUser } from "@/services/AuthContext";
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
        { label: "Início", href: "/" },
        { label: "Disciplinas", href: "/disciplinas" },
      ]}
      settings={settings}
    >
      {children}
    </DrawerLayout>
  );
}