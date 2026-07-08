"use client";

import { useEffect, useRef, useState } from "react";
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
  Radio,
  RadioGroup,
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
  scoreText: string;
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

const SCORE_INPUT_PATTERN = /^\d*([.,]\d*)?$/;
const SCORE_TOTAL_TOLERANCE = 0.01;

function emptyAlternative(): AlternativeForm {
  return { text: "", correct: false };
}

function emptyQuestion(): QuestionForm {
  return {
    statement: "",
    questionType: "SINGLE_CHOICE",
    scoreText: "1",
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

function formatScoreText(score: number): string {
  return Number.isInteger(score) ? String(score) : String(score);
}

function parseScoreText(scoreText: string): number | null {
  const normalized = scoreText.trim().replace(",", ".");
  if (!normalized) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  return parsed;
}

function activityToForm(activity: Awaited<ReturnType<typeof getActivity>>): ActivityFormState {
  return {
    moduleId: activity.moduleId,
    title: activity.title,
    description: activity.description ?? "",
    questions: activity.questions.map((question) => ({
      statement: question.statement,
      questionType: question.questionType,
      scoreText: formatScoreText(question.score),
      alternatives: question.alternatives.map((alt) => ({
        text: alt.text,
        correct: alt.correct,
      })),
    })),
  };
}

function getTotalScore(questions: QuestionForm[]): number {
  return questions.reduce((sum, question) => {
    const score = parseScoreText(question.scoreText);
    return sum + (score ?? 0);
  }, 0);
}

function getQuestionIndexFromError(message: string): number | null {
  const match = message.match(/^Questão (\d+)/);
  return match ? Number(match[1]) - 1 : null;
}

function validateForm(form: ActivityFormState): string | null {
  if (!form.moduleId) return "Selecione um módulo.";
  if (!form.title.trim()) return "O título da atividade é obrigatório.";
  if (form.questions.length === 0) return "Adicione pelo menos uma questão.";

  for (let i = 0; i < form.questions.length; i += 1) {
    const question = form.questions[i];
    const label = `Questão ${i + 1}`;

    if (!question.statement.trim()) return `${label}: enunciado obrigatório.`;

    const score = parseScoreText(question.scoreText);
    if (score === null) {
      return `${label}: informe uma pontuação numérica maior que zero (ex.: 10 ou 12.5).`;
    }

    if (question.alternatives.length === 0) return `${label}: adicione alternativas.`;

    const correctCount = question.alternatives.filter((alt) => alt.correct).length;

    if (question.questionType !== "TRUE_FALSE") {
      const emptyAlt = question.alternatives.some((alt) => !alt.text.trim());
      if (emptyAlt) return `${label}: preencha o texto de todas as alternativas.`;
    }

    if (question.questionType === "SINGLE_CHOICE" && correctCount !== 1) {
      return `${label}: escolha única deve ter exatamente uma alternativa correta.`;
    }
    if (question.questionType === "TRUE_FALSE") {
      if (question.alternatives.length !== 2) {
        return `${label}: verdadeiro/falso deve ter exatamente duas alternativas.`;
      }
      if (correctCount !== 1) {
        return `${label}: selecione se a resposta correta é Verdadeiro ou Falso.`;
      }
    }
    if (question.questionType === "MULTIPLE_CHOICE" && correctCount < 1) {
      return `${label}: múltipla escolha deve ter pelo menos uma alternativa correta.`;
    }
  }

  const totalScore = getTotalScore(form.questions);
  if (Math.abs(totalScore - 100) > SCORE_TOTAL_TOLERANCE) {
    return `A soma das pontuações das questões deve ser 100 (atual: ${totalScore.toFixed(2)}).`;
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
      score: parseScoreText(question.scoreText) ?? 0,
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
  const errorAlertRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollToQuestionIndex = useRef<number | null>(null);

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

  useEffect(() => {
    if (!error) return;

    const questionIndex = getQuestionIndexFromError(error);
    const targetIndex = questionIndex ?? scrollToQuestionIndex.current;

    requestAnimationFrame(() => {
      if (targetIndex !== null && questionRefs.current.get(targetIndex)) {
        questionRefs.current.get(targetIndex)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }

      errorAlertRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    scrollToQuestionIndex.current = null;
  }, [error]);

  useEffect(() => {
    if (scrollToQuestionIndex.current === null) return;

    const targetIndex = scrollToQuestionIndex.current;
    requestAnimationFrame(() => {
      questionRefs.current.get(targetIndex)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      scrollToQuestionIndex.current = null;
    });
  }, [form.questions.length]);

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

  function handleAddQuestion() {
    const newIndex = form.questions.length;
    scrollToQuestionIndex.current = newIndex;
    setForm((current) => ({
      ...current,
      questions: [...current.questions, emptyQuestion()],
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

  const totalScore = getTotalScore(form.questions);
  const totalScoreValid = Math.abs(totalScore - 100) <= SCORE_TOTAL_TOLERANCE;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? "Editar atividade" : "Nova atividade"}</DialogTitle>
      <DialogContent sx={{ maxHeight: "75vh", overflowY: "auto" }}>
        {loading ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            Carregando...
          </Typography>
        ) : (
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && (
              <Alert
                ref={errorAlertRef}
                severity="error"
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  boxShadow: 1,
                }}
              >
                {error}
              </Alert>
            )}

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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  position: "sticky",
                  top: error ? 56 : 0,
                  zIndex: 1,
                  bgcolor: "background.paper",
                  py: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Questões
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: totalScoreValid ? "success.main" : "warning.main",
                    }}
                  >
                    Total: {totalScore.toFixed(2)}/100
                  </Typography>
                </Box>
                <Button size="small" startIcon={<Add />} onClick={handleAddQuestion}>
                  Adicionar questão
                </Button>
              </Box>

              <Stack spacing={2}>
                {form.questions.map((question, questionIndex) => (
                  <Paper
                    key={questionIndex}
                    ref={(element) => {
                      if (element) {
                        questionRefs.current.set(questionIndex, element);
                      } else {
                        questionRefs.current.delete(questionIndex);
                      }
                    }}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2 }}
                  >
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
                          value={question.scoreText}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!SCORE_INPUT_PATTERN.test(value)) return;
                            updateQuestion(questionIndex, { scoreText: value });
                          }}
                          onBlur={() => {
                            const parsed = parseScoreText(question.scoreText);
                            if (parsed !== null) {
                              updateQuestion(questionIndex, {
                                scoreText: formatScoreText(parsed),
                              });
                            }
                          }}
                          size="small"
                          sx={{ width: 140 }}
                          placeholder="Ex.: 10 ou 12.5"
                          slotProps={{
                            input: {
                              inputMode: "decimal",
                              "aria-label": "Pontuação da questão",
                            },
                          }}
                          helperText={
                            parseScoreText(question.scoreText) === null && question.scoreText.trim()
                              ? "Informe um número maior que zero"
                              : " "
                          }
                          error={
                            parseScoreText(question.scoreText) === null &&
                            question.scoreText.trim() !== ""
                          }
                        />
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                          {question.questionType === "TRUE_FALSE"
                            ? "Selecione a resposta correta"
                            : "Alternativas (marque a(s) correta(s))"}
                        </Typography>

                        {question.questionType === "TRUE_FALSE" ? (
                          <RadioGroup
                            value={String(
                              Math.max(
                                0,
                                question.alternatives.findIndex((alt) => alt.correct),
                              ),
                            )}
                            onChange={(e) =>
                              setAlternativeCorrect(
                                questionIndex,
                                Number(e.target.value),
                                true,
                                question.questionType,
                              )
                            }
                          >
                            {question.alternatives.map((alternative, altIndex) => (
                              <FormControlLabel
                                key={altIndex}
                                value={String(altIndex)}
                                control={<Radio size="small" />}
                                label={alternative.text}
                              />
                            ))}
                          </RadioGroup>
                        ) : (
                          <>
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
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
                                                  ai === altIndex
                                                    ? { ...alt, text: e.target.value }
                                                    : alt,
                                                ),
                                              }
                                            : q,
                                        ),
                                      }))
                                    }
                                    size="small"
                                    fullWidth
                                    placeholder={`Alternativa ${altIndex + 1}`}
                                  />
                                  {question.alternatives.length > 2 && (
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
                          </>
                        )}
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
