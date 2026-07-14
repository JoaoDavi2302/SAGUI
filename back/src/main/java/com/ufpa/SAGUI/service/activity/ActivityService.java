package com.ufpa.SAGUI.service.activity;

import com.ufpa.SAGUI.dto.activity.ActivityRequest;
import com.ufpa.SAGUI.dto.activity.ActivityResponse;
import com.ufpa.SAGUI.dto.activity.ActivityStudentSummaryResponse;
import com.ufpa.SAGUI.dto.activity.ActivityTakeResponse;
import com.ufpa.SAGUI.dto.activity.AlternativeResponse;
import com.ufpa.SAGUI.dto.activity.AlternativeTakeResponse;
import com.ufpa.SAGUI.dto.activity.QuestionResponse;
import com.ufpa.SAGUI.dto.activity.QuestionTakeResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.activity.Activity;
import com.ufpa.SAGUI.models.activity.Alternative;
import com.ufpa.SAGUI.models.module.Module;
import com.ufpa.SAGUI.models.activity.Question;
import com.ufpa.SAGUI.repository.activity.ActivityAttemptRepository;
import com.ufpa.SAGUI.repository.activity.ActivityRepository;
import com.ufpa.SAGUI.repository.module.ModuleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import com.ufpa.SAGUI.service.enrollment.EnrollmentService;
import com.ufpa.SAGUI.service.progress.ProgressService;
import com.ufpa.SAGUI.service.security.ProfessorAuthorizationService;
@Service
@Transactional
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ActivityAttemptRepository activityAttemptRepository;
    private final ModuleRepository moduleRepository;
    private final ProfessorAuthorizationService professorAuthorizationService;
    private final EnrollmentService enrollmentService;
    private final ProgressService progressService;

    public ActivityService(
            ActivityRepository activityRepository,
            ActivityAttemptRepository activityAttemptRepository,
            ModuleRepository moduleRepository,
            ProfessorAuthorizationService professorAuthorizationService,
            EnrollmentService enrollmentService,
            ProgressService progressService
    ) {
        this.activityRepository = activityRepository;
        this.activityAttemptRepository = activityAttemptRepository;
        this.moduleRepository = moduleRepository;
        this.professorAuthorizationService = professorAuthorizationService;
        this.enrollmentService = enrollmentService;
        this.progressService = progressService;
    }

    // CREATE - Criar atividade
    public ActivityResponse createActivity(ActivityRequest request) {
        validateActivityRequest(request);

        Module module = moduleRepository.findById(request.moduleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Módulo não encontrado."));

        professorAuthorizationService.validateProfessorCanManageDiscipline(module.getDiscipline());

        Activity activity = new Activity();
        activity.setTitle(request.title());
        activity.setDescription(request.description());
        activity.setAttemptLimit(3);
        activity.setMinimumScore(70.0);
        activity.setModule(module);
        activity.setStatus(EntityStatus.Active);

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
    @Transactional(readOnly = true)
    public List<ActivityResponse> getAllActivities(EntityStatus status, UUID moduleId) {
        EntityStatus filterStatus = status != null ? status : EntityStatus.Active;

        if (moduleId == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "O parametro moduleId e obrigatorio para listar atividades.");
        }

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Modulo nao encontrado."));

        professorAuthorizationService.validateProfessorOrAdminCanAccessDiscipline(module.getDiscipline());

        return activityRepository.findAllByModule_IdAndStatus(moduleId, filterStatus)
                .stream()
                .map(this::toActivityResponse)
                .toList();
    }

    // READ - Listar atividades do módulo para aluno (sem gabarito)
    @Transactional(readOnly = true)
    public List<ActivityStudentSummaryResponse> getActivitiesForStudent(UUID moduleId, UUID studentId) {
        if (moduleId == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "O parametro moduleId e obrigatorio para listar atividades.");
        }

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Modulo nao encontrado."));

        enrollmentService.validateContentAccess(studentId, module.getDiscipline().getId());
        progressService.validateSequentialAccess(studentId, moduleId);
        validateModuleHasActiveActivity(moduleId);

        return activityRepository.findAllByModule_IdAndStatus(moduleId, EntityStatus.Active)
                .stream()
                .map(activity -> toActivityStudentSummary(activity, studentId))
                .toList();
    }

    // READ - Buscar atividade para responder (sem gabarito)
    @Transactional(readOnly = true)
    public ActivityTakeResponse getActivityForTake(UUID activityId, UUID studentId) {
        Activity activity = findActiveActivityById(activityId);
        validateStudentActivityAccess(studentId, activity);
        return toActivityTakeResponse(activity, studentId);
    }

    // READ - Buscar atividade por ID
    public ActivityResponse getActivityById(UUID id) {
        Activity activity = findActivityById(id);
        professorAuthorizationService.validateProfessorOrAdminCanAccessActivity(activity);
        return toActivityResponse(activity);
    }

    // UPDATE - Atualizar atividade
    public ActivityResponse updateActivity(UUID id, ActivityRequest request) {
        validateActivityRequest(request);

        Activity activity = findActivityById(id);
        ensureActivityIsActive(activity);
        professorAuthorizationService.validateProfessorCanManageActivity(activity);

        Module module = moduleRepository.findById(request.moduleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Módulo não encontrado."));

        professorAuthorizationService.validateProfessorCanManageDiscipline(module.getDiscipline());

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
        professorAuthorizationService.validateProfessorCanManageActivity(activity);

        UUID moduleId = activity.getModule().getId();
        long activeCount = activityRepository.countByModule_IdAndStatus(moduleId, EntityStatus.Active);
        if (activeCount <= 1) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Não é possível remover a última atividade do módulo. Cada módulo deve possuir pelo menos uma atividade.");
        }

        activity.setStatus(EntityStatus.Inactive);
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public void validateModuleHasActiveActivity(UUID moduleId) {
        long activeCount = activityRepository.countByModule_IdAndStatus(moduleId, EntityStatus.Active);
        if (activeCount == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Módulo sem atividades cadastradas");
        }
    }

    @Transactional(readOnly = true)
    public Activity findActiveActivityById(UUID id) {
        return activityRepository.findByIdAndStatus(id, EntityStatus.Active)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atividade não encontrada."));
    }

    public Activity findActivityById(UUID id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atividade não encontrada."));
    }

    private void ensureActivityIsActive(Activity activity) {
        if (activity.getStatus() != EntityStatus.Active) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível alterar uma atividade inativa.");
        }
    }

    // Valida os dados recebidos para criar/atualizar atividade
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

    private void validateStudentActivityAccess(UUID studentId, Activity activity) {
        Module module = activity.getModule();

        if (module == null || module.getDiscipline() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Atividade sem módulo ou disciplina associada.");
        }

        enrollmentService.validateContentAccess(studentId, module.getDiscipline().getId());
        progressService.validateSequentialAccess(studentId, module.getId());
        validateModuleHasActiveActivity(module.getId());
    }

    private ActivityStudentSummaryResponse toActivityStudentSummary(Activity activity, UUID studentId) {
        AttemptSummary summary = buildAttemptSummary(activity, studentId);

        return new ActivityStudentSummaryResponse(
                activity.getId(),
                activity.getModule().getId(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getAttemptLimit(),
                activity.getMinimumScore(),
                activity.getStatus(),
                summary.attemptsUsed(),
                summary.attemptsRemaining(),
                summary.bestScore(),
                summary.hasApprovedAttempt()
        );
    }

    private ActivityTakeResponse toActivityTakeResponse(Activity activity, UUID studentId) {
        AttemptSummary summary = buildAttemptSummary(activity, studentId);

        List<QuestionTakeResponse> questions = activity.getQuestions()
                .stream()
                .map(question -> {
                    List<AlternativeTakeResponse> alternatives = question.getAlternatives()
                            .stream()
                            .map(alternative -> new AlternativeTakeResponse(
                                    alternative.getId(),
                                    alternative.getText()
                            ))
                            .toList();

                    return new QuestionTakeResponse(
                            question.getId(),
                            question.getStatement(),
                            question.getQuestionType(),
                            question.getScore(),
                            alternatives
                    );
                })
                .toList();

        return new ActivityTakeResponse(
                activity.getId(),
                activity.getModule().getId(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getAttemptLimit(),
                activity.getMinimumScore(),
                summary.attemptsUsed(),
                summary.attemptsRemaining(),
                summary.bestScore(),
                summary.hasApprovedAttempt(),
                questions
        );
    }

    private AttemptSummary buildAttemptSummary(Activity activity, UUID studentId) {
        UUID activityId = activity.getId();
        long attemptsUsed = activityAttemptRepository.countByStudentIdAndActivityId(studentId, activityId);
        Double bestScore = activityAttemptRepository.findBestScoreByStudentIdAndActivityId(studentId, activityId);
        boolean hasApprovedAttempt = activityAttemptRepository
                .findByStudentIdAndActivityId(studentId, activityId)
                .stream()
                .anyMatch(attempt -> Boolean.TRUE.equals(attempt.getApproved()));
        int attemptsRemaining = Math.max(0, activity.getAttemptLimit() - (int) attemptsUsed);

        return new AttemptSummary((int) attemptsUsed, attemptsRemaining, bestScore, hasApprovedAttempt);
    }

    private record AttemptSummary(
            int attemptsUsed,
            int attemptsRemaining,
            Double bestScore,
            boolean hasApprovedAttempt
    ) {
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
                activity.getStatus(),
                questionResponses
        );
    }
}
