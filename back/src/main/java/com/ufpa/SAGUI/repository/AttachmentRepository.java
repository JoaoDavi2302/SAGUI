package com.ufpa.SAGUI.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Attachment;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    List<Attachment> findAllByLesson_IdAndStatus(UUID lessonId, EntityStatus status);
}
