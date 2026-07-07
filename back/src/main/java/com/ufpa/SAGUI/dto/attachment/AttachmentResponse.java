package com.ufpa.SAGUI.dto.attachment;

import java.util.UUID;

import com.ufpa.SAGUI.enums.AttachmentType;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Attachment;
import com.ufpa.SAGUI.util.YouTubeUrlValidator;

public record AttachmentResponse(
        UUID id,
        String name,
        String fileUrl,
        AttachmentType attachmentType,
        UUID lessonId,
        EntityStatus status,
        String videoId) {

    public static AttachmentResponse from(Attachment attachment) {
        AttachmentType type = attachment.getAttachmentType();
        String videoId = type == AttachmentType.VIDEO
                ? YouTubeUrlValidator.extractVideoId(attachment.getFileUrl()).orElse(null)
                : null;

        return new AttachmentResponse(
                attachment.getId(),
                attachment.getName(),
                attachment.getFileUrl(),
                type,
                attachment.getLesson() != null ? attachment.getLesson().getId() : null,
                attachment.getStatus(),
                videoId);
    }
}
