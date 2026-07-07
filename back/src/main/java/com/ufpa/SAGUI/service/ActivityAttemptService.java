package com.ufpa.SAGUI.service;

import com.ufpa.SAGUI.dto.activity.ActivityAttemptResultResponse;
import com.ufpa.SAGUI.dto.activity.ActivitySubmissionRequest;
import com.ufpa.SAGUI.dto.activity.StudentAnswerRequest;
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

import java.util.List;
import java.util.UUID;

@Service
public class ActivityAttemptService {

    private final ActivityAttemptRepository activityAttemptRepository;
    private final AlternativeRepository alternativeRepository;
    private final AutoCorrectionService autoCorrectionService;
    private final EnrollmentService enrollmentService;
    private final ActivityService activityService;

    public ActivityAttemptService(
            ActivityAttemptRepository activityAttemptRepository,
            AlternativeRepository alternativeRepository,
            AutoCorrectionService autoCorrectionService,
            EnrollmentService enrollmentService,
            ActivityService activityService
    ) {
        this.activityAttemptRepository = activityAttemptRepository;
        this.alternativeRepository = alternativeRepository;
        this.autoCorrectionService = autoCorrectionService;
        this.enrollmentService = enrollmentService;
        this.activityService = activityService;
    }

    @Transactional
    public ActivityAttemptResultResponse submitActivity(
            UUID activityId,
            ActivitySubmissionRequest request
    ) {
        User student = getAuthenticatedStudent();

        Activity activity = activityService.findActiveActivityById(activityId);

        validateEnrollmentForActivity(student, activity);

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
