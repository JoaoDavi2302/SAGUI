package com.ufpa.SAGUI.dto.lesson;

import java.util.UUID;

import com.ufpa.SAGUI.dto.progress.ModuleProgressResponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LessonCompletionResponse {

    private UUID lessonId;
    private boolean completed;
    private ModuleProgressResponse moduleProgress;
}
