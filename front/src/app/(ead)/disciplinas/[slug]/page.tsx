"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  LayersOutlined,
  PlayCircle,
  CheckCircle,
  Circle,
  ExpandMore,
} from "@mui/icons-material";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useUser } from "@/services/auth/AuthContext";

import { DisciplineProvider } from "@/services/poo/discipline/disciplineProvider";
import database from "@/components/mock.json";

const Stat = ({ icon: Icon, label, value }: any) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: "rgba(0,0,0,0.03)",
      display: "flex",
      flexDirection: "column",
      gap: 0.5,
    }}
  >
    <Icon sx={{ fontSize: 18, color: "#1976d2" }} />
    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{value}</Typography>
    <Typography
      sx={{ fontSize: 10, color: "gray", textTransform: "uppercase" }}
    >
      {label}
    </Typography>
  </Box>
);

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function DisciplineDetailsPage() {
  const searchParams = useSearchParams();
  const disciplineId = searchParams.get("id");

  const router = useRouter();
  const { user, effectiveRole } = useUser();
  const isStudent = effectiveRole === "ALUNO";

  const [tabIndex, setTabIndex] = useState(0);

  const provider = useMemo(() => {
    if (!user) return null;
    return DisciplineProvider.create(effectiveRole, database, user);
  }, [user, effectiveRole]);

  // ✅ POO PRINCIPAL (substitui tudo manual)
  const data = useMemo(() => {
    if (!provider || !disciplineId) return null;

    return provider.getDetails(disciplineId);
  }, [provider, disciplineId]);

  const discipline = data?.discipline;
  const modules = data?.modules ?? [];
  const students = data?.students ?? [];

  const handleOpenLesson = (lessonId: string) => {
    router.push(`/aulas/${lessonId}`);
  };

  const openDiscipline = (subject: any) => {
    const slug = slugify(subject.name);
    router.push(`/disciplinas/${slug}?id=${subject.id}`);
  };

  const openModule = (moduleId: string) => {
    const firstLesson = modules
      .flatMap((m: any) => m.lessons ?? [])
      .find((l: any) => l.module_id === moduleId);

    if (!firstLesson) return;
    router.push(`/aulas/${firstLesson.id}`);
  };

  if (!discipline || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Disciplina não encontrada</Typography>
      </Box>
    );
  }

  const currentStudent = students.find((s: any) => s.id === user?.id);

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 2 }}>
              <LayersOutlined sx={{ color: "#1976d2" }} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                {discipline.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {discipline.description}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* PROGRESSO (POO) */}
          {isStudent && currentStudent && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption">Progresso geral</Typography>
                <Typography variant="caption">
                  {currentStudent.percentage}%
                </Typography>
              </Box>

              <LinearProgress
                value={currentStudent.percentage}
                variant="determinate"
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* STATS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat icon={LayersOutlined} label="Módulos" value={modules.length} />
        </Grid>
        {/* <Grid size={{ xs: 6, md: 3 }}>
          <Stat icon={PlayCircle} label="Aulas" value={data.lessons.length} />
        </Grid> */}
      </Grid>

      {/* TABS */}
      {!isStudent && (
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Detalhes" />
          <Tab label="Alunos" />
        </Tabs>
      )}

      {/* DETALHES */}
      {(isStudent || tabIndex === 0) && (
        <Box>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>
            Conteúdo programático
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {modules.map((m: any) => (
              <Accordion
                key={m.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "none",
                  border: "1px solid #eee",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ width: "100%" }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{m.name}</Typography>

                      {isStudent && (
                        <Chip size="small" label={`${m.progress}%`} />
                      )}
                    </Box>

                    {isStudent && (
                      <LinearProgress
                        value={m.progress}
                        variant="determinate"
                        sx={{ mt: 1, height: 6, borderRadius: 5 }}
                      />
                    )}

                    {!isStudent && (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {m.description}
                      </Typography>
                    )}
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  {(m.lessons ?? []).map((l: any) => {
                    const done = l.completed;

                    return (
                      <Box
                        key={l.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1,
                          borderRadius: 2,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#f5f5f5" },
                        }}
                        onClick={() => handleOpenLesson(l.id)}
                      >
                        {isStudent ? (
                          done ? (
                            <CheckCircle
                              sx={{ fontSize: 18, color: "green" }}
                            />
                          ) : (
                            <Circle sx={{ fontSize: 18, color: "gray" }} />
                          )
                        ) : (
                          <PlayCircle sx={{ fontSize: 18, color: "#1976d2" }} />
                        )}

                        <Typography sx={{ fontSize: 14 }}>{l.name}</Typography>
                      </Box>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      )}

      {/* ALUNOS */}
      {!isStudent && tabIndex === 1 && (
        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>
              Progresso dos alunos
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell>Aulas</TableCell>
                  <TableCell>Média</TableCell>
                  <TableCell>Progresso</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    {/* <TableCell>
                      {s.completedLessons}/{data.lessons.length}
                    </TableCell> */}
                    <TableCell>{s.avg}</TableCell>
                    <TableCell>
                      <LinearProgress
                        value={s.percentage}
                        variant="determinate"
                        sx={{ height: 6, borderRadius: 5 }}
                      />
                      <Typography variant="caption">{s.percentage}%</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
