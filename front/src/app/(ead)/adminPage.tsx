"use client";

import Link from "next/link";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import {
  ArrowRightAltOutlined,
  SchoolOutlined,
  PeopleOutlined,
  PersonOutlineOutlined,
  AdminPanelSettingsOutlined,
  TimelineOutlined,
} from "@mui/icons-material";

interface AdminPageProps {
  user: any;
  data: any;
}

export default function AdminPage({
  user,
  data,
}: AdminPageProps) {
  const totalCourses = data.courses?.length ?? 0;
  const totalSubjects = data.subjects?.length ?? 0;
  const totalUsers = data.users?.length ?? 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 12 }}>
        Painel Administrativo
      </Typography>

      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        Olá, {user?.nome}
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 4,
        }}
      >
        Gerencie usuários, cursos e acompanhe os indicadores da plataforma.
      </Typography>

      {/* Indicadores */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          {
            label: "Usuários",
            value: totalUsers,
            icon: <PeopleOutlined />,
          },
          {
            label: "Cursos",
            value: totalCourses,
            icon: <SchoolOutlined />,
          },
          {
            label: "Disciplinas",
            value: totalSubjects,
            icon: <TimelineOutlined />,
          },
          {
            label: "Administradores",
            value: 3,
            icon: <AdminPanelSettingsOutlined />,
          },
        ].map((item) => (
          <Grid
            key={item.label}
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {item.icon}

                  <Typography
                    variant="h4"
                    sx={{fontWeight:700}}
                  >
                    {item.value}
                  </Typography>
                </Box>

                <Typography
                  sx={{ mt: 2 }}
                  color="text.secondary"
                >
                  {item.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Cursos */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{fontWeight:"bold"}}
        >
          Cursos Cadastrados
        </Typography>

        <Link href="/cursos">
          Ver todos
          <ArrowRightAltOutlined />
        </Link>
      </Box>

      <Grid container spacing={3}>
        {data.courses.map((course: any) => (
          <Grid
            key={course.id}
            size={{ xs: 12, md: 4 }}
          >
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
              }}
            >
              <CardContent>
                <Typography
                  sx={{fontWeight:700}}
                >
                  {course.nome}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {course.descricao}
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Chip
                    label="Ativo"
                    color="success"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Últimos usuários */}
      <Typography
        variant="h6"
        sx={{
          mt: 5,
          mb: 2,
          fontWeight: "bold",
        }}
      >
        Últimos Usuários
      </Typography>

      <Card sx={{ borderRadius: 3 }}>
        <List>
          {(data.users ?? [])
            .slice(0, 5)
            .map((user: any, index: number) => (
              <Box key={user.id}>
                <ListItem>
                  <PersonOutlineOutlined
                    sx={{ mr: 2 }}
                  />

                  <ListItemText
                    primary={user.nome}
                    secondary={user.email}
                  />

                  <Chip
                    label={user.role}
                    size="small"
                  />
                </ListItem>

                {index < 4 && <Divider />}
              </Box>
            ))}
        </List>
      </Card>

      {/* Status */}

      <Typography
        variant="h6"
        sx={{
          mt: 5,
          mb: 2,
          fontWeight: "bold",
        }}
      >
        Status da Plataforma
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography sx={{fontWeight:700}}>
                Sistema
              </Typography>

              <Typography
                color="success.main"
                sx={{ mt: 1 }}
              >
                ● Operando normalmente
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography sx={{fontWeight:700}}>
                Último Backup
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Hoje às 03:00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}