package com.ufpa.SAGUI.models.activity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

import com.ufpa.SAGUI.models.common.BaseEntity;
@Entity
@Table(name = "student_answers")
public class StudentAnswer extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "activity_attempt_id", nullable = false)
    private ActivityAttempt activityAttempt;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToMany
    @JoinTable(
            name = "student_answer_alternatives",
            joinColumns = @JoinColumn(name = "student_answer_id"),
            inverseJoinColumns = @JoinColumn(name = "alternative_id")
    )
    private List<Alternative> selectedAlternatives = new ArrayList<>();

    @Column(nullable = false)
    private Boolean correct;

    public StudentAnswer() {
    }

    public ActivityAttempt getActivityAttempt() {
        return activityAttempt;
    }

    public void setActivityAttempt(ActivityAttempt activityAttempt) {
        this.activityAttempt = activityAttempt;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public List<Alternative> getSelectedAlternatives() {
        return selectedAlternatives;
    }

    public void setSelectedAlternatives(List<Alternative> selectedAlternatives) {
        this.selectedAlternatives = selectedAlternatives;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }
}
