"use client";

import { useMemo } from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";

import { useUser } from "@/services/AuthContext";
import database from "@/components/mock.json";
import { DashboardProvider } from "@/services/dashboardProvider";
import { SchoolOutlined } from "@mui/icons-material";
import Link from "next/link";

export default function Home() {
  const { user, effectiveRole } = useUser();

  const dashboard = useMemo(() => {
    return DashboardProvider.create(
      effectiveRole,
      user,
      database
    );
  }, [effectiveRole, user]);

  const data = dashboard.getData();

  return (
    <Box sx={{ p: 3 }}>

      <Typography sx={{ fontFamily: "system-ui", fontSize: "12px" }}>Inicio</Typography>
      <Typography sx={{ fontFamily: "system-ui", fontWeight: "bold", fontSize: "24px" }}>Olá, {user?.name}</Typography>

      <Typography sx={{ mb: 3, fontFamily: "system-ui", fontSize: "14px", color: "gray" }}>
        Continue de onde parou ou descubra novos cursos.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {data.stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                borderRadius: 2.5,
                boxShadow: "none",
                border: "0.5px solid #c4c4c4",
                height: "80px",
              }}>
              <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {/* criar um icone de cada */}
                <Box sx={{ bgcolor: "#add3f8", p: 1, borderRadius: 2 }}>
                  <SchoolOutlined sx={{ color: "#1976d2" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#556255", fontFamily: "system-ui" }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", fontFamily: "system-ui" }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Meus Cursos
        </Typography>
        {/* adicionar icone arrow */}
        <Link href={"/cursos"} style={{ color: "#1976d2" }}>Ver todos</Link>

      </Box>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {data.courses.map((course: any) => (
          <Grid size={{ xs: 12, md: 6 }} key={course.id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {course.name}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Área: {course.area}
                </Typography>

                <Typography variant="body2">
                  Carga horária: {course.workload}h
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Minhas Disciplinas
        </Typography>
        {/* adicionar icone arrow */}
        <Link href={"/disciplinas"} style={{ color: "#1976d2" }}>Ver todos</Link>
      </Box>

      <Grid container spacing={2}>
        {data.subjects.slice(0, 6).map((subject: any) => (
          <Grid size={{ xs: 12, md: 4 }} key={subject.id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {subject.name}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {subject.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}