package com.ufpa.SAGUI.models.module;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.ufpa.SAGUI.models.attachment.Attachment;
import com.ufpa.SAGUI.models.common.BaseEntity;
import com.ufpa.SAGUI.models.discipline.Discipline;
import com.ufpa.SAGUI.models.lesson.Lesson;
@Entity
@Table(name = "modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Module extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer orderIndex;

    @ManyToOne
    @JoinColumn(name = "discipline_id", nullable = false)
    private Discipline discipline;

    @OneToMany(mappedBy = "module")
    private List<Lesson> lessons;

    @OneToMany(mappedBy = "module")
    private List<Attachment> attachments;
}
