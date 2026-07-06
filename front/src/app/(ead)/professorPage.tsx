"use client";

import Link from "next/link";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

import {
  ArrowRightAltOutlined,
  SchoolOutlined,
  GroupsOutlined,
  AssignmentOutlined,
  MenuBookOutlined,
} from "@mui/icons-material";

interface ProfessorPageProps {
  user: any;
  data: any;
}

export default function ProfessorPage({
  user,
  data,
}: ProfessorPageProps) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 12 }}>
        Início
      </Typography>

      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        Olá, Professor(a) {user?.nome}
      </Typography>

      <Typography
        sx={{
          mb: 4,
          color: "text.secondary",
        }}
      >
        Acompanhe suas disciplinas e atividades.
      </Typography>

      {/* Indicadores */}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            icon: <MenuBookOutlined />,
            label: "Disciplinas",
            value: data.subjects.length,
          },
          {
            icon: <GroupsOutlined />,
            label: "Turmas",
            value: 8,
          },
          {
            icon: <AssignmentOutlined />,
            label: "Correções Pendentes",
            value: 14,
          },
        ].map((item) => (
          <Grid
            key={item.label}
            size={{ xs: 12, md: 4 }}
          >
            <Card sx={{ borderRadius: 3 }}>
              <CardContent
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    bgcolor: "#E3F2FD",
                    p: 2,
                    borderRadius: 2,
                    color: "primary.main",
                  }}
                >
                  {item.icon}
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{fontWeight:700}}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Disciplinas */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{fontWeight:"bold"}}>
          Minhas Disciplinas
        </Typography>

        <Link href="/disciplinas">
          Ver todas
          <ArrowRightAltOutlined />
        </Link>
      </Box>

      <Grid container spacing={3}>
        {data.subjects.map((subject: any) => (
          <Grid
            key={subject.id}
            size={{ xs: 12, md: 4 }}
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
                  <Typography
                    sx={{fontWeight:700}}
                  >
                    {subject.nome}
                  </Typography>

                  <Chip
                    size="small"
                    label="Ativa"
                    color="success"
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {subject.descricao}
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Chip
                    label="35 alunos"
                    sx={{ mr: 1 }}
                  />

                  <Chip
                    label="12 módulos"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Atividades */}

      <Typography
        variant="h6"
        sx={{
          mt: 5,
          mb: 2,
          fontWeight: "bold",
        }}
      >
        Atividades Pendentes
      </Typography>

      <Card sx={{ borderRadius: 3 }}>
        <List>
          {[
            "Corrigir Trabalho de React",
            "Avaliar prova de Banco de Dados",
            "Responder dúvidas do Fórum",
            "Publicar notas da Avaliação 2",
          ].map((activity, index) => (
            <Box key={activity}>
              <ListItem>
                <ListItemText
                  primary={activity}
                  secondary="Pendente"
                />
              </ListItem>

              {index < 3 && <Divider />}
            </Box>
          ))}
        </List>
      </Card>

      {/* Próximas aulas */}

      <Typography
        variant="h6"
        sx={{
          mt: 5,
          mb: 2,
          fontWeight: "bold",
        }}
      >
        Próximas Aulas
      </Typography>

      <Grid container spacing={2}>
        {[
          {
            disciplina: "Programação Web",
            horario: "08:00",
          },
          {
            disciplina: "Banco de Dados",
            horario: "10:00",
          },
          {
            disciplina: "Engenharia de Software",
            horario: "14:00",
          },
        ].map((classroom) => (
          <Grid
            key={classroom.disciplina}
            size={{ xs: 12, md: 4 }}
          >
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <SchoolOutlined
                  color="primary"
                />

                <Typography
                 sx={{fontWeight:700, mt:1}}
                >
                  {classroom.disciplina}
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  {classroom.horario}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}