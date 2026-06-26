package com.nicolas.chatapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.encryption")
public record EncryptionProperties(
        String secret
) {
}
