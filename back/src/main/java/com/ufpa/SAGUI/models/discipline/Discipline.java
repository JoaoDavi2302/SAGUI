package com.ufpa.SAGUI.models.discipline;

import java.util.List;

import com.ufpa.SAGUI.models.common.BaseEntity;
import com.ufpa.SAGUI.models.course.Course;
import com.ufpa.SAGUI.models.module.Module;
import com.ufpa.SAGUI.models.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "disciplines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discipline extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "responsible_professor_id", nullable = false)
    private User responsibleProfessor;

    @OneToMany(mappedBy = "discipline")
    private List<Module> modules;

}
