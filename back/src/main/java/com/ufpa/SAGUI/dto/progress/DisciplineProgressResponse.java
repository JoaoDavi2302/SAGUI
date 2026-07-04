package com.ufpa.SAGUI.dto.progress;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisciplineProgressResponse {

    private UUID disciplineId;
    private String disciplineName;
    private Integer totalModules;
    private Integer completedModules;
    private Integer overallPercentage;
    private List<ModuleProgressResponse> modules;
}