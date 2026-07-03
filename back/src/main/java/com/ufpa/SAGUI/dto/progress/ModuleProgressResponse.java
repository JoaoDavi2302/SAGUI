package com.ufpa.SAGUI.dto.progress;

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
public class ModuleProgressResponse {

    private UUID moduleId;
    private String moduleName;
    private Integer orderIndex;
    private Integer progressPercentage;
    private boolean completed;
    private boolean unlocked;
}
