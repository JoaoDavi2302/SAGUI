"use client";

import Link from "next/link";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  MenuBookOutlined,
  GroupsOutlined,
  LayersOutlined,
  ArrowForwardOutlined,
} from "@mui/icons-material";

interface ProfessorDisciplinesPageProps {
  user: any;
  data: any;
}

export default function ProfessorDisciplinesPage({
  user,
  data,
}: ProfessorDisciplinesPageProps) {
  const disciplines = data.disciplines ?? [];

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
          mb: 4,
        }}
      >
        Gerencie as disciplinas que você leciona.
      </Typography>

      <Grid container spacing={3}>
        {disciplines.map((discipline: any) => (
          <Grid key={discipline.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                  {discipline.nome}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {discipline.descricao}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 3, flexWrap: "wrap" }}
                >
                  <Chip
                    icon={<MenuBookOutlined />}
                    label={discipline.courseName}
                    size="small"
                  />

                  <Chip
                    icon={<LayersOutlined />}
                    label={`${discipline.modules.length} módulos`}
                    size="small"
                  />

                  <Chip
                    icon={<GroupsOutlined />}
                    label={`${discipline.studentsCount} alunos`}
                    size="small"
                  />
                </Stack>
              </CardContent>

              <Box
                sx={{
                  p: 2,
                  pt: 0,
                }}
              >
                <Button
                  component={Link}
                  href={`/disciplinas/${discipline.slug}?id=${discipline.id}`}
                  variant="contained"
                  endIcon={<ArrowForwardOutlined />}
                  fullWidth
                >
                  Gerenciar Disciplina
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}

        {disciplines.length === 0 && (
          <Grid size={12}>
            <Typography
              sx={{
                align: "center",
                color: "text.secondary",
              }}
            >
              Você ainda não possui disciplinas atribuídas.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
