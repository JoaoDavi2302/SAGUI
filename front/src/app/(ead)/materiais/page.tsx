"use client";

import { useMemo, useState } from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  Stack,
  Button,
} from "@mui/material";

import {
  DescriptionOutlined,
  InsertDriveFileOutlined,
  OpenInNew,
  DownloadOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "@/components/components";

import { useCatalogDatabase } from "@/services/auth/dataContext";
import { useUser } from "@/services/auth/AuthContext";

export default function MateriaisPage() {
  const { user, effectiveRole } = useUser();
  const { database } = useCatalogDatabase();

  const [search, setSearch] = useState("");
  // chip
  // const [selectedModule, setSelectedModule] = useState<string>("all");

  const data = useMemo(() => {
    const disciplines = database.disciplines ?? [];
    const modules = database.modules ?? [];
    const lessons = database.lessons ?? [];
    const materials = database.materials ?? [];
    const lessonMaterials = database.lesson_materials ?? [];

    let allowedDisciplines = disciplines;

    if (effectiveRole === "ALUNO") {
      const enrollment = database.enrollments.find(
        (e: any) => e.student_id === user?.id,
      );

      allowedDisciplines = disciplines.filter(
        (d: any) => d.course_id === enrollment?.course_id,
      );
    }

    if (effectiveRole === "PROFESSOR") {
      allowedDisciplines = disciplines.filter(
        (d: any) => d.professor_id === user?.id,
      );
    }

    const disciplineIds = allowedDisciplines.map((d: any) => d.id);

    const availableModules = modules.filter((m: any) =>
      disciplineIds.includes(m.discipline_id),
    );

    const moduleIds = availableModules.map((m: any) => m.id);

    const availableLessons = lessons.filter((l: any) =>
      moduleIds.includes(l.module_id),
    );

    const grouped = allowedDisciplines
      .map((discipline: any) => {
        const disciplineModules = availableModules.filter(
          (m: any) => m.discipline_id === discipline.id,
        );

        const modules = disciplineModules
          .map((module: any) => {
            const moduleLessons = availableLessons.filter(
              (l: any) => l.module_id === module.id,
            );

            const materialsList = lessonMaterials
              .filter((lm: any) =>
                moduleLessons.some((l: any) => l.id === lm.lesson_id),
              )
              .map((lm: any) => {
                const lesson = moduleLessons.find(
                  (l: any) => l.id === lm.lesson_id,
                );

                const material = materials.find(
                  (m: any) => m.id === lm.material_id,
                );

                if (!material) return null;

                return {
                  ...material,
                  lesson,
                };
              })
              .filter(Boolean);

            return {
              module,
              materials: materialsList,
            };
          })
          .filter((m: any) => m.materials.length);

        return {
          discipline,
          modules,
        };
      })
      .filter((d: any) => d.modules.length);

    return grouped;
  }, [user, effectiveRole]);

  const filtered = data
    .map((discipline) => ({
      ...discipline,

      modules: discipline.modules
        .map((group: any) => ({
          ...group,

          materials: group.materials.filter((m: any) => {
            const text = [
              discipline.discipline?.name,
              group.module?.name,
              m.title,
              m.description,
              m.lesson?.name,
            ]
              .join(" ")
              .toLowerCase();

            return text.includes(search.toLowerCase());
          }),
        }))
        .filter((m: any) => m.materials.length),
    }))
    .filter((d: any) => d.modules.length);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        sx={{
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        Materiais
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Materiais complementares disponíveis nas aulas.
      </Typography>

      {/* barra de pesquisa e atalho de materia */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Search style={{ border: "1px solid gray", width: "100%" }}>
          <SearchIconWrapper>
            <SearchOutlined sx={{ color: "gray" }} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputProps={{ "aria-label": "search" }}
          />
        </Search>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* ficou feio */}
          {/* <Chip
            label="Todos"
            clickable
            color={selectedModule === "all" ? "success" : "default"}
            onClick={() => setSelectedModule("all")}
          />

          {modules.map((g) => (
            <Chip
              key={g.module.id}
              label={g.module.name}
              clickable
              color={selectedModule === g.module.id ? "success" : "default"}
              onClick={() => setSelectedModule(g.module.id)}
            />
          ))} */}
        </Box>
      </Stack>

      {/* materiais */}
      {filtered.map((discipline: any) => (
        <Box key={discipline.discipline.id} sx={{ mb: 6 }}>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 700,
              mb: 3,
            }}
          >
            {discipline.discipline.name}
          </Typography>

          {discipline.modules.map((group: any) => (
            <Stack key={group.module.id} sx={{ mb: 5 }}>
              <Typography
                sx={{
                  mb: 2,
                  fontSize: 16,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {group.module.name}

                <Chip size="small" label={group.materials.length} />
              </Typography>

              <Grid container spacing={2}>
                {group.materials.map((material: any) => (
                  <Grid
                    key={material.id}
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
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: "#e8f5e9",
                              borderRadius: 2,
                            }}
                          >
                            <DescriptionOutlined />
                          </Box>

                          <Box
                            sx={{
                              flex: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 600,
                              }}
                            >
                              {material.title}
                            </Typography>

                            <Typography variant="caption">
                              {material.lesson?.name}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {material.description}
                            </Typography>
                          </Box>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            mt: 2,
                          }}
                        >
                          <Button
                            fullWidth
                            startIcon={<OpenInNew />}
                            variant="outlined"
                            href={material.url ?? "#"}
                          >
                            Abrir
                          </Button>

                          <Button>
                            <DownloadOutlined />
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          ))}
        </Box>
      ))}
    </Box>
  );
}
