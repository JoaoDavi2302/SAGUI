package com.ufpa.SAGUI.models.activity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.ufpa.SAGUI.models.common.BaseEntity;
@Entity
@Table(name = "alternatives")
public class Alternative extends BaseEntity {

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private Boolean correct;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    public Alternative() {
    }

    public Alternative(String text, Boolean correct, Question question) {
        this.text = text;
        this.correct = correct;
        this.question = question;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }
}
