package com.nicolas.chatapp.config;

public record AdminCredentials(
        String email,
        String encodedPassword,
        String displayName
) {
}
