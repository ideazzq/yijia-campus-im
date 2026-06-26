package com.nicolas.chatapp.dto.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record UserPresenceDTO(
        UUID id,
        String email,
        String fullName,
        String phoneNumber,
        String yijiaId,
        boolean online) {

    public static UserPresenceDTO fromUser(UserDTO user, boolean online) {
        return UserPresenceDTO.builder()
                .id(user.id())
                .email(user.email())
                .fullName(user.fullName())
                .phoneNumber(user.phoneNumber())
                .yijiaId(user.yijiaId())
                .online(online)
                .build();
    }
}
