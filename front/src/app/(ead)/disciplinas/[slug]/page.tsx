"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Circle,
  ExpandMore,
  LayersOutlined,
  Lock,
} from "@mui/icons-material";

import { useUser } from "@/new-services/auth/AuthContext";
import { getDiscipline } from "@/new-services/poo/shared/api/disciplines";
import { listModules } from "@/new-services/poo/shared/api/modules";
import { listLessons } from "@/new-services/poo/shared/api/lessons";
import { getDisciplineProgress } from "@/new-services/poo/shared/api/progress";
import type { LessonDTO } from "@/new-services/poo/shared/api/lessons";
import type { ModuleProgressResponse } from "@/new-services/poo/shared/api/progress";
import { StudentProgressBar } from "@/components/student/StudentProgressBar";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";

import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";
import ProfessorDisciplineDetailsPage from "./professorDisciplineDetailsPage";
import AdminDisciplineDetailsPage from "./adminDisciplineDetailsPage";

const database = DatabaseProvider.getDatabase();

interface ModuleWithLessons extends ModuleProgressResponse {
  lessons: LessonDTO[];
}

function StudentDisciplineDetailsContent({ disciplineId }: { disciplineId: string }) {
  const [disciplineName, setDisciplineName] = useState("");
  const [disciplineDescription, setDisciplineDescription] = useState("");
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [discipline, progress, moduleList] = await Promise.all([
          getDiscipline(disciplineId),
          getDisciplineProgress(disciplineId),
          listModules(disciplineId, "Active"),
        ]);

        setDisciplineName(discipline.name);
        setDisciplineDescription(discipline.description);
        setOverallPercentage(progress.overallPercentage ?? 0);

        const progressByModule = new Map(
          progress.modules.map((module) => [module.moduleId, module]),
        );

        const activeModules = moduleList.filter((module) => module.status === "Active");

        const modulesWithLessons = await Promise.all(
          activeModules.map(async (module) => {
            const moduleProgress = progressByModule.get(module.id);
            const unlocked = moduleProgress?.unlocked ?? false;

            let lessons: LessonDTO[] = [];
            if (unlocked) {
              try {
                lessons = await listLessons(module.id, "Active");
              } catch {
                lessons = [];
              }
            }

            return {
              moduleId: module.id,
              moduleName: module.name,
              orderIndex: module.orderIndex,
              progressPercentage: moduleProgress?.progressPercentage ?? 0,
              completed: moduleProgress?.completed ?? false,
              unlocked,
              lessons: lessons.sort((a, b) => a.orderIndex - b.orderIndex),
            };
          }),
        );

        setModules(
          modulesWithLessons.sort((a, b) => a.orderIndex - b.orderIndex),
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [disciplineId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#e3f2fd" }}>
              <LayersOutlined color="primary" />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>{disciplineName}</Typography>
              <Typography color="text.secondary">{disciplineDescription}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <StudentProgressBar
              value={overallPercentage}
              label="Progresso geral"
            />
          </Box>
        </CardContent>
      </Card>

      <Typography sx={{ fontWeight: 700, mb: 2 }}>Conteúdo</Typography>

      {modules.map((module) => (
        <Accordion
          key={module.moduleId}
          disabled={!module.unlocked}
          sx={{ mb: 1, "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={module.unlocked ? <ExpandMore /> : <Lock />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{module.moduleName}</Typography>
              {!module.unlocked && (
                <Typography variant="caption" color="text.secondary">
                  — Conclua todas as aulas e a atividade do módulo anterior (70% ou 3 tentativas)
                </Typography>
              )}
              {module.completed && (
                <CheckCircle color="success" fontSize="small" />
              )}
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            {module.lessons.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhuma aula disponível neste módulo.
              </Typography>
            ) : (
              module.lessons.map((lesson) => (
                <Box
                  key={lesson.id}
                  component={Link}
                  href={`/aulas/${lesson.id}`}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    p: 1,
                    borderRadius: 1,
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Circle color="disabled" fontSize="small" />
                  <Typography>{lesson.name}</Typography>
                </Box>
              ))
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function DisciplinePageContent() {
  const searchParams = useSearchParams();
  const disciplineId = searchParams.get("id") ?? "";
  const { user, effectiveRole } = useUser();

  const provider = useMemo(() => {
    if (!user || effectiveRole === "Aluno") return null;
    return DisciplineProvider.create(effectiveRole, database, user);
  }, [user, effectiveRole]);

  const data = useMemo(() => {
    if (!provider || !disciplineId || effectiveRole === "Aluno") return null;
    const numericId = Number(disciplineId);
    if (!Number.isFinite(numericId)) return null;
    return provider.getDetails(numericId);
  }, [provider, disciplineId, effectiveRole]);

  if (effectiveRole === "Aluno") {
    if (!disciplineId) {
      return (
        <Alert severity="warning" sx={{ m: 3 }}>
          Disciplina não informada.
        </Alert>
      );
    }
    return <StudentDisciplineDetailsContent disciplineId={disciplineId} />;
  }

  if (!data || !provider) return null;

  if (effectiveRole === "Professor") {
    return <ProfessorDisciplineDetailsPage data={data} user={user} />;
  }

  return <AdminDisciplineDetailsPage data={data} user={user} />;
}

export default function DisciplinePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <DisciplinePageContent />
    </Suspense>
  );
}
