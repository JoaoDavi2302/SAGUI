"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, DeleteOutlined } from "@mui/icons-material";
import {
  createActivity,
  getActivity,
  updateActivity,
  type ActivityRequestDTO,
  type QuestionType,
} from "@/new-services/poo/shared/api/activities";
import { type ModuleDTO } from "@/new-services/poo/shared/api/catalog";
import { ApiError } from "@/new-services/poo/shared/api/client";

interface AlternativeForm {
  text: string;
  correct: boolean;
}

interface QuestionForm {
  statement: string;
  questionType: QuestionType;
  score: number;
  alternatives: AlternativeForm[];
}

interface ActivityFormState {
  moduleId: string;
  title: string;
  description: string;
  questions: QuestionForm[];
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Escolha única",
  MULTIPLE_CHOICE: "Múltipla escolha",
  TRUE_FALSE: "Verdadeiro ou falso",
};

const TRUE_FALSE_ALTERNATIVES: AlternativeForm[] = [
  { text: "Verdadeiro", correct: true },
  { text: "Falso", correct: false },
];

function emptyAlternative(): AlternativeForm {
  return { text: "", correct: false };
}

function emptyQuestion(): QuestionForm {
  return {
    statement: "",
    questionType: "SINGLE_CHOICE",
    score: 1,
    alternatives: [emptyAlternative(), emptyAlternative()],
  };
}

function emptyForm(modules: ModuleDTO[]): ActivityFormState {
  return {
    moduleId: modules[0]?.id ?? "",
    title: "",
    description: "",
    questions: [emptyQuestion()],
  };
}

function activityToForm(activity: Awaited<ReturnType<typeof getActivity>>): ActivityFormState {
  return {
    moduleId: activity.moduleId,
    title: activity.title,
    description: activity.description ?? "",
    questions: activity.questions.map((question) => ({
      statement: question.statement,
      questionType: question.questionType,
      score: question.score,
      alternatives: question.alternatives.map((alt) => ({
        text: alt.text,
        correct: alt.correct,
      })),
    })),
  };
}

function getTotalScore(questions: QuestionForm[]): number {
  return questions.reduce((sum, question) => sum + question.score, 0);
}

function validateForm(form: ActivityFormState): string | null {
  if (!form.moduleId) return "Selecione um módulo.";
  if (!form.title.trim()) return "O título da atividade é obrigatório.";
  if (form.questions.length === 0) return "Adicione pelo menos uma questão.";

  for (let i = 0; i < form.questions.length; i += 1) {
    const question = form.questions[i];
    const label = `Questão ${i + 1}`;

    if (!question.statement.trim()) return `${label}: enunciado obrigatório.`;
    if (!question.score || question.score <= 0) return `${label}: pontuação deve ser maior que zero.`;
    if (question.alternatives.length === 0) return `${label}: adicione alternativas.`;

    const correctCount = question.alternatives.filter((alt) => alt.correct).length;
    const emptyAlt = question.alternatives.some((alt) => !alt.text.trim());
    if (emptyAlt) return `${label}: preencha o texto de todas as alternativas.`;

    if (question.questionType === "SINGLE_CHOICE" && correctCount !== 1) {
      return `${label}: escolha única deve ter exatamente uma alternativa correta.`;
    }
    if (question.questionType === "TRUE_FALSE") {
      if (question.alternatives.length !== 2) {
        return `${label}: verdadeiro/falso deve ter exatamente duas alternativas.`;
      }
      if (correctCount !== 1) {
        return `${label}: verdadeiro/falso deve ter exatamente uma alternativa correta.`;
      }
    }
    if (question.questionType === "MULTIPLE_CHOICE" && correctCount < 1) {
      return `${label}: múltipla escolha deve ter pelo menos uma alternativa correta.`;
    }
  }

  const totalScore = getTotalScore(form.questions);
  if (totalScore !== 100) {
    return `A soma das pontuações das questões deve ser 100 (atual: ${totalScore}).`;
  }

  return null;
}

function toRequest(form: ActivityFormState): ActivityRequestDTO {
  return {
    moduleId: form.moduleId,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    questions: form.questions.map((question) => ({
      statement: question.statement.trim(),
      questionType: question.questionType,
      score: question.score,
      alternatives: question.alternatives.map((alt) => ({
        text: alt.text.trim(),
        correct: alt.correct,
      })),
    })),
  };
}

interface ActivityFormDialogProps {
  open: boolean;
  onClose: () => void;
  modules: ModuleDTO[];
  activityId?: string | null;
  onSaved: () => void;
}

