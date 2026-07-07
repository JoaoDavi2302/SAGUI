package com.ufpa.SAGUI.dto.activity;

import java.util.UUID;

public record AlternativeResponse(
        UUID id,
        String text,
        Boolean correct
) {
}
