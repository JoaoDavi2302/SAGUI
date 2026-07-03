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

import { DatabaseProvider } from "@/services/poo/databaseProvider";
import { MaterialProvider } from "@/services/poo/material/materialProvider";
import { useUser } from "@/services/auth/AuthContext";

const database = DatabaseProvider.getDatabase();


export default function MateriaisPage() {
  const { user, effectiveRole } = useUser();

  const [search, setSearch] = useState("");
  // chip não usado
  // const [selectedModule, setSelectedModule] = useState<string>("all");

  const data = useMemo(() => {
    if (!user) return [];

    const materialService = MaterialProvider.create(
      effectiveRole,
      database,
      user,
    );

    return materialService.listMaterials();
  }, [user, effectiveRole]);

  const filtered = useMemo(() => {
    const materials = data.filter((material: any) => {
      const text = [
        material.courseName,
        material.disciplineName,
        material.moduleName,
        material.lessonName,
        material.title,
        material.description,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(search.toLowerCase());
    });

    const grouped = materials.reduce((acc: any[], material: any) => {
      let discipline = acc.find(
        (d) => d.discipline.id === material.disciplineId,
      );

      if (!discipline) {
        discipline = {
          discipline: {
            id: material.disciplineId,
            name: material.disciplineName,
            courseId: material.courseId,
            courseName: material.courseName,
          },
          modules: [],
        };

        acc.push(discipline);
      }

      let module = discipline.modules.find(
        (m: any) => m.module.id === material.moduleId,
      );

      if (!module) {
        module = {
          module: {
            id: material.moduleId,
            name: material.moduleName,
          },
          materials: [],
        };

        discipline.modules.push(module);
      }

      module.materials.push({
        ...material,
        lesson: {
          id: material.lessonId,
          name: material.lessonName,
        },
      });

      return acc;
    }, []);

    return grouped;
  }, [data, search]);

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
              <Box sx={{display:"flex", flex:1, gap:2}}>
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
                </Typography>
                <Chip size="small" label={group.materials.length} />
              </Box>

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
