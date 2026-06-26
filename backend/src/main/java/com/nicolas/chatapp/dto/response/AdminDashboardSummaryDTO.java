package com.nicolas.chatapp.dto.response;

import lombok.Builder;

@Builder
public record AdminDashboardSummaryDTO(
        int onlineUsers,
        long totalUsers,
        long totalChats,
        long totalMessages,
        String serverTime,
        boolean packetEncryptionEnabled
) {
}
