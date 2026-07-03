// para modificar para atividades
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
  QuizOutlined,
  ChevronRight,
  MenuBookOutlined,
} from "@mui/icons-material";

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

import { useRouter } from "next/navigation";
import { ModuleActivityCard } from "@/services/poo/shared/types";
import { DatabaseProvider } from "@/services/poo/databaseProvider";

import { useUser } from "@/services/auth/AuthContext";
import { ActivityProvider } from "@/services/poo/activity/activityProvider";

const database = DatabaseProvider.getDatabase();

export default function MateriaisPage() {
  const router = useRouter();

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const { user, effectiveRole } = useUser();

  const [search, setSearch] = useState("");
  const handleOpen = (module: ModuleActivityCard) => {
    if (!module?.moduleId) return;

    router.push(
      `/avaliacoes/${slugify(module.moduleName)}?id=${module.moduleId}`,
    );
  };
  // chip
  // const [selectedModule, setSelectedModule] = useState<string>("all");

  const data = useMemo(() => {
    if (!user) return [];

    return ActivityProvider.create(effectiveRole, database, user).listModules();
  }, [user, effectiveRole]);

  const filtered = data.filter((m) => {
    const text = [
      m.moduleName ?? "",
      m.disciplineName ?? "",
      m.courseName ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();

    filtered.forEach((a) => {
      const arr = map.get(a.disciplineName) ?? [];
      arr.push(a);
      map.set(a.disciplineName, arr);
    });

    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        sx={{
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        Atividades
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Quizzes e exercícios organizados por disciplina.
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

      <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {groups.map(([discipline, activities]) => (
          <Box key={discipline}>
            {/* Cabeçalho */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                mb: 3,
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  bgcolor: "primary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                }}
              >
                <MenuBookOutlined fontSize="small" />
              </Box>

              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {discipline}
              </Typography>

              <Chip
                size="small"
                label={`${activities.length} atividade${
                  activities.length > 1 ? "s" : ""
                }`}
              />
            </Stack>

            <Stack spacing={2}>
              {activities.map((module) => (
                <Card
                  key={module.moduleId}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    transition: ".2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 3,
                          bgcolor: "primary.50",
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <QuizOutlined />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* <Typography sx={{fontWeight:700}} noWrap>
                          {activity.title}
                        </Typography> */}

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {module.moduleName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {module.quizzes.length ?? 0} atividade
                          {module.quizzes.length > 1 ? "s" : ""}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          sx={{ mt: 1, flexWrap: "wrap" }}
                        >
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${module.quizzes.length} quizzes`}
                          />

                          {/* <Chip
                            size="small"
                            variant="outlined"
                            label={`Mín. ${activity.passing_score}%`}
                          />

                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${activity.max_attempts} tentativas`}
                          /> */}
                        </Stack>
                      </Box>

                      <Button
                        variant="contained"
                        endIcon={<ChevronRight />}
                        onClick={() => handleOpen(module)}
                      >
                        Iniciar
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
