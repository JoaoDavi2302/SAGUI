"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  SchoolOutlined,
  PersonOutlined,
  MenuBookOutlined,
  DashboardOutlined,
} from "@mui/icons-material";

import { useUser } from "@/new-services/auth/AuthContext";

export default function AdminPage() {
  const { user } = useUser();

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 12 }}>
        Início
      </Typography>

      <Typography
        sx={{
          fontSize: 26,
          fontWeight: 700,
        }}
      >
        Olá, {user?.name}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Bem-vindo ao painel administrativo do SAGUI.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <SchoolOutlined />
              <Typography variant="h4">
                --
              </Typography>
              <Typography>
                Cursos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <MenuBookOutlined />
              <Typography variant="h4">
                --
              </Typography>
              <Typography>
                Disciplinas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <PersonOutlined />
              <Typography variant="h4">
                --
              </Typography>
              <Typography>
                Usuários
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <DashboardOutlined />
              <Typography variant="h4">
                Administração
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2 }}
        >
          Ações rápidas
        </Typography>

        <Stack direction="row" spacing={2} sx={{flexWrap:"wrap"}}>
          <Button
            component={Link}
            href="/dashboard"
            variant="contained"
          >
            Dashboard
          </Button>

          <Button
            component={Link}
            href="/dashboard/cursos"
            variant="outlined"
          >
            Cursos
          </Button>

          <Button
            component={Link}
            href="/dashboard/disciplinas"
            variant="outlined"
          >
            Disciplinas
          </Button>

          <Button
            component={Link}
            href="/dashboard/usuarios"
            variant="outlined"
          >
            Usuários
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}