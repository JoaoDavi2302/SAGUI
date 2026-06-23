"use client";

import DrawerLayout from "@/components/drawer";
import { HeaderItem } from "@/components/layout/types";
import { useUser } from "@/services/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

export default function EadLayout({ children }: { children: React.ReactNode }) {
  const { effectiveRole } = useUser();

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

  const settings: HeaderItem[] = React.useMemo(
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
    [effectiveRole],
  );

  return (
    <>
      <DrawerLayout
        title="Sagui"
        avatarSrc="/avatar.png"
        items={[
          { label: "Início", href: "/" },
          { label: "Disciplinas", href: "/disciplinas" },
        ]}
        settings={settings}
      >
        {children}
      </DrawerLayout>
    </>
  );
}
