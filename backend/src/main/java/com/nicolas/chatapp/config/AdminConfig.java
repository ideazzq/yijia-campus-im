package com.nicolas.chatapp.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminConfig {

    private final AdminProperties adminProperties;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public AdminCredentials adminCredentials() {
        return new AdminCredentials(
                adminProperties.email(),
                passwordEncoder.encode(adminProperties.password()),
                adminProperties.displayName()
        );
    }
}
