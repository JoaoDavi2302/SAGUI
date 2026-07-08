"use client";

<<<<<<< HEAD
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
=======
import { useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
} from "@mui/material";

import {
  QuizOutlined,
  ArrowBack,
  PlayArrow,
} from "@mui/icons-material";

import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { ActivityProvider } from "@/services/poo/activity/activityProvider";
import { useUser } from "@/services/auth/AuthContext";

const database = DatabaseProvider.getDatabase();

export default function ActivityModulePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user, effectiveRole } = useUser();

  const moduleId = Number(searchParams.get("id"));

  const provider = useMemo(() => {
    if (!user) return null;
    return ActivityProvider.create(effectiveRole, database, user);
  }, [user, effectiveRole]);

  const moduleData = useMemo(() => {
    if (!provider || !moduleId) return null;

    const modules = provider.listModules();

    return modules.find((m) => m.moduleId === moduleId) ?? null;
  }, [provider, moduleId]);

  const goToQuiz = (quizId: number) => {
    router.push(`/quiz/${quizId}`);
  };

  if (!moduleData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Módulo não encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Typography sx={{ fontSize: 28, fontWeight: 700 }}>
        {moduleData.moduleName}
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {moduleData.disciplineName} • {moduleData.courseName}
      </Typography>

      <Chip
        label={`${moduleData.quizzes.length} atividade(s)`}
        sx={{ mb: 3 }}
      />

      {/* LISTA DE QUIZZES */}
      <Stack spacing={2}>
        {moduleData.quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            variant="outlined"
            sx={{
              borderRadius: 3,
              transition: ".2s",
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: 3,
              },
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                sx={{alignItems:"center"}}
              >
                {/* ICON */}
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 3,
                    bgcolor: "primary.50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                  }}
                >
                  <QuizOutlined />
                </Box>

                {/* INFO */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {quiz.titulo || `Atividade ${quiz.id}`}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {quiz.questionCount} questões
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      label={`ID ${quiz.id}`}
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                {/* ACTION */}
                <Button
                  variant="contained"
                  endIcon={<PlayArrow />}
                  onClick={() => goToQuiz(quiz.id)}
                >
                  Iniciar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
>>>>>>> origin/develop
