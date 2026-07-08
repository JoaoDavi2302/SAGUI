'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Stack,
  Tabs,
  Tab,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  VisibilityOutlined,
  CheckCircle,
  Cancel,
  School,
} from '@mui/icons-material';
import { useProfessorReports } from '@/hooks/useProfessorReports';

function getStatusColor(status: string) {
  switch (status) {
    case 'APROVADO': return 'success';
    case 'REPROVADO': return 'error';
    default: return 'warning';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'APROVADO': return '✅ Aprovado';
    case 'REPROVADO': return '❌ Reprovado';
    default: return '⏳ Em andamento';
  }
}

export default function RelatoriosProfessorPage() {
  const {
    students,
    loading,
    error,
    detailError,
    detailLoading,
    disciplines,
    selectedDiscipline,
    setSelectedDiscipline,
    selectedStudent,
    loadStudentDetail,
    setSelectedStudent,
  } = useProfessorReports();

  const [detailTab, setDetailTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleOpenDetail = async (studentId: string) => {
    setDialogOpen(true);
    await loadStudentDetail(studentId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Relatórios de Desempenho
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Acompanhe o desempenho individual dos alunos nas suas disciplinas.
      </Typography>

      {/* Filtro de disciplina */}
      <Box sx={{ mb: 4, maxWidth: 400 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Selecionar disciplina</InputLabel>
          <Select
            value={selectedDiscipline || ''}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            label="Selecionar disciplina"
          >
            {disciplines.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabela de alunos */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
        ) : students.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Nenhum aluno encontrado para esta disciplina.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell align="center">Progresso</TableCell>
                  <TableCell align="center">Taxa de Acerto</TableCell>
                  <TableCell align="center">Situação</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {student.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.studentEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">{student.overallPercentage}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={student.overallPercentage}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {student.totalActivities > 0 ? (
                        <Chip
                          label={`${student.accuracyRate}%`}
                          color={student.accuracyRate >= 70 ? 'success' : 'warning'}
                          size="small"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(student.status)}
                        color={getStatusColor(student.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetail(student.studentId)}
                        color="primary"
                      >
                        <VisibilityOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal de detalhes do aluno */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {detailLoading ? (
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          </DialogContent>
        ) : detailError ? (
          <>
            <DialogTitle>Detalhes do aluno</DialogTitle>
            <DialogContent>
              <Alert severity="error">{detailError}</Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} variant="contained">
                Fechar
              </Button>
            </DialogActions>
          </>
        ) : selectedStudent ? (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <School color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedStudent.studentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudent.studentEmail}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Chip
                  label={getStatusLabel(selectedStudent.status)}
                  color={getStatusColor(selectedStudent.status)}
                />
              </Box>
            </DialogTitle>

            <DialogContent>
              {/* Resumo */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedStudent.overallPercentage}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Progresso</Typography>
                </Paper>
                <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedStudent.accuracyRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Taxa de Acerto</Typography>
                </Paper>
                <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedStudent.correctAnswers + selectedStudent.wrongAnswers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Questões</Typography>
                </Paper>
              </Box>

              {/* Tabs */}
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 2 }}>
                <Tab label="Módulos" />
                <Tab label="Atividades" />
              </Tabs>

              <Divider />

              {detailTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  {selectedStudent.moduleProgress.length === 0 ? (
                    <Typography color="text.secondary">Nenhum módulo disponível.</Typography>
                  ) : (
                    <Stack spacing={2}>
                      {selectedStudent.moduleProgress.map((mod) => (
                        <Paper key={mod.moduleId} sx={{ p: 2, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontWeight: 600 }}>
                              {mod.moduleName}
                              {mod.completed && (
                                <CheckCircle color="success" sx={{ ml: 1, fontSize: 16 }} />
                              )}
                            </Typography>
                            <Typography variant="caption">
                              {mod.progressPercentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={mod.progressPercentage}
                            sx={{ height: 6, borderRadius: 3, mt: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {mod.unlocked ? '✅ Liberado' : '🔒 Bloqueado'}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}

              {detailTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  {selectedStudent.activities.length === 0 ? (
                    <Typography color="text.secondary">Nenhuma atividade respondida.</Typography>
                  ) : (
                    <Stack spacing={2}>
                      {selectedStudent.activities.map((act) => (
                        <Paper key={act.activityId} sx={{ p: 2, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 600 }}>
                                {act.activityTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {act.moduleName}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip
                                label={act.approved ? '✅ Aprovado' : '❌ Reprovado'}
                                color={act.approved ? 'success' : 'error'}
                                size="small"
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                {act.attemptsUsed}/{act.attemptLimit} tentativas
                              </Typography>
                              {act.bestScore !== null && (
                                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                                  Nota: {act.bestScore.toFixed(1)} · Acerto: {act.accuracyRate}%
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDialog} variant="contained">
                Fechar
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </Box>
  );
}