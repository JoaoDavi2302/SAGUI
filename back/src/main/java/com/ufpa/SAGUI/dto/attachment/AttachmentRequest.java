package com.ufpa.SAGUI.dto.attachment;

import java.util.UUID;

import com.ufpa.SAGUI.enums.AttachmentType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AttachmentRequest(
        @NotBlank(message = "O nome do material é obrigatório")
        @Size(max = 200)
        String name,

        @NotBlank(message = "A URL do material é obrigatória")
        String fileUrl,

        @NotNull(message = "O tipo do material é obrigatório")
        AttachmentType attachmentType,

        @NotNull(message = "O ID da aula é obrigatório")
        UUID lessonId) {
}
