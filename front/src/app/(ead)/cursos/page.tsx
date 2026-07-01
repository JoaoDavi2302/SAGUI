"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { useCatalogDatabase } from "@/services/auth/dataContext";

export default function Cursos() {
  const { database, loading, error } = useCatalogDatabase();

  const courses = database.courses ?? [];

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Cursos
        </Typography>
        <Typography sx={{ fontSize: 14, color: "gray" }}>
          Cursos disponíveis para visualização
        </Typography>
      </Box>

      {courses.length === 0 ? (
        <Alert severity="info">Nenhum curso cadastrado.</Alert>
      ) : (
        <Grid container spacing={2}>
          {courses.map((course) => (
            <Grid size={{ xs: 12, md: 6 }} key={course.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    {course.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.area || "Sem descrição"}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${database.disciplines.filter((d) => d.course_id === course.id).length} disciplinas`}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
