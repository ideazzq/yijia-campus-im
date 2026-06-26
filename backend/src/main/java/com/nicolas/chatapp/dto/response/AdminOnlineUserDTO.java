package com.nicolas.chatapp.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record AdminOnlineUserDTO(
        UUID id,
        String fullName,
        String email,
        String phoneNumber,
        String yijiaId,
        boolean online,
        LocalDateTime lastSeen
) {

    public static AdminOnlineUserDTO from(UserPresenceDTO user, LocalDateTime lastSeen) {
        return AdminOnlineUserDTO.builder()
                .id(user.id())
                .fullName(user.fullName())
                .email(user.email())
                .phoneNumber(user.phoneNumber())
                .yijiaId(user.yijiaId())
                .online(user.online())
                .lastSeen(lastSeen)
                .build();
    }
}
