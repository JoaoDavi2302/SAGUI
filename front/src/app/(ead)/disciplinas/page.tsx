"use client";

import { useMemo } from "react";
import { Box, Typography, Card, CardContent, Grid, Divider } from "@mui/material";

import { useUser } from "@/services/AuthContext";
import database from "@/components/mock.json";

export default function DisciplinasPage() {
  const { user, effectiveRole } = useUser();

  const data = useMemo(() => {
    if (!user) {
      return { grouped: [] };
    }

    const courses = database.courses;
    const disciplines = database.disciplines;

    // visão do aluno
    if (effectiveRole === "ALUNO") {
      const enrollment = database.enrollments.find(
        (e: any) => e.student_id === user.id
      );

      if (!enrollment) {
        console.warn("Aluno sem matrícula");
        return { grouped: [] };
      }

      const course = courses.find(
        (c: any) => c.id === enrollment.course_id
      );

      const subjects = disciplines.filter(
        (d: any) => d.course_id === enrollment.course_id
      );

      return {
        grouped: [
          {
            course,
            subjects,
          },
        ],
      };
    }

    // visão do professor
    if (effectiveRole === "PROFESSOR") {
      const professorDisciplines = disciplines.filter(
        (d: any) => d.professor_id === user.id
      );

      const map = new Map<string, any>();

      professorDisciplines.forEach((d: any) => {
        const course = courses.find((c: any) => c.id === d.course_id);

        if (!course) return;

        if (!map.has(course.id)) {
          map.set(course.id, {
            course,
            subjects: [],
          });
        }

        map.get(course.id).subjects.push(d);
      });

      return {
        grouped: Array.from(map.values()),
      };
    }

    return { grouped: [] };
  }, [user, effectiveRole]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: "bold", fontFamily:"system-ui" }}>
       Minhas Disciplinas
      </Typography>

      <Typography sx={{ fontSize: 14, color: "gray", mb: 3 }}>
        {effectiveRole === "PROFESSOR"
          ? "Disciplinas que você leciona"
          : "Disciplinas do seu curso"}
      </Typography>

      {data.grouped.map((group: any) => (
        <Box key={group.course.id} sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: "16px", color: "gray", fontFamily: "system-ui", fontWeight: 200 }}>
            {group.course.name}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {group.subjects.map((subject: any) => (
              // criar como button link para /disciplinas/:name
              < Grid size={{ xs: 12, md: 4 }} key={subject.id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: "bold" }}>
                      {subject.name}
                    </Typography>

                    <Typography sx={{ fontSize: 13, color: "gray" }}>
                      {subject.teaching_area}
                    </Typography>

                    <Typography sx={{ fontSize: 14, mt: 1 }}>
                      {subject.workload} hrs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))
      }
    </Box >
  );
}