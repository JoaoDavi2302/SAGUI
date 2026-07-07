"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  Paper,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
} from "@mui/material";

import {
  Person,
  School,
  MenuBook,
  Assessment,
  LockReset,
  Close,
} from "@mui/icons-material";

import { useMemo, useState } from "react";

import { DatabaseProvider } from "@/services/poo/databaseProvider";

const database = DatabaseProvider.getDatabase();

interface Props {
  open: boolean;
  userId?: number;
  onClose: () => void;
}

export default function UserViewModal({ open, userId, onClose }: Props) {
  const [tab, setTab] = useState(0);

  const data = useMemo(() => {
    if (!userId) return null;

    const user = database.usuarios.find((u) => u.id === userId);

    if (!user) return null;

    const enrollments = database.matriculas.filter(
      (m) => m.aluno_id === userId,
    );

    const courses = database.cursos.filter((c) =>
      enrollments.some((e) => e.curso_id === c.id),
    );

    const disciplines = database.disciplinas.filter((d) =>
      enrollments.some((e) => e.disciplina_id === d.id),
    );

    const modules = database.progresso_modulo.filter(
      (p) => p.aluno_id === userId,
    );

    const attempts = database.tentativas_atividade.filter(
      (a) => a.aluno_id === userId,
    );

    const average = attempts.length
      ? (
          attempts.reduce((acc, a) => acc + a.nota, 0) / attempts.length
        ).toFixed(1)
      : "0";

    return {
      user,

      courses,

      disciplines,

      modules,

      attempts,

      average,
    };
  }, [userId]);

  if (!data) return null;

  const { user, courses, disciplines, modules, attempts, average } = data;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg,#1565c0,#42a5f5)",

          color: "white",
        }}
      >
        <Stack direction="row" spacing={2} sx={{alignItems:"center"}}>
          <Avatar
            sx={{
              width: 70,
              height: 70,
              bgcolor: "rgba(255,255,255,.2)",
            }}
          >
            <Person />
          </Avatar>

          <Box>
            <Typography variant="h5" sx={{fontWeight:700}}>
              {user.nome}
            </Typography>

            <Typography>{user.email}</Typography>

            <Stack direction="row" spacing={1} sx={{mt:1}}>
              <Chip
                label={user.perfil}
                sx={{
                  color: "white",
                  background: "rgba(255,255,255,.2)",
                }}
              />

              <Chip
                label={user.ativo ? "Ativo" : "Inativo"}
                sx={{
                  color: "white",
                  background: "rgba(255,255,255,.2)",
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          bgcolor: "#fafafa",
        }}
      >
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",

            gap: 2,

            mb: 3,
          }}
        >
          <Summary icon={<School />} title="Cursos" value={courses.length} />

          <Summary
            icon={<MenuBook />}
            title="Disciplinas"
            value={disciplines.length}
          />

          <Summary icon={<Assessment />} title="Média" value={average} />

          <Summary
            icon={<Assessment />}
            title="Módulos"
            value={modules.length}
          />
        </Box>

        <Paper>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Dados" />

            <Tab label="Cursos" />

            <Tab label="Disciplinas" />

            <Tab label="Desempenho" />

            <Tab label="Segurança" />
          </Tabs>

          <Divider />

          <Box sx={{p:3}}>
            {tab === 0 && (
              <Stack spacing={2}>
                <Typography>Email: {user.email}</Typography>

                <Typography>Cidade: {user.cidade}</Typography>

                <Typography>Nascimento: {user.data_nascimento}</Typography>

                <Typography>
                  Cadastro:
                  {new Date(user.criado_em).toLocaleDateString()}
                </Typography>
              </Stack>
            )}

            {tab === 1 && (
              <Stack spacing={2}>
                {courses.map((c) => (
                  <Paper key={c.id} sx={{ p: 2 }}>
                    <Typography sx={{fontWeight:700}}>{c.nome}</Typography>

                    <Typography>{c.descricao}</Typography>
                  </Paper>
                ))}
              </Stack>
            )}

            {tab === 2 && (
              <Stack spacing={2}>
                {disciplines.map((d) => (
                  <Paper key={d.id} sx={{ p: 2 }}>
                    <Typography sx={{fontWeight:700}}>{d.nome}</Typography>

                    <Typography>{d.descricao}</Typography>
                  </Paper>
                ))}
              </Stack>
            )}

            {tab === 3 && (
              <Stack spacing={2}>
                <Typography>
                  Atividades realizadas:
                  {attempts.length}
                </Typography>

                <Typography>
                  Média:
                  {average}
                </Typography>

                <Typography>Progresso módulos:</Typography>

                {modules.map((m) => (
                  <Box key={m.id}>
                    <Typography variant="caption">
                      Modulo {m.modulo_id}
                    </Typography>

                    <LinearProgress
                      value={m.concluido ? 100 : 0}
                      variant="determinate"
                    />
                  </Box>
                ))}
              </Stack>
            )}

            {tab === 4 && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<LockReset />}
              >
                Resetar senha
              </Button>
            )}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Summary({ icon, title, value }: any) {
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        borderRadius: 3,
      }}
    >
      <Avatar>{icon}</Avatar>

      <Box>
        <Typography color="text.secondary">{title}</Typography>

        <Typography sx={{fontWeight:700, fontSize:20}}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
