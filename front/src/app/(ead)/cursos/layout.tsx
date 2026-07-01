"use client";

import { useUser } from "@/services/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return <>{children}</>;
}
