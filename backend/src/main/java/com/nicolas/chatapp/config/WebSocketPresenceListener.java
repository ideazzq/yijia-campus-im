package com.nicolas.chatapp.config;

import com.nicolas.chatapp.repository.UserRepository;
import com.nicolas.chatapp.service.implementation.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketPresenceListener {

    private final PresenceService presenceService;
    private final UserRepository userRepository;

    @EventListener
    public void handleSessionConnected(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal == null || principal.getName() == null) {
            return;
        }

        userRepository.findByEmail(principal.getName()).ifPresent(user -> {
            presenceService.bindSession(user.getId(), accessor.getSessionId());
            log.info("WebSocket session {} connected for {}", accessor.getSessionId(), user.getEmail());
        });
    }

    @EventListener
    public void handleSessionDisconnected(SessionDisconnectEvent event) {
        presenceService.unbindSession(event.getSessionId());
        log.info("WebSocket session {} disconnected", event.getSessionId());
    }
}
