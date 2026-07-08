"use client";

import { Box, Typography, Card, CardContent, Grid } from "@mui/material";

import { useEffect, useState } from "react";

import {
  listCourses,
  listDisciplines,
  type CourseDTO,
} from "@/new-services/poo/shared/api/catalog";

import { useUser } from "@/new-services/auth/AuthContext";

export default function ProfessorCoursesPage() {
  const { user } = useUser();

  const [courses, setCourses] = useState<CourseDTO[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;

      const [courses, disciplines] = await Promise.all([
        listCourses(),
        listDisciplines(),
      ]);

      const ids = disciplines
        .filter((d) => d.responsibleProfessorId === user.id)
        .map((d) => d.courseId);

      setCourses(courses.filter((c) => ids.includes(c.id)));
    }

    load();
  }, [user]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{fontSize:24, fontWeight:700}}>
        Cursos que ministro
      </Typography>

      <Grid container spacing={3} sx={{mt:2}}>
        {courses.map((course) => (
          <Grid key={course.id} size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography sx={{fontWeight:700}}>{course.name}</Typography>

                <Typography color="text.secondary">
                  {course.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
