"use client";

import { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Dialog,
  TextField,
  Stack,
} from "@mui/material";

import { LayersOutlined, ExpandMore, Add } from "@mui/icons-material";

interface Props {
  data: any;

  canDelete?: boolean;
}

export default function DisciplineManagementView({
  data,

  canDelete = false,
}: Props) {
  const { discipline, modules, students } = data;

  const [tab, setTab] = useState(0);

  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}

      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#e3f2fd",
                }}
              >
                <LayersOutlined color="primary" />
              </Box>

              <Box>
                <Typography sx={{fontWeight:700, fontSize:20}}>
                  {discipline.nome}
                </Typography>

                <Typography color="text.secondary">
                  {discipline.descricao}
                </Typography>
              </Box>
            </Box>

            <Button variant="contained" onClick={() => setOpen(true)}>
              Editar disciplina
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Conteúdo" />

        <Tab label="Alunos" />
      </Tabs>

      {/* CONTEUDO */}

      {tab === 0 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography sx={{fontWeight:700}}>Módulos</Typography>

            <Button startIcon={<Add />} variant="outlined">
              Adicionar módulo
            </Button>
          </Box>

          {modules.map((module: any) => (
            <Accordion key={module.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box>
                  <Typography sx={{fontWeight:700}}>{module.nome}</Typography>

                  <Typography variant="caption" color="text.secondary">
                    {module.descricao}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Button size="small" startIcon={<Add />} sx={{ mb: 2 }}>
                  Adicionar aula
                </Button>

                {module.lessons?.map((lesson: any) => (
                  <Box
                    key={lesson.id}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "#f5f5f5",
                      },
                    }}
                  >
                    <Typography>▶ {lesson.titulo}</Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* ALUNOS */}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography sx={{fontWeight:700,mb:2}}>
              Alunos matriculados
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>

                  <TableCell>Progresso</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>

                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={student.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 5,
                        }}
                      />

                      <Typography variant="caption">
                        {student.percentage}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* MODAL EDITAR */}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <CardContent>
          <Typography sx={{fontWeight:700,mb:2}}>
            Editar disciplina
          </Typography>

          <Stack spacing={2}>
            <TextField label="Nome" defaultValue={discipline.nome} />

            <TextField
              label="Descrição"
              defaultValue={discipline.descricao}
              multiline
            />

            <Button variant="contained">Salvar</Button>
          </Stack>
        </CardContent>
      </Dialog>
    </Box>
  );
}
