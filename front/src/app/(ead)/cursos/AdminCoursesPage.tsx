"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
} from "@mui/material";

import { Add, Edit, SchoolOutlined } from "@mui/icons-material";

import { useEffect, useState } from "react";

import {
  listCourses,
  type CourseDTO,
} from "@/new-services/poo/shared/api/catalog";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);

  async function load() {
    setCourses(await listCourses());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box>
          <Typography sx={{fontWeight:700, fontSize:24}}>
            Cursos
          </Typography>

          <Typography color="text.secondary">
            Gerencie todos os cursos cadastrados.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<Add />}>
          Novo curso
        </Button>
      </Box>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid
            key={course.id}
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Box
                sx={{
                  height: 120,
                  bgcolor: "#f5f5f5",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <SchoolOutlined
                  sx={{
                    fontSize: 45,
                    color: "grey",
                  }}
                />
              </Box>

              <CardContent>
                <Typography sx={{fontWeight:700}}>{course.name}</Typography>

                <Typography color="text.secondary" sx={{mt:1}}>
                  {course.description ?? "Sem descrição"}
                </Typography>

                <Chip
                  sx={{ mt: 2 }}
                  label={course.status}
                  color={course.status === "Active" ? "success" : "default"}
                />

                <Button
                  sx={{ mt: 2 }}
                  fullWidth
                  variant="outlined"
                  startIcon={<Edit />}
                >
                  Editar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
