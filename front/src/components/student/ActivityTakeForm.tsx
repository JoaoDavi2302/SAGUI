'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Typography,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { Replay } from '@mui/icons-material';
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
import { ActivityResultDialog } from '@/components/student/ActivityResultDialog';

interface ActivityTakeFormProps {
  activityId: string;
  onSuccess?: (result: ActivityAttemptResultResponse) => void;
  onError?: (error: string) => void;
}

function buildEmptyAnswers(activity: ActivityResponse) {
  const initialAnswers: Record<string, string[]> = {};
  activity.questions.forEach((q) => {
    initialAnswers[q.id] = [];
  });
  return initialAnswers;
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
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [activityData, attemptsData] = await Promise.all([
        getActivityForTake(activityId),
        listMyActivityAttempts(activityId),
      ]);

      setActivity(activityData);
      setAttempts(attemptsData);
      setAnswers(buildEmptyAnswers(activityData));
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [activityId, onError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Array.isArray(value) ? value : [value],
    }));
  };

  const handleRetry = () => {
    if (!activity) return;
    setResult(null);
    setResultDialogOpen(false);
    setAnswers(buildEmptyAnswers(activity));
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
      setResultDialogOpen(true);

      const [newActivity, newAttempts] = await Promise.all([
        getActivityForTake(activityId),
        listMyActivityAttempts(activityId),
      ]);
      setActivity(newActivity);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
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

  const usedAttempts = activity.attemptsUsed;
  const remainingAttempts = activity.attemptsRemaining;
  const hasApprovedAttempt = activity.hasApprovedAttempt;
  const isReviewMode = !!result;
  const canSubmit = remainingAttempts > 0 && !hasApprovedAttempt && !isReviewMode;
  const canRetry = isReviewMode && !result.approved && remainingAttempts > 0 && !hasApprovedAttempt;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {activity.title}
        </Typography>
        {activity.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {activity.description}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip
            size="small"
            variant="outlined"
            label={`Tentativas: ${usedAttempts}/${activity.attemptLimit}`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`Nota mínima: ${activity.minimumScore}`}
          />
          {hasApprovedAttempt && (
            <Chip size="small" color="success" label="Aprovado" />
          )}
          {remainingAttempts === 0 && !hasApprovedAttempt && (
            <Chip size="small" color="error" label="Sem tentativas restantes" />
          )}
        </Stack>
      </Box>

      {result && (
        <Alert
          severity={result.approved ? 'success' : 'warning'}
          action={
            canRetry ? (
              <Button color="inherit" size="small" startIcon={<Replay />} onClick={handleRetry}>
                Tentar novamente
              </Button>
            ) : undefined
          }
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {result.approved ? 'Aprovado!' : 'Não atingiu a nota mínima'}
          </Typography>
          <Typography variant="body2">
            Nota: {result.score.toFixed(1)} pontos — {result.message}
          </Typography>
        </Alert>
      )}

      {!isReviewMode && (
        <Stack spacing={2} divider={<Divider flexItem />}>
          {activity.questions.map((question, index) => {
            const isSingleChoice =
              question.questionType === 'SINGLE_CHOICE' ||
              question.questionType === 'TRUE_FALSE';
            const isMultipleChoice = question.questionType === 'MULTIPLE_CHOICE';

            return (
              <Box key={question.id}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  {index + 1}. {question.statement}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  {question.questionType.replace(/_/g, ' ').toLowerCase()}
                </Typography>

                {isSingleChoice && (
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={answers[question.id]?.[0] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    >
                      <Stack spacing={0.5}>
                        {question.alternatives.map((alt) => (
                          <Card
                            key={alt.id}
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              borderColor: answers[question.id]?.[0] === alt.id ? 'primary.main' : 'divider',
                              bgcolor: answers[question.id]?.[0] === alt.id ? 'action.hover' : 'background.paper',
                            }}
                          >
                            <CardContent sx={{ py: '8px !important', px: 1.5 }}>
                              <FormControlLabel
                                value={alt.id}
                                control={<Radio size="small" />}
                                label={<Typography variant="body2">{alt.text}</Typography>}
                                sx={{ m: 0, width: '100%' }}
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                )}

                {isMultipleChoice && (
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{ fontSize: 12, mb: 1 }}>
                      Selecione todas as alternativas corretas
                    </FormLabel>
                    <Stack spacing={0.5}>
                      {question.alternatives.map((alt) => {
                        const checked = (answers[question.id] || []).includes(alt.id);
                        return (
                          <Card
                            key={alt.id}
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              borderColor: checked ? 'primary.main' : 'divider',
                              bgcolor: checked ? 'action.hover' : 'background.paper',
                            }}
                          >
                            <CardContent sx={{ py: '8px !important', px: 1.5 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={checked}
                                    onChange={(e) => {
                                      const current = answers[question.id] || [];
                                      if (e.target.checked) {
                                        handleAnswerChange(question.id, [...current, alt.id]);
                                      } else {
                                        handleAnswerChange(
                                          question.id,
                                          current.filter((id) => id !== alt.id),
                                        );
                                      }
                                    }}
                                  />
                                }
                                label={<Typography variant="body2">{alt.text}</Typography>}
                                sx={{ m: 0, width: '100%' }}
                              />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  </FormControl>
                )}
              </Box>
            );
          })}
        </Stack>
      )}

      {canSubmit && (
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          fullWidth
          size="large"
          sx={{ borderRadius: 2 }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : 'Enviar respostas'}
        </Button>
      )}

      {canRetry && (
        <Button
          variant="contained"
          onClick={handleRetry}
          fullWidth
          size="large"
          startIcon={<Replay />}
          sx={{ borderRadius: 2 }}
        >
          Tentar novamente ({remainingAttempts} restante{remainingAttempts === 1 ? '' : 's'})
        </Button>
      )}

      {!canSubmit && !canRetry && !isReviewMode && (
        <Alert severity="info">
          {hasApprovedAttempt
            ? 'Você já foi aprovado nesta atividade.'
            : remainingAttempts === 0
              ? 'Tentativas esgotadas. Conclua todas as aulas deste módulo para avançar ao próximo.'
              : 'Limite de tentativas atingido.'}
        </Alert>
      )}

      {result && (
        <ActivityResultDialog
          open={resultDialogOpen}
          onClose={() => setResultDialogOpen(false)}
          onRetry={handleRetry}
          canRetry={canRetry}
          result={{
            score: result.score,
            approved: result.approved,
            message: result.message,
            minimumScore: activity.minimumScore,
            attemptNumber: result.attemptNumber,
            attemptsRemaining: remainingAttempts,
          }}
        />
      )}
    </Stack>
  );
}
