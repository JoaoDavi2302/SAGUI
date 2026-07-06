"use client";

import Link from "next/link";

import {
  AddOutlined,
  ArrowForwardOutlined,
  GroupsOutlined,
  LayersOutlined,
  MenuBookOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";

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
import { useRouter } from "next/router";

interface AdminDisciplinesPageProps {
  user: any;
  data: any;
}

export default function AdminDisciplinesPage({
  user,
  data,
}: AdminDisciplinesPageProps) {
  const disciplines = data.disciplines ?? [];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            Disciplinas
          </Typography>

          <Typography color="text.secondary">
            Gerencie todas as disciplinas cadastradas na plataforma.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {disciplines.map((discipline: any) => (
          <Grid key={discipline.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card component={Button}
              href={`/disciplinas/${discipline.nome}?id=${discipline.id}`}
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
                    icon={<PersonOutlineOutlined />}
                    label={discipline.professorName}
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
            </Card>
          </Grid>
        ))}

        {disciplines.length === 0 && (
          <Grid size={12}>
            <Typography align="center" color="text.secondary">
              Nenhuma disciplina cadastrada.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
