"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
  Button,
} from "@mui/material";

import { SchoolOutlined } from "@mui/icons-material";

interface StudentDisciplinesPageProps {
  user: any;
  data: any;
}

export default function StudentDisciplinesPage({
  user,
  data,
}: StudentDisciplinesPageProps) {
  const [tab, setTab] = useState(0);

  const enrolled = data.enrolledSubjects ?? [];
  const available = data.availableSubjects ?? [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        Minhas Disciplinas
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 3,
        }}
      >
        Gerencie suas disciplinas e descubra novas opções.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ mb: 3 }}
      >
        <Tab
          label={`Matriculado (${enrolled.length})`}
        />

        <Tab
          label={`Disponíveis (${available.length})`}
        />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          {enrolled.map((subject: any) => (
            <Grid
              key={subject.id}
              size={{ xs: 12, md: 6, lg: 4 }}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <SchoolOutlined color="primary" />

                    <Chip
                      label={`${subject.modules.length} módulos`}
                      size="small"
                    />
                  </Box>

                  <Typography
                    sx={{fontWeight:700}}
                    gutterBottom
                  >
                    {subject.nome}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {subject.descricao}
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: .5,
                      }}
                    >
                      <Typography variant="caption">
                        Progresso
                      </Typography>

                      <Typography variant="caption">
                        {subject.progress.percentage}%
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={subject.progress.percentage}
                    />
                  </Box>

                  <Button
                    component={Link}
                    href={`/disciplinas/${subject.slug}?id=${subject.id}`}
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}
                  >
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {enrolled.length === 0 && (
            <Grid size={12}>
              <Typography
                color="text.secondary"
                align="center"
              >
                Você ainda não está matriculado em nenhuma disciplina.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          {available.map((subject: any) => (
            <Grid
              key={subject.id}
              size={{ xs: 12, md: 6, lg: 4 }}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <SchoolOutlined color="primary" />

                    <Chip
                      label={`${subject.modules.length} módulos`}
                      size="small"
                    />
                  </Box>

                  <Typography
                    sx={{fontWeight:700}}
                    gutterBottom
                  >
                    {subject.nome}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {subject.descricao}
                  </Typography>

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 3 }}
                  >
                    Matricular-se
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {available.length === 0 && (
            <Grid size={12}>
              <Typography
                color="text.secondary"
                sx={{align:"center"}}
              >
                Não há novas disciplinas disponíveis para matrícula.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}