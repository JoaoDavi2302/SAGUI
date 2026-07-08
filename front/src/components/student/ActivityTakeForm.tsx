'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';
import { ApiError } from '@/new-services/poo/shared/api/client';
import {
  getActivityForTake,
  submitActivity,
  listMyActivityAttempts,
  type ActivityResponse,
  type StudentAnswerRequest,
  type ActivityAttemptSummaryResponse,
  type ActivityAttemptResultResponse,
} from '@/new-services/poo/shared/api/activities';
import { getApiErrorMessage } from '@/utils/apiErrorMessage';

interface ActivityTakeFormProps {
  activityId: string;
  onSuccess?: (result: ActivityAttemptResultResponse) => void;
  onError?: (error: string) => void;
}

export function ActivityTakeForm({
  activityId,
  onSuccess,
  onError,
}: ActivityTakeFormProps) {
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [attempts, setAttempts] = useState<ActivityAttemptSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ActivityAttemptResultResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [activityData, attemptsData] = await Promise.all([
        getActivityForTake(activityId),
        listMyActivityAttempts(activityId),
      ]);

      setActivity(activityData);
      setAttempts(attemptsData);

      // Inicializar respostas
      const initialAnswers: Record<string, string[]> = {};
      activityData.questions.forEach((q) => {
        initialAnswers[q.id] = [];
      });
      setAnswers(initialAnswers);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activityId]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Array.isArray(value) ? value : [value],
    }));
  };

  const handleSubmit = async () => {
    if (!activity) return;

    setSubmitting(true);
    setError(null);

    try {
      const formattedAnswers: StudentAnswerRequest[] = activity.questions.map((q) => ({
        questionId: q.id,
        selectedAlternativeIds: answers[q.id] || [],
      }));

      const resultData = await submitActivity(activityId, formattedAnswers);
      setResult(resultData);

      // Recarregar tentativas
      const newAttempts = await listMyActivityAttempts(activityId);
      setAttempts(newAttempts);

      onSuccess?.(resultData);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!activity) {
    return <Alert severity="warning">Atividade não encontrada.</Alert>;
  }

  const usedAttempts = attempts.length;
  const remainingAttempts = activity.attemptLimit - usedAttempts;
  const hasApprovedAttempt = attempts.some((a) => a.approved);
  const canSubmit = remainingAttempts > 0 && !hasApprovedAttempt && !result;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {activity.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {activity.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Tentativas: {usedAttempts}/{activity.attemptLimit}
          </Typography>
          {hasApprovedAttempt && (
            <Typography variant="caption" color="success.main">
              ✅ Aprovado
            </Typography>
          )}
          {remainingAttempts === 0 && !hasApprovedAttempt && (
            <Typography variant="caption" color="error.main">
              ❌ Limite de tentativas atingido
            </Typography>
          )}
        </Box>
      </Box>

      {result && (
        <Alert
          severity={result.approved ? 'success' : 'error'}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2">
            {result.approved ? '✅ Aprovado!' : '❌ Reprovado'}
          </Typography>
          <Typography variant="body2">
            Nota: {result.score.toFixed(1)} pontos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nota mínima: {activity.minimumScore} pontos
          </Typography>
          <Typography variant="body2">{result.message}</Typography>
        </Alert>
      )}

      {activity.questions.map((question, index) => {
        const isSingleChoice = question.questionType === 'SINGLE_CHOICE' ||
          question.questionType === 'TRUE_FALSE';
        const isMultipleChoice = question.questionType === 'MULTIPLE_CHOICE';
        const disabled = !canSubmit || !!result;

        return (
          <Card key={question.id} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Questão {index + 1}: {question.statement}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({question.questionType.replace('_', ' ').toLowerCase()})
                </Typography>
              </Typography>

              {isSingleChoice && (
                <FormControl component="fieldset" disabled={disabled}>
                  <RadioGroup
                    value={answers[question.id]?.[0] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  >
                    {question.alternatives.map((alt) => (
                      <FormControlLabel
                        key={alt.id}
                        value={alt.id}
                        control={<Radio />}
                        label={alt.text}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}

              {isMultipleChoice && (
                <FormControl component="fieldset" disabled={disabled}>
                  <FormLabel component="legend">Selecione as alternativas corretas</FormLabel>
                  <Box sx={{ mt: 1 }}>
                    {question.alternatives.map((alt) => (
                      <FormControlLabel
                        key={alt.id}
                        control={
                          <Checkbox
                            checked={(answers[question.id] || []).includes(alt.id)}
                            onChange={(e) => {
                              const current = answers[question.id] || [];
                              if (e.target.checked) {
                                handleAnswerChange(question.id, [...current, alt.id]);
                              } else {
                                handleAnswerChange(
                                  question.id,
                                  current.filter((id) => id !== alt.id)
                                );
                              }
                            }}
                          />
                        }
                        label={alt.text}
                      />
                    ))}
                  </Box>
                </FormControl>
              )}
            </CardContent>
          </Card>
        );
      })}

      {canSubmit && (
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          fullWidth
          sx={{ mt: 2 }}
        >
          {submitting ? <CircularProgress size={24} /> : 'Enviar respostas'}
        </Button>
      )}

      {!canSubmit && !result && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {hasApprovedAttempt
            ? 'Você já foi aprovado nesta atividade.'
            : 'Limite de tentativas atingido.'}
        </Alert>
      )}
    </Box>
  );
}
