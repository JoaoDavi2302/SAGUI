package com.ufpa.SAGUI.service.activity;

import com.ufpa.SAGUI.models.activity.ActivityAttempt;
import com.ufpa.SAGUI.models.activity.Alternative;
import com.ufpa.SAGUI.models.activity.Question;
import com.ufpa.SAGUI.models.activity.StudentAnswer;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AutoCorrectionService {

    public Double correctAttempt(ActivityAttempt attempt) {
        double totalScore = 0.0;

        for (StudentAnswer answer : attempt.getAnswers()) {
            Question question = answer.getQuestion();

            boolean isCorrect = isAnswerCorrect(answer);

            answer.setCorrect(isCorrect);

            if (isCorrect) {
                totalScore += question.getScore();
            }
        }

        return totalScore;
    }

    private boolean isAnswerCorrect(StudentAnswer answer) {
        Question question = answer.getQuestion();

        List<Alternative> correctAlternatives = question.getAlternatives()
                .stream()
                .filter(Alternative::getCorrect)
                .toList();

        List<Alternative> selectedAlternatives = answer.getSelectedAlternatives();

        Set<UUID> correctIds = correctAlternatives
                .stream()
                .map(Alternative::getId)
                .collect(Collectors.toSet());

        Set<UUID> selectedIds = selectedAlternatives
                .stream()
                .map(Alternative::getId)
                .collect(Collectors.toSet());

        return correctIds.equals(selectedIds);
    }
}
