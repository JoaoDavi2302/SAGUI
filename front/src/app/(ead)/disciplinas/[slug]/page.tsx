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
    AccessTimeOutlined,
    PlayCircle,
    CheckCircle,
    Circle,
    ExpandMore,
    Add,
} from "@mui/icons-material";

import { useRouter, useSearchParams } from "next/navigation";
import { useCatalogDatabase } from "@/services/auth/dataContext";
import { useMemo, useState } from "react";
import { useUser } from "@/services/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { CreateModuleModal } from "@/components/catalog/CreateModuleModal";

const Stat = ({ icon: Icon, label, value }: any) => (
    <Box sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: "rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
    }}>
        <Icon sx={{ fontSize: 18, color: "#1976d2" }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{value}</Typography>
        <Typography sx={{ fontSize: 10, color: "gray", textTransform: "uppercase" }}>
            {label}
        </Typography>
    </Box>
);

export default function DisciplinePage() {
    const searchParams = useSearchParams();
    const disciplineId = searchParams.get("id");
    const router = useRouter();
    const handleOpenLesson = (lessonId: string) => {
        router.push(`/aulas/${lessonId}`);
    };

    const { user, effectiveRole } = useUser();
    const { database, loading, error, refresh } = useCatalogDatabase();
    const isStudent = effectiveRole === "ALUNO";

    const [tabIndex, setTabIndex] = useState(0);
    const [moduleModalOpen, setModuleModalOpen] = useState(false);

    const discipline = database.disciplines.find(
        (d) => String(d.id) === String(disciplineId)
    );

    const modules = database.modules.filter(
        (m) => String(m.discipline_id) === String(disciplineId)
    );

    const canCreateModule =
        effectiveRole === "PROFESSOR" &&
        user?.id != null &&
        String(discipline?.professor_id) === String(user.id);

    const nextOrderIndex =
        modules.length > 0
            ? Math.max(...modules.map((m) => m.order_index ?? 0)) + 1
            : 1;

    // ALUNOS (SEM DUPLICAÇÃO)
    const students = useMemo(() => {
        const enrollments = database.enrollments.filter((e: any) =>
            modules.some((m: any) => String(m.discipline_id) === String(disciplineId))
        );

        const uniqueIds = Array.from(
            new Set(enrollments.map((e: any) => e.student_id))
        );

        return uniqueIds
            .map((id: string) =>
                database.users?.find((u: any) => u.id === id)
            )
            .filter(Boolean);
    }, [disciplineId, modules]);

    const selectedStudent = students[tabIndex] ?? null;

    // LESSONS
    const lessons = useMemo(() => {
        return database.lessons.filter((l: any) =>
            modules.some((m: any) => m.id === l.module_id)
        );
    }, [modules]);

    // PROGRESSO
    const getProgress = (studentId: string) =>
        (database.lesson_progress ?? []).filter(
            (p: any) => p.student_id === studentId
        );

    const isDone = (studentId: string, lessonId: string) =>
        getProgress(studentId).some(
            (p: any) =>
                p.lesson_id === lessonId &&
                (p.status === "COMPLETED" || p.completed === true)
        );

    // MÉTRICAS ALUNO
    const getStudentData = (studentId: string) => {
        const completedLessons = lessons.filter((l: any) =>
            isDone(studentId, l.id)
        ).length;

        const percent = lessons.length
            ? Math.round((completedLessons / lessons.length) * 100)
            : 0;

        const quizAttempts = database.quiz_attempts?.filter(
            (q: any) => q.student_id === studentId
        ) ?? [];

        const avg =
            quizAttempts.length > 0
                ? (
                    quizAttempts.reduce((a: number, b: any) => a + (b.score ?? 0), 0) /
                    quizAttempts.length
                ).toFixed(1)
                : "0";

        return { completedLessons, percent, avg };
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
                <Typography>Carregando...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!discipline) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Disciplina não encontrada</Typography>
            </Box>
        );
    }

    // aluno logado
    const currentStudent = user?.id
        ? getStudentData(user.id)
        : null;

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

                    {/* PROGRESSO ALUNO LOGADO */}
                    {isStudent && currentStudent && (
                        <Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="caption">Progresso geral</Typography>
                                <Typography variant="caption">
                                    {currentStudent.percent}%
                                </Typography>
                            </Box>

                            <LinearProgress
                                value={currentStudent.percent}
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
                <Grid size={{ xs: 6, md: 3 }}>
                    <Stat icon={PlayCircle} label="Aulas" value={lessons.length} />
                </Grid>
            </Grid>

            {/* TABS */}
            {!isStudent && (
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
                    <Tab label="Detalhes" />
                    <Tab label="Alunos" />
                </Tabs>
            )}

            {/* aba: detalhes do curso */}
            {(isStudent || tabIndex === 0) && (
                <Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography sx={{ fontWeight: 700 }}>
                            Conteúdo programático
                        </Typography>

                        {canCreateModule && disciplineId && (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Add />}
                                onClick={() => setModuleModalOpen(true)}
                            >
                                Novo módulo
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {modules.map((m: any) => {
                            const moduleLessons = lessons.filter(
                                (l: any) => l.module_id === m.id
                            );

                            const studentId = user?.id;

                            const done = moduleLessons.filter((l: any) =>
                                studentId ? isDone(studentId, l.id) : false
                            ).length;

                            const pct = moduleLessons.length
                                ? Math.round((done / moduleLessons.length) * 100)
                                : 0;

                            return (
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
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography sx={{ fontWeight: 600 }}>
                                                    {m.name}
                                                </Typography>

                                                {isStudent && (
                                                    <Chip size="small" label={`${pct}%`} />
                                                )}

                                            </Box>

                                            {!isStudent && (
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {m.description}
                                                </Typography>
                                            )}

                                            {/* não aparece */}
                                            {isStudent && (
                                                <LinearProgress
                                                    value={pct}
                                                    variant="determinate"
                                                    sx={{ mt: 1, height: 6, borderRadius: 5 }}
                                                />
                                            )}
                                        </Box>
                                    </AccordionSummary>

                                    <AccordionDetails>
                                        {isStudent && (
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                {m.description}
                                            </Typography>
                                        )}
                                        {moduleLessons.map((l: any) => {
                                            const done = user?.id ? isDone(user.id, l.id) : false;

                                            return (
                                                <Box
                                                    key={l.id}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1.5,
                                                        p: 1,
                                                        borderRadius: 2,
                                                        cursor:"pointer",
                                                        "&:hover": { bgcolor: "#f5f5f5" },
                                                    }}
                                                    onClick={() => handleOpenLesson(l.id)}
                                                >
                                                    {isStudent ? (
                                                        done ? (
                                                            <CheckCircle sx={{ fontSize: 18, color: "green" }} />
                                                        ) : (
                                                            <Circle sx={{ fontSize: 18, color: "gray" }} />
                                                        )
                                                    ) : (
                                                        <PlayCircle sx={{ fontSize: 18, color: "#1976d2" }} />
                                                    )}

                                                    <Typography sx={{ fontSize: 14 }}>
                                                        {l.name}
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </Box>
                </Box>
            )}

            {/* aba: alunos */}
            {!isStudent && tabIndex === 1 && (
                <Card sx={{ mb: 3 }}>
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
                                {students.map((s: any) => {
                                    const data = getStudentData(s.id);

                                    return (
                                        <TableRow key={s.id}>
                                            <TableCell>{s.name}</TableCell>
                                            <TableCell>
                                                {data.completedLessons}/{lessons.length}
                                            </TableCell>
                                            <TableCell>{data.avg}</TableCell>
                                            <TableCell>
                                                <LinearProgress
                                                    value={data.percent}
                                                    variant="determinate"
                                                    sx={{ height: 6, borderRadius: 5 }}
                                                />
                                                <Typography variant="caption">
                                                    {data.percent}%
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {canCreateModule && disciplineId && (
                <CreateModuleModal
                    open={moduleModalOpen}
                    onClose={() => setModuleModalOpen(false)}
                    onSuccess={refresh}
                    disciplineId={disciplineId}
                    nextOrderIndex={nextOrderIndex}
                />
            )}

        </Box>
    );
}