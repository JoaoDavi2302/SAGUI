package com.ufpa.SAGUI.service;

import com.ufpa.SAGUI.dto.activity.ActivityRequest;
import com.ufpa.SAGUI.dto.activity.ActivityResponse;
import com.ufpa.SAGUI.dto.activity.QuestionResponse;
import com.ufpa.SAGUI.dto.activity.AlternativeResponse;
import com.ufpa.SAGUI.models.Activity;
import com.ufpa.SAGUI.models.Question;
import com.ufpa.SAGUI.models.Alternative;
import com.ufpa.SAGUI.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    // CREATE - Criar atividade
    public ActivityResponse createActivity(ActivityRequest request) {
        validateActivityRequest(request);

        Activity activity = new Activity();
        activity.setTitle(request.title());
        activity.setDescription(request.description());
        activity.setAttemptLimit(3);
        activity.setMinimumScore(70.0);

        List<Question> questions = request.questions().stream().map(questionRequest -> {
            Question question = new Question();
            question.setStatement(questionRequest.statement());
            question.setQuestionType(questionRequest.questionType());
            question.setScore(questionRequest.score());
            question.setActivity(activity);

            List<Alternative> alternatives = questionRequest.alternatives().stream().map(alternativeRequest -> {
                Alternative alternative = new Alternative();
                alternative.setText(alternativeRequest.text());
                alternative.setCorrect(alternativeRequest.correct());
                alternative.setQuestion(question);
                return alternative;
            }).toList();

            question.setAlternatives(alternatives);

            return question;
        }).toList();

        activity.setQuestions(questions);

        Activity savedActivity = activityRepository.save(activity);

        return toActivityResponse(savedActivity);
    }

    // READ - Listar todas as atividades
    public List<ActivityResponse> getAllActivities() {
        return activityRepository.findAll()
                .stream()
                .map(this::toActivityResponse)
                .toList();
    }

    // READ - Buscar atividade por ID
    public ActivityResponse getActivityById(UUID id) {
        Activity activity = findActivityById(id);
        return toActivityResponse(activity);
    }

    // UPDATE - Atualizar atividade
    public ActivityResponse updateActivity(UUID id, ActivityRequest request) {
        validateActivityRequest(request);

        Activity activity = findActivityById(id);

        activity.setTitle(request.title());
        activity.setDescription(request.description());

        activity.getQuestions().clear();

        List<Question> questions = request.questions().stream().map(questionRequest -> {
            Question question = new Question();
            question.setStatement(questionRequest.statement());
            question.setQuestionType(questionRequest.questionType());
            question.setScore(questionRequest.score());
            question.setActivity(activity);

            List<Alternative> alternatives = questionRequest.alternatives().stream().map(alternativeRequest -> {
                Alternative alternative = new Alternative();
                alternative.setText(alternativeRequest.text());
                alternative.setCorrect(alternativeRequest.correct());
                alternative.setQuestion(question);
                return alternative;
            }).toList();

            question.setAlternatives(alternatives);

            return question;
        }).toList();

        activity.getQuestions().addAll(questions);

        Activity updatedActivity = activityRepository.save(activity);

        return toActivityResponse(updatedActivity);
    }

    // DELETE - Remover atividade
    public void deleteActivity(UUID id) {
        Activity activity = findActivityById(id);
        activityRepository.delete(activity);
    }

    // Método auxiliar para buscar a atividade ou lançar erro
    private Activity findActivityById(UUID id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Atividade não encontrada."));
    }

    // Validação básica da atividade
    private void validateActivityRequest(ActivityRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new RuntimeException("O título da atividade é obrigatório.");
        }

        if (request.questions() == null || request.questions().isEmpty()) {
            throw new RuntimeException("A atividade deve possuir pelo menos uma questão.");
        }

        request.questions().forEach(question -> {
            if (question.statement() == null || question.statement().isBlank()) {
                throw new RuntimeException("O enunciado da questão é obrigatório.");
            }

            if (question.questionType() == null) {
                throw new RuntimeException("O tipo da questão é obrigatório.");
            }

            if (question.alternatives() == null || question.alternatives().isEmpty()) {
                throw new RuntimeException("A questão deve possuir alternativas.");
            }

            long correctAlternatives = question.alternatives()
                    .stream()
                    .filter(alternative -> Boolean.TRUE.equals(alternative.correct()))
                    .count();

            switch (question.questionType()) {
                case SINGLE_CHOICE:
                    if (correctAlternatives != 1) {
                        throw new RuntimeException("Questões de resposta única devem possuir exatamente uma alternativa correta.");
                    }
                    break;

                case TRUE_FALSE:
                    if (question.alternatives().size() != 2) {
                        throw new RuntimeException("Questões verdadeiro/falso devem possuir exatamente duas alternativas.");
                    }

                    if (correctAlternatives != 1) {
                        throw new RuntimeException("Questões verdadeiro/falso devem possuir exatamente uma alternativa correta.");
                    }
                    break;

                case MULTIPLE_CHOICE:
                    if (correctAlternatives < 1) {
                        throw new RuntimeException("Questões de múltipla seleção devem possuir pelo menos uma alternativa correta.");
                    }
                    break;

                default:
                    throw new RuntimeException("Tipo de questão inválido.");
            }
        });
    }

    // Converte entidade Activity para DTO de resposta
    private ActivityResponse toActivityResponse(Activity activity) {
        List<QuestionResponse> questionResponses = activity.getQuestions()
                .stream()
                .map(question -> {
                    List<AlternativeResponse> alternativeResponses = question.getAlternatives()
                            .stream()
                            .map(alternative -> new AlternativeResponse(
                                    alternative.getId(),
                                    alternative.getText(),
                                    alternative.getCorrect()
                            ))
                            .toList();

                    return new QuestionResponse(
                            question.getId(),
                            question.getStatement(),
                            question.getQuestionType(),
                            question.getScore(),
                            alternativeResponses
                    );
                })
                .toList();

        return new ActivityResponse(
                activity.getId(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getAttemptLimit(),
                activity.getMinimumScore(),
                questionResponses
        );
    }
}
