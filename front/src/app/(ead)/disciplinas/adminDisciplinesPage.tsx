"use client";

import {
  LayersOutlined,
  MenuBookOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type AdminDisciplineItem,
  fetchAdminDisciplines,
  filterAdminDisciplines,
} from "@/components/admin/adminDisciplineData";
import { Badge } from "@/components/ui/Badge";

export default function AdminDisciplinesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim();

  const [disciplines, setDisciplines] = useState<AdminDisciplineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDisciplines = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setDisciplines(await fetchAdminDisciplines());
    } catch {
      setError("Não foi possível carregar as disciplinas.");
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisciplines();
  }, [loadDisciplines]);

  const filteredDisciplines = useMemo(
    () => filterAdminDisciplines(disciplines, searchQuery),
    [disciplines, searchQuery],
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
          Disciplinas
        </Typography>

        <Typography color="text.secondary">
          {searchQuery
            ? `Exibindo ${filteredDisciplines.length} resultado(s) para "${searchQuery}".`
            : "Gerencie todas as disciplinas cadastradas na plataforma."}
        </Typography>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {searchQuery ? (
        <Box sx={{ mb: 3 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push("/disciplinas")}
          >
            Limpar busca
          </Button>
        </Box>
      ) : null}

      <Grid container spacing={3}>
        {filteredDisciplines.map((discipline) => {
          const isInactive = discipline.status === "Inactive";

          return (
            <Grid key={discipline.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                component="a"
                href={`/dashboard/cursos/${discipline.courseId}`}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  color: "inherit",
                  opacity: isInactive ? 0.72 : 1,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {discipline.name}
                    </Typography>
                    <Badge
                      color={isInactive ? "neutral" : "success"}
                      label={isInactive ? "Inativa" : "Ativa"}
                      dot
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {discipline.description || "Sem descrição"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 3, flexWrap: "wrap" }}
                  >
                    <Chip
                      icon={<MenuBookOutlined />}
                      label={discipline.courseName}
                      size="small"
                    />

                    <Chip
                      icon={<PersonOutlineOutlined />}
                      label={discipline.professorName}
                      size="small"
                    />

                    <Chip
                      icon={<LayersOutlined />}
                      label={`${discipline.moduleCount} módulos`}
                      size="small"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {filteredDisciplines.length === 0 && (
          <Grid size={12}>
            <Typography align="center" color="text.secondary">
              {searchQuery
                ? "Nenhuma disciplina encontrada para essa busca."
                : "Nenhuma disciplina cadastrada."}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