export function ActivityFormDialog({
  open,
  onClose,
  modules,
  activityId,
  onSaved,
}: ActivityFormDialogProps) {
  const isEditing = Boolean(activityId);
  const [form, setForm] = useState<ActivityFormState>(emptyForm(modules));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (!activityId) {
      setForm(emptyForm(modules));
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      if (!activityId) return;

      setLoading(true);
      setError(null);

      try {
        const activity = await getActivity(activityId);
        if (!cancelled) setForm(activityToForm(activity));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar a atividade.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, activityId, modules]);

  function updateQuestion(index: number, patch: Partial<QuestionForm>) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, i) => {
        if (i !== index) return question;
        const updated = { ...question, ...patch };
        if (patch.questionType === "TRUE_FALSE") {
          updated.alternatives = TRUE_FALSE_ALTERNATIVES.map((alt) => ({ ...alt }));
        }
        return updated;
      }),
    }));
  }

  function setAlternativeCorrect(
    questionIndex: number,
    altIndex: number,
    correct: boolean,
    questionType: QuestionType,
  ) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, qi) => {
        if (qi !== questionIndex) return question;

        const alternatives = question.alternatives.map((alt, ai) => {
          if (questionType === "SINGLE_CHOICE" || questionType === "TRUE_FALSE") {
            return { ...alt, correct: ai === altIndex ? correct : false };
          }
          if (ai !== altIndex) return alt;
          return { ...alt, correct };
        });

        return { ...question, alternatives };
      }),
    }));
  }

  async function handleSubmit() {
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = toRequest(form);
      if (activityId) {
        await updateActivity(activityId, payload);
      } else {
        await createActivity(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar a atividade.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? "Editar atividade" : "Nova atividade"}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            Carregando...
          </Typography>
        ) : (
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <FormControl fullWidth size="small">
              <InputLabel>Módulo</InputLabel>
              <Select
                label="Módulo"
                value={form.moduleId}
                onChange={(e) => setForm((current) => ({ ...current, moduleId: e.target.value }))}
              >
                {modules.map((module) => (
                  <MenuItem key={module.id} value={module.id}>
                    {module.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Título"
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              size="small"
              fullWidth
            />

            <TextField
              label="Descrição (opcional)"
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              size="small"
              fullWidth
              multiline
              minRows={2}
            />

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Questões
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: getTotalScore(form.questions) === 100 ? "success.main" : "warning.main",
                    }}
                  >
                    Total: {getTotalScore(form.questions)}/100
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      questions: [...current.questions, emptyQuestion()],
                    }))
                  }
                >
                  Adicionar questão
                </Button>
              </Box>

              <Stack spacing={2}>
                {form.questions.map((question, questionIndex) => (
                  <Paper key={questionIndex} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Questão {questionIndex + 1}
                      </Typography>
                      {form.questions.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              questions: current.questions.filter((_, i) => i !== questionIndex),
                            }))
                          }
                          aria-label="Remover questão"
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      )}
                    </Box>

                    <Stack spacing={1.5}>
                      <TextField
                        label="Enunciado"
                        value={question.statement}
                        onChange={(e) => updateQuestion(questionIndex, { statement: e.target.value })}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                      />

                      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <InputLabel>Tipo</InputLabel>
                          <Select
                            label="Tipo"
                            value={question.questionType}
                            onChange={(e) =>
                              updateQuestion(questionIndex, {
                                questionType: e.target.value as QuestionType,
                              })
                            }
                          >
                            {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                              <MenuItem key={type} value={type}>
                                {QUESTION_TYPE_LABELS[type]}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <TextField
                          label="Pontuação"
                          type="number"
                          value={question.score}
                          onChange={(e) =>
                            updateQuestion(questionIndex, {
                              score: Number(e.target.value) || 0,
                            })
                          }
                          size="small"
                          sx={{ width: 120 }}
                        />
                      </Box>

                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Alternativas (marque a(s) correta(s))
                          </Typography>
                          {question.questionType !== "TRUE_FALSE" && (
                            <Button
                              size="small"
                              onClick={() =>
                                updateQuestion(questionIndex, {
                                  alternatives: [...question.alternatives, emptyAlternative()],
                                })
                              }
                            >
                              Adicionar alternativa
                            </Button>
                          )}
                        </Box>

                        <Stack spacing={1}>
                          {question.alternatives.map((alternative, altIndex) => (
                            <Box
                              key={altIndex}
                              sx={{ display: "flex", alignItems: "center", gap: 1 }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={alternative.correct}
                                    onChange={(e) =>
                                      setAlternativeCorrect(
                                        questionIndex,
                                        altIndex,
                                        e.target.checked,
                                        question.questionType,
                                      )
                                    }
                                    size="small"
                                  />
                                }
                                label=""
                                sx={{ mr: 0 }}
                              />
                              <TextField
                                value={alternative.text}
                                onChange={(e) =>
                                  setForm((current) => ({
                                    ...current,
                                    questions: current.questions.map((q, qi) =>
                                      qi === questionIndex
                                        ? {
                                            ...q,
                                            alternatives: q.alternatives.map((alt, ai) =>
                                              ai === altIndex ? { ...alt, text: e.target.value } : alt,
                                            ),
                                          }
                                        : q,
                                    ),
                                  }))
                                }
                                size="small"
                                fullWidth
                                placeholder={`Alternativa ${altIndex + 1}`}
                                disabled={question.questionType === "TRUE_FALSE"}
                              />
                              {question.questionType !== "TRUE_FALSE" &&
                                question.alternatives.length > 2 && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      updateQuestion(questionIndex, {
                                        alternatives: question.alternatives.filter(
                                          (_, i) => i !== altIndex,
                                        ),
                                      })
                                    }
                                    aria-label="Remover alternativa"
                                  >
                                    <DeleteOutlined fontSize="small" />
                                  </IconButton>
                                )}
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={submitting || loading || modules.length === 0}
        >
          {submitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar atividade"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
