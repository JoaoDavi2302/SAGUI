package com.ufpa.SAGUI.service;

import com.ufpa.SAGUI.dto.activity.ActivityRequest;
import com.ufpa.SAGUI.dto.activity.ActivityResponse;
import com.ufpa.SAGUI.dto.activity.AlternativeResponse;
import com.ufpa.SAGUI.dto.activity.QuestionResponse;
import com.ufpa.SAGUI.models.Activity;
import com.ufpa.SAGUI.models.Alternative;
import com.ufpa.SAGUI.models.Module;
import com.ufpa.SAGUI.models.Question;
import com.ufpa.SAGUI.repository.ActivityRepository;
import com.ufpa.SAGUI.repository.ActivityAttemptRepository;
import com.ufpa.SAGUI.repository.ModuleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ActivityAttemptRepository activityAttemptRepository;
    private final ModuleRepository moduleRepository;

    public ActivityService(
            ActivityRepository activityRepository,
            ActivityAttemptRepository activityAttemptRepository,
            ModuleRepository moduleRepository
    ) {
        this.activityRepository = activityRepository;
        this.activityAttemptRepository = activityAttemptRepository;
        this.moduleRepository = moduleRepository;
    }

    // CREATE - Criar atividade
    public ActivityResponse createActivity(ActivityRequest request) {
        validateActivityRequest(request);

        Module module = moduleRepository.findById(request.moduleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Módulo não encontrado."));

        Activity activity = new Activity();
        activity.setTitle(request.title());
        activity.setDescription(request.description());
        activity.setAttemptLimit(3);
        activity.setMinimumScore(70.0);
        activity.setModule(module);

        List<Question> questions = request.questions()
                .stream()
                .map(questionRequest -> {
                    Question question = new Question();
                    question.setStatement(questionRequest.statement());
                    question.setQuestionType(questionRequest.questionType());
                    question.setScore(questionRequest.score());
                    question.setActivity(activity);

                    List<Alternative> alternatives = questionRequest.alternatives()
                            .stream()
                            .map(alternativeRequest -> {
                                Alternative alternative = new Alternative();
                                alternative.setText(alternativeRequest.text());
                                alternative.setCorrect(alternativeRequest.correct());
                                alternative.setQuestion(question);
                                return alternative;
                            })
                            .toList();

                    question.setAlternatives(alternatives);

                    return question;
                })
                .toList();

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

        Module module = moduleRepository.findById(request.moduleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Módulo não encontrado."));

        activity.setTitle(request.title());
        activity.setDescription(request.description());
        activity.setModule(module);

        activity.getQuestions().clear();

        List<Question> questions = request.questions()
                .stream()
                .map(questionRequest -> {
                    Question question = new Question();
                    question.setStatement(questionRequest.statement());
                    question.setQuestionType(questionRequest.questionType());
                    question.setScore(questionRequest.score());
                    question.setActivity(activity);

                    List<Alternative> alternatives = questionRequest.alternatives()
                            .stream()
                            .map(alternativeRequest -> {
                                Alternative alternative = new Alternative();
                                alternative.setText(alternativeRequest.text());
                                alternative.setCorrect(alternativeRequest.correct());
                                alternative.setQuestion(question);
                                return alternative;
                            })
                            .toList();

                    question.setAlternatives(alternatives);

                    return question;
                })
                .toList();

        activity.getQuestions().addAll(questions);

        Activity updatedActivity = activityRepository.save(activity);

        return toActivityResponse(updatedActivity);
    }

    // DELETE - Remover atividade
    public void deleteActivity(UUID id) {
        Activity activity = findActivityById(id);

        if (activityAttemptRepository.countByActivityId(id) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível excluir uma atividade que já possui tentativas registradas.");
        }

        activityRepository.delete(activity);
    }

    private Activity findActivityById(UUID id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atividade não encontrada."));
    }

    private void validateActivityRequest(ActivityRequest request) {
        if (request.moduleId() == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "O módulo da atividade é obrigatório.");
        }

        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "O título da atividade é obrigatório.");
        }

        if (request.questions() == null || request.questions().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "A atividade deve possuir pelo menos uma questão.");
        }

        request.questions().forEach(question -> {
            if (question.statement() == null || question.statement().isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "O enunciado da questão é obrigatório.");
            }

            if (question.questionType() == null) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "O tipo da questão é obrigatório.");
            }

            if (question.score() == null || question.score() <= 0) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "A pontuação da questão deve ser maior que zero.");
            }

            if (question.alternatives() == null || question.alternatives().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "A questão deve possuir alternativas.");
            }

            long correctAlternatives = question.alternatives()
                    .stream()
                    .filter(alternative -> Boolean.TRUE.equals(alternative.correct()))
                    .count();

            switch (question.questionType()) {
                case SINGLE_CHOICE:
                    if (correctAlternatives != 1) {
                        throw new ResponseStatusException(
                                HttpStatus.UNPROCESSABLE_ENTITY,
                                "Questões de resposta única devem possuir exatamente uma alternativa correta.");
                    }
                    break;

                case TRUE_FALSE:
                    if (question.alternatives().size() != 2) {
                        throw new ResponseStatusException(
                                HttpStatus.UNPROCESSABLE_ENTITY,
                                "Questões verdadeiro/falso devem possuir exatamente duas alternativas.");
                    }

                    if (correctAlternatives != 1) {
                        throw new ResponseStatusException(
                                HttpStatus.UNPROCESSABLE_ENTITY,
                                "Questões verdadeiro/falso devem possuir exatamente uma alternativa correta.");
                    }
                    break;

                case MULTIPLE_CHOICE:
                    if (correctAlternatives < 1) {
                        throw new ResponseStatusException(
                                HttpStatus.UNPROCESSABLE_ENTITY,
                                "Questões de múltipla seleção devem possuir pelo menos uma alternativa correta.");
                    }
                    break;

                default:
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Tipo de questão inválido.");
            }
        });
    }

    // Converte Activity para ActivityResponse
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
                activity.getModule().getId(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getAttemptLimit(),
                activity.getMinimumScore(),
                questionResponses
        );
    }
}
