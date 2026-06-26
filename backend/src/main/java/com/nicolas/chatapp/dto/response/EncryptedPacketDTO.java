package com.nicolas.chatapp.dto.response;

import lombok.Builder;

@Builder
public record EncryptedPacketDTO(
        String type,
        String title,
        String encryptedPayload,
        String issuedAt
) {
}
