"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";

import { ActivityTakeForm } from "@/components/student/ActivityTakeForm";
import { AttemptHistoryList } from "@/components/student/AttemptHistoryList";
import {
  getActivityForTake,
  listMyActivityAttempts,
} from "@/new-services/poo/shared/api/activities";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";

function ActivityTakePageContent() {
  const searchParams = useSearchParams();
  const activityId = searchParams.get("id") ?? "";

  const [title, setTitle] = useState("");
  const [minimumScore, setMinimumScore] = useState(0);
  const [attempts, setAttempts] = useState<Awaited<ReturnType<typeof listMyActivityAttempts>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeta = async () => {
    if (!activityId) {
      setError("Atividade não informada.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [activity, activityAttempts] = await Promise.all([
        getActivityForTake(activityId),
        listMyActivityAttempts(activityId),
      ]);
      setTitle(activity.title);
      setMinimumScore(activity.minimumScore);
      setAttempts(activityAttempts);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMeta();
  }, [activityId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !activityId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? "Atividade não encontrada."}
        </Alert>
        <Button component={Link} href="/avaliacoes">
          Voltar para atividades
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/avaliacoes" style={{ textDecoration: "none", color: "inherit" }}>
          Atividades
        </Link>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <ActivityTakeForm
            activityId={activityId}
            onSuccess={async () => {
              const activityAttempts = await listMyActivityAttempts(activityId);
              setAttempts(activityAttempts);
            }}
          />

          <Box sx={{ mt: 4 }}>
            <AttemptHistoryList attempts={attempts} minimumScore={minimumScore} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function ActivityTakePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <ActivityTakePageContent />
    </Suspense>
  );
}
