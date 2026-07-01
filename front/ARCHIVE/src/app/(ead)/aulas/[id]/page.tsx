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
  Stack,
} from "@mui/material";
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  PlayCircle,
  List as ListIcon,
  Description,
  Pause,
  PlayArrow,
  AttachFileOutlined,
  DescriptionOutlined,
  DownloadOutlined,
} from "@mui/icons-material";
import YouTube from "react-youtube";

import { Slider, IconButton } from "@mui/material";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import database from "@/components/mock.json";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/services/auth/AuthContext";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { effectiveRole } = useUser();
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

  const playerRef = useRef<any>(null);

  const [playing, setPlaying] = useState(false);

  const [progress, setProgress] = useState(0);

  const [duration, setDuration] = useState(0);

  const format = (value: number) => {
    const min = Math.floor(value / 60);

    const sec = Math.floor(value % 60);

    return `${min}:${String(sec).padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const current = playerRef.current.getCurrentTime();

        setProgress(current);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const onReady = (e: any) => {
    playerRef.current = e.target;

    setDuration(e.target.getDuration());
  };

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }

    setPlaying(!playing);
  };

  const seek = (_: any, value: any) => {
    playerRef.current?.seekTo(value);

    setProgress(value);
  };

  if (!lesson) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Aula não encontrada</Typography>
      </Box>
    );
  }

  // mdoulo
  const module = database.modules.find((m: any) => m.id === lesson.module_id);

  const discipline = database.disciplines.find(
    (d: any) => d.id === module?.discipline_id,
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

  const activities =
    database.quizzes?.filter((a: any) => a.module_id === lesson.module_id) ??
    [];

  const activeActivity = activityId
    ? activities.find((a: any) => a.id === activityId)
    : null;

  const goToLesson = (id: string) => {
    router.push(`/aulas/${id}`);
  };

  const openActivity = (id: string) => {
    router.push(`/aulas/${lessonId}?atividade=${id}`);
  };

  const lessonMaterials = useMemo(() => {
    const relations = database.lesson_materials ?? [];
    const materials = database.materials ?? [];

    return relations
      .filter((r: any) => r.lesson_id === lessonId)
      .map((r: any) => materials.find((m: any) => m.id === r.material_id))
      .filter(Boolean);
  }, [lessonId]);

  const quizQuestions = activeActivity
    ? (database.questions?.filter(
        (q: any) => q.quiz_id === activeActivity.id,
      ) ?? [])
    : [];

  const attempt =
    database.quiz_attempts?.find(
      (a: any) => a.quiz_id === activeActivity?.id,
    ) ?? null;

  const approved = attempt?.status === "FINISHED" && attempt?.is_approved;

  const answers =
    database.student_answers?.filter(
      (a: any) => a.quiz_attempt_id === attempt?.id,
    ) ?? [];

  const getAlternatives = (questionId: string) =>
    database.alternatives?.filter((a: any) => a.question_id === questionId) ??
    [];

  const selectedAlternative = (questionId: string) =>
    answers.find((a: any) => a.question_id === questionId)?.alternative_id;

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="h6">{lesson.name}</Typography>

          <Typography variant="body2" color="text.secondary">
            {module?.name} • {discipline?.name}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2">{lesson.description}</Typography>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "2fr 380px",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              {!activeActivity ? (
                <>
                  <Typography sx={{ fontWeight: 600, mb: 2 }}>
                    Aula em vídeo
                  </Typography>

                  {videoId && (
                    <Card
                      sx={{
                        overflow: "hidden",
                        bgcolor: "#111",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "16 / 9",
                          bgcolor: "#000",

                          "& iframe": {
                            position: "absolute",
                            inset: 0,
                            width: "100% !important",
                            height: "100% !important",
                            border: 0,
                          },
                        }}
                      >
                        <YouTube
                          videoId={videoId}
                          onReady={onReady}
                          opts={{
                            playerVars: {
                              controls: 0,
                              modestbranding: 1,
                              rel: 0,
                            },
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          px: 3,
                          py: 2,
                          bgcolor: "#fff",
                        }}
                      >
                        <Slider
                          value={progress}
                          max={duration}
                          onChange={seek}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <IconButton onClick={togglePlay}>
                            {playing ? <Pause /> : <PlayArrow />}
                          </IconButton>

                          <Typography variant="caption">
                            {format(progress)} / {format(duration)}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  )}
                </>
              ) : (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {activeActivity.name}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {activeActivity.description}
                  </Typography>

                  <Stack spacing={3}>
                    {quizQuestions.map((question: any, index) => {
                      const alternatives = getAlternatives(question.id);

                      return (
                        <Card
                          key={question.id}
                          variant="outlined"
                          sx={{
                            borderRadius: 3,
                          }}
                        >
                          <CardContent>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                mb: 2,
                              }}
                            >
                              {index + 1}. {question.question}
                            </Typography>

                            <RadioGroup
                              value={selectedAlternative(question.id) ?? ""}
                            >
                              <Stack spacing={1}>
                                {alternatives.map((alt: any) => {
                                  const selected =
                                    selectedAlternative(question.id) === alt.id;

                                  const isWrong = selected && !alt.is_correct;
                                  const isRight = selected && alt.is_correct;

                                  const professorCorrect =
                                    effectiveRole === "PROFESSOR" &&
                                    alt.is_correct;

                                  return (
                                    <Box
                                      key={alt.id}
                                      sx={{
                                        px:2,
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: isWrong
                                          ? "#ef5350"
                                          : isRight || professorCorrect
                                            ? "#43a047"
                                            : "#eee",

                                        bgcolor: isWrong
                                          ? "#ffebee"
                                          : isRight || professorCorrect
                                            ? "#e8f5e9"
                                            : "#fff",

                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <FormControlLabel
                                        value={alt.id}
                                        control={<Radio disabled />}
                                        label={
                                          <Typography
                                            sx={{ userSelect: "none" }}
                                          >
                                            {alt.description}
                                          </Typography>
                                        }
                                      />
                                    </Box>
                                  );
                                })}
                              </Stack>
                            </RadioGroup>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {attempt && (
                      <Card
                        sx={{
                          borderRadius: 3,
                          bgcolor: approved ? "#f1f8e9" : "#fff3e0",
                        }}
                      >
                        <CardContent>
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            Nota: {attempt.score}
                          </Typography>

                          <Typography>
                            Resultado: {approved ? "Aprovado" : "Reprovado"}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
          {!activeActivity && (
            <Card
              sx={{
                borderRadius: 4,
                my: 3,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 3,
                  }}
                >
                  <AttachFileOutlined
                    sx={{
                      rotate: "45deg",
                    }}
                  />

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    Material da aula
                  </Typography>

                  <Chip size="small" label={lessonMaterials.length} />
                </Box>

                {lessonMaterials.length === 0 ? (
                  <Box
                    sx={{
                      py: 4,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    Nenhum material disponível.
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {lessonMaterials.map((material: any) => (
                      <Card
                        key={material.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          transition: ".2s",

                          "&:hover": {
                            borderColor: "#2e507d",
                            bgcolor: "#fafafa",
                          },
                        }}
                      >
                        <Button
                          fullWidth
                          href={material.url ?? "#"}
                          target="_blank"
                          sx={{
                            p: 2,
                            color: "inherit",

                            display: "flex",
                            justifyContent: "space-between",

                            alignItems: "center",

                            textTransform: "none",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                width: 42,
                                height: 42,

                                borderRadius: 2,

                                bgcolor: "#e8f0f5",

                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <DescriptionOutlined
                                sx={{
                                  color: "#2e507d",
                                }}
                              />
                            </Box>

                            <Box
                              sx={{
                                textAlign: "left",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                }}
                              >
                                {material.title}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {material.description}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#2e507d",
                                }}
                              >
                                {material.type}
                              </Typography>
                            </Box>
                          </Box>

                          <DownloadOutlined />
                        </Button>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}

          {/* NAVIGATION */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            {prev ? (
              <Button
                onClick={() => goToLesson(prev.id)}
                startIcon={<ArrowBack />}
              >
                Anterior
              </Button>
            ) : (
              <Box />
            )}

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
          <Card
            sx={{
              mb: 2,
              borderRadius: 2,
              top: 24,
            }}
          >
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
            <Card sx={{ borderRadius: 2 }}>
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
