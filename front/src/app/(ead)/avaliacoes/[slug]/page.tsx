"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

import { useUser } from "@/new-services/auth/AuthContext";

export default function ActivityModuleRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { effectiveRole } = useUser();
  const moduleId = searchParams.get("id");

  useEffect(() => {
    if (effectiveRole === "Aluno") {
      router.replace("/avaliacoes");
      return;
    }
    if (!moduleId) {
      router.replace("/avaliacoes");
    }
  }, [effectiveRole, moduleId, router]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );
}
