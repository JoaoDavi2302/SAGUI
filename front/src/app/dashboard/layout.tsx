"use client";

import DrawerLayout from "@/components/drawer";
import { adminSidebarItems } from "@/components/layout/adminSidebar";
import { useUser } from "@/new-services/auth/AuthContext";
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
      avatarSrc="/avatar.png"
      items={adminSidebarItems}
      settings={[
        { label: "Perfil", href: "/perfil" },
        { label: "Sair", action: "logout" },
      ]}
    >
      {children}
    </DrawerLayout>
  );
}
