package com.nicolas.chatapp.dto.response;

import lombok.Builder;

@Builder
public record AdminBroadcastResultDTO(
        String title,
        String content,
        int deliveredUsers,
        String sentAt
) {
}
