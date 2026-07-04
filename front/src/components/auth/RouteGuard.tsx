"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/services/auth/AuthContext";
import { canAccess } from "@/services/auth/router-acess";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, effectiveRole } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (effectiveRole === "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    if (!canAccess(pathname, effectiveRole)) {
      router.replace("/not-found");
    }
  }, [loading, user, effectiveRole, pathname, router]);

  if (loading || !user) return null;

  if (!canAccess(pathname, effectiveRole)) return null;

  return <>{children}</>;
}
