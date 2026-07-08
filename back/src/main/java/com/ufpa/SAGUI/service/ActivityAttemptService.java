package com.ufpa.SAGUI.service;

import com.ufpa.SAGUI.dto.activity.ActivityAttemptDetailResponse;
import com.ufpa.SAGUI.dto.activity.ActivityAttemptPageResponse;
import com.ufpa.SAGUI.dto.activity.ActivityAttemptResultResponse;
import com.ufpa.SAGUI.dto.activity.ActivitySubmissionRequest;
import com.ufpa.SAGUI.dto.activity.MyActivityAttemptsResponse;
import com.ufpa.SAGUI.dto.activity.StudentAnswerRequest;
import com.ufpa.SAGUI.dto.activity.StudentOwnAttemptResponse;
import org.springframework.data.domain.Pageable;
import com.ufpa.SAGUI.enums.AttemptStatus;
import com.ufpa.SAGUI.models.Activity;
import com.ufpa.SAGUI.models.ActivityAttempt;
import com.ufpa.SAGUI.models.Alternative;
import com.ufpa.SAGUI.models.Module;
import com.ufpa.SAGUI.models.Question;
import com.ufpa.SAGUI.models.StudentAnswer;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.ActivityAttemptRepository;
import com.ufpa.SAGUI.repository.AlternativeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ActivityAttemptService {

    private final ActivityAttemptRepository activityAttemptRepository;
    private final AlternativeRepository alternativeRepository;
    private final AutoCorrectionService autoCorrectionService;
    private final EnrollmentService enrollmentService;
    private final ProgressService progressService;
    private final ActivityService activityService;
    private final ProfessorAuthorizationService professorAuthorizationService;

    public ActivityAttemptService(
            ActivityAttemptRepository activityAttemptRepository,
            AlternativeRepository alternativeRepository,
            AutoCorrectionService autoCorrectionService,
            EnrollmentService enrollmentService,
            ProgressService progressService,
            ActivityService activityService,
            ProfessorAuthorizationService professorAuthorizationService
    ) {
        this.activityAttemptRepository = activityAttemptRepository;
        this.alternativeRepository = alternativeRepository;
        this.autoCorrectionService = autoCorrectionService;
        this.enrollmentService = enrollmentService;
        this.progressService = progressService;
        this.activityService = activityService;
        this.professorAuthorizationService = professorAuthorizationService;
    }

    @Transactional(readOnly = true)
    public ActivityAttemptPageResponse listAttempts(
            UUID activityId,
            UUID studentId,
            Boolean approved,
            Pageable pageable
    ) {
        Activity activity = activityService.findActivityById(activityId);
        professorAuthorizationService.validateProfessorOrAdminCanAccessActivity(activity);

        return ActivityAttemptPageResponse.from(
                activityAttemptRepository.findByActivityWithFilters(
                        activityId, studentId, approved, pageable));
    }

    @Transactional(readOnly = true)
    public ActivityAttemptDetailResponse getAttemptDetail(UUID activityId, UUID attemptId) {
        Activity activity = activityService.findActivityById(activityId);
        professorAuthorizationService.validateProfessorOrAdminCanAccessActivity(activity);

        ActivityAttempt attempt = activityAttemptRepository.findByIdAndActivity_Id(attemptId, activityId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tentativa nao encontrada para esta atividade."));

        return ActivityAttemptDetailResponse.from(attempt);
    }

    @Transactional(readOnly = true)
    public MyActivityAttemptsResponse getMyAttempts(UUID activityId) {
        User student = getAuthenticatedStudent();
        Activity activity = activityService.findActiveActivityById(activityId);
        validateStudentActivityAccess(student, activity);

        UUID studentId = student.getId();
        long attemptsUsed = activityAttemptRepository.countByStudentIdAndActivityId(studentId, activityId);
        Double bestScore = activityAttemptRepository.findBestScoreByStudentIdAndActivityId(studentId, activityId);
        boolean hasApprovedAttempt = activityAttemptRepository
                .findByStudentIdAndActivityId(studentId, activityId)
                .stream()
                .anyMatch(attempt -> Boolean.TRUE.equals(attempt.getApproved()));
        int attemptsRemaining = Math.max(0, activity.getAttemptLimit() - (int) attemptsUsed);

        List<StudentOwnAttemptResponse> attempts = activityAttemptRepository
                .findByStudentIdAndActivityId(studentId, activityId)
                .stream()
                .sorted(Comparator.comparing(ActivityAttempt::getCreatedATt).reversed())
                .map(attempt -> new StudentOwnAttemptResponse(
                        attempt.getId(),
                        attempt.getAttemptNumber(),
                        attempt.getScore(),
                        attempt.getApproved(),
                        attempt.getAttemptStatus(),
                        attempt.getCreatedATt()
                ))
                .toList();

        return new MyActivityAttemptsResponse(
                activity.getId(),
                activity.getTitle(),
                activity.getAttemptLimit(),
                activity.getMinimumScore(),
                (int) attemptsUsed,
                attemptsRemaining,
                bestScore,
                hasApprovedAttempt,
                attempts
        );
    }

    @Transactional(readOnly = true)
    public ActivityAttemptDetailResponse getMyAttemptDetail(UUID activityId, UUID attemptId) {
        User student = getAuthenticatedStudent();
        Activity activity = activityService.findActiveActivityById(activityId);
        validateStudentActivityAccess(student, activity);

        ActivityAttempt attempt = activityAttemptRepository
                .findByIdAndActivity_IdAndStudent_Id(attemptId, activityId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tentativa nao encontrada para esta atividade."));

        return ActivityAttemptDetailResponse.from(attempt);
    }

    @Transactional
    public ActivityAttemptResultResponse submitActivity(
            UUID activityId,
            ActivitySubmissionRequest request
    ) {
        User student = getAuthenticatedStudent();

        Activity activity = activityService.findActiveActivityById(activityId);

        validateStudentActivityAccess(student, activity);

        long previousAttempts = activityAttemptRepository
                .countByStudentIdAndActivityId(student.getId(), activity.getId());

        if (previousAttempts >= activity.getAttemptLimit()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Limite de tentativas atingido.");
        }

        ActivityAttempt attempt = new ActivityAttempt();
        attempt.setStudent(student);
        attempt.setActivity(activity);
        attempt.setAttemptNumber((int) previousAttempts + 1);
        attempt.setScore(0.0);
        attempt.setApproved(false);
        attempt.setAttemptStatus(AttemptStatus.FINISHED);

        List<StudentAnswer> answers = request.answers()
                .stream()
                .map(answerRequest -> createStudentAnswer(answerRequest, attempt, activity))
                .toList();

        attempt.setAnswers(answers);

        Double finalScore = autoCorrectionService.correctAttempt(attempt);

        attempt.setScore(finalScore);
        attempt.setApproved(finalScore >= activity.getMinimumScore());

        ActivityAttempt savedAttempt = activityAttemptRepository.save(attempt);

        String message = savedAttempt.getApproved()
                ? "Atividade enviada com sucesso. Aluno aprovado."
                : "Atividade enviada com sucesso. Aluno não aprovado.";

        return new ActivityAttemptResultResponse(
                savedAttempt.getId(),
                savedAttempt.getAttemptNumber(),
                savedAttempt.getScore(),
                savedAttempt.getApproved(),
                message
        );
    }

    private StudentAnswer createStudentAnswer(
            StudentAnswerRequest answerRequest,
            ActivityAttempt attempt,
            Activity activity
    ) {
        Question question = activity.getQuestions()
                .stream()
                .filter(q -> q.getId().equals(answerRequest.questionId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Questão não pertence à atividade informada."));

        List<Alternative> selectedAlternatives = alternativeRepository
                .findAllById(answerRequest.selectedAlternativeIds());

        if (selectedAlternatives.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nenhuma alternativa selecionada.");
        }

        boolean allAlternativesBelongToQuestion = selectedAlternatives
                .stream()
                .allMatch(alternative -> alternative.getQuestion().getId().equals(question.getId()));

        if (!allAlternativesBelongToQuestion) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Uma ou mais alternativas não pertencem à questão informada.");
        }

        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setActivityAttempt(attempt);
        studentAnswer.setQuestion(question);
        studentAnswer.setSelectedAlternatives(selectedAlternatives);
        studentAnswer.setCorrect(false);

        return studentAnswer;
    }

    private void validateEnrollmentForActivity(User student, Activity activity) {
        Module module = activity.getModule();

        if (module == null || module.getDiscipline() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Atividade sem módulo ou disciplina associada.");
        }

        enrollmentService.validateContentAccess(student.getId(), module.getDiscipline().getId());
        progressService.validateSequentialAccess(student.getId(), module.getId());
    }

    private void validateStudentActivityAccess(User student, Activity activity) {
        validateEnrollmentForActivity(student, activity);

        Module module = activity.getModule();
        if (module != null) {
            progressService.validateSequentialAccess(student.getId(), module.getId());
        }
    }

    private User getAuthenticatedStudent() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário não autenticado.");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof User user) {
            return user;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não foi possível identificar o aluno autenticado.");
    }
}
