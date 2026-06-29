"use client";

import {
    Box,
    Typography,
    Card,
    CardContent,
    Divider,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Chip,
} from "@mui/material";

import {
    ArrowBack,
    ArrowForward,
    PlayCircle,
    List as ListIcon,
    Description,
} from "@mui/icons-material";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import database from "@/components/mock.json";
import { useMemo } from "react";

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const lessonId = params.id as string;
    const activityId = searchParams.get("atividade");

    const getYouTubeId = (text?: string) => {
        if (!text) return null;

        const urlMatch = text.match(/https?:\/\/[^\s]+/);
        const url = urlMatch?.[0];

        if (!url) return null;

        const match = url.match(/v=([^&]+)/);
        return match ? match[1] : null;
    };


    // aulas
    const lesson = database.lessons.find((l: any) => l.id === lessonId);

    const videoId = getYouTubeId(lesson?.content);

    if (!lesson) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Aula não encontrada</Typography>
            </Box>
        );
    }

    // mdoulo
    const module = database.modules.find(
        (m: any) => m.id === lesson.module_id
    );

    const discipline = database.disciplines.find(
        (d: any) => d.id === module?.discipline_id
    );

    // aulas do modulo
    const siblings = useMemo(() => {
        return database.lessons
            .filter((l: any) => l.module_id === lesson.module_id)
            .sort((a: any, b: any) => a.order_index - b.order_index);
    }, [lesson.module_id]);

    const currentIndex = siblings.findIndex((l: any) => l.id === lessonId);
    const prev = siblings[currentIndex - 1];
    const next = siblings[currentIndex + 1];

    const activities = database.quizzes?.filter(
        (a: any) => a.module_id === lesson.module_id
    ) ?? [];

    const activeActivity = activityId
        ? activities.find((a: any) => a.id === activityId)
        : null;

    const goToLesson = (id: string) => {
        router.push(`/aulas/${id}`);
    };

    const openActivity = (id: string) => {
        router.push(`/aulas/${lessonId}?atividade=${id}`);
    };

    return (
        <Box sx={{ p: 3 }}>

            {/* HEADER */}
            <Card sx={{ mb: 3 }}>
                <CardContent>

                    <Typography variant="h6">
                        {lesson.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {module?.name} • {discipline?.name}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2">
                        {lesson.description}
                    </Typography>

                </CardContent>
            </Card>

            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 3 }}>

                <Box>
                    <Card>
                        <CardContent>

                            {!activeActivity ? (
                                <>
                                    <Typography sx={{ fontWeight: 600, mb: 2 }}>
                                        Aula em vídeo
                                    </Typography>

                                    {videoId && (
                                        <Box
                                            sx={{
                                                position: "relative",
                                                width: "100%",
                                                height: 320,
                                                bgcolor: "#000",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </Box>
                                    )}

                                </>
                            ) : (
                                <>
                                    <Typography sx={{ fontWeight: 600, mb: 2 }}>
                                        {activeActivity.name}
                                    </Typography>

                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        {activeActivity.description}
                                    </Typography>

                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: "#fff3e0",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Typography>
                                            Activity runner aqui (quiz / exercício)
                                        </Typography>
                                    </Box>
                                </>
                            )}

                        </CardContent>
                    </Card>

                    {/* NAVIGATION */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                        {prev ? (
                            <Button
                                onClick={() => goToLesson(prev.id)}
                                startIcon={<ArrowBack />}
                            >
                                Anterior
                            </Button>
                        ) : <Box />}

                        {next && (
                            <Button
                                onClick={() => goToLesson(next.id)}
                                endIcon={<ArrowForward />}
                            >
                                Próxima
                            </Button>
                        )}
                    </Box>

                </Box>

                {/* sidebar */}
                <Box>

                    {/* LESSONS */}
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography sx={{ fontWeight: 600, mb: 2 }}>
                                <ListIcon fontSize="small" /> Aulas
                            </Typography>

                            <List dense>
                                {siblings.map((l: any) => (
                                    <ListItem key={l.id} disablePadding>
                                        <ListItemButton
                                            selected={l.id === lessonId}
                                            onClick={() => goToLesson(l.id)}
                                        >
                                            <PlayCircle sx={{ mr: 1, fontSize: 18 }} />
                                            <ListItemText primary={l.name} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>

                    {/* ACTIVITIES */}
                    {activities.length > 0 && (
                        <Card>
                            <CardContent>
                                <Typography sx={{ fontWeight: 600, mb: 2 }}>
                                    Atividades
                                </Typography>

                                <List dense>
                                    {activities.map((a: any) => (
                                        <ListItem key={a.id} disablePadding>
                                            <ListItemButton
                                                selected={a.id === activityId}
                                                onClick={() => openActivity(a.id)}
                                            >
                                                <Description sx={{ mr: 1, fontSize: 18 }} />
                                                <ListItemText primary={a.name} />
                                                {a.id === activityId && (
                                                    <Chip size="small" label="ativa" />
                                                )}
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    )}

                </Box>

            </Box>
        </Box>
    );
}