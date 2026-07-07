"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import {
  LayersOutlined,
  ExpandMore,
  CheckCircle,
  Circle,
} from "@mui/icons-material";

interface Props {
  data: any;
  user: any;
}

export default function StudentDisciplineDetailsPage({ data }: Props) {
  const { discipline, modules, students } = data;

  const student = students[0];

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#e3f2fd",
              }}
            >
              <LayersOutlined color="primary" />
            </Box>

            <Box>
              <Typography sx={{fontWeight:700}}>{discipline.nome}</Typography>

              <Typography color="text.secondary">
                {discipline.descricao}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="caption">Progresso</Typography>

            <LinearProgress
              value={student?.percentage ?? 0}
              variant="determinate"
              sx={{
                height: 8,
                borderRadius: 5,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Typography sx={{fontWeight:700, mb:2}}>
        Conteúdo
      </Typography>

      {modules.map((module: any) => (
        <Accordion key={module.id}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{fontWeight:600}}>{module.nome}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            {module.lessons?.map((lesson: any) => (
              <Box
                key={lesson.id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 1,
                  cursor: "pointer",
                }}
              >
                {lesson.completed ? (
                  <CheckCircle color="success" />
                ) : (
                  <Circle color="disabled" />
                )}

                <Typography>{lesson.titulo}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
