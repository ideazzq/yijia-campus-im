package com.nicolas.chatapp.service.implementation;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private final Set<UUID> onlineUsers = ConcurrentHashMap.newKeySet();
    private final Map<UUID, Set<String>> userSessions = new ConcurrentHashMap<>();
    private final Map<String, UUID> sessionUserMap = new ConcurrentHashMap<>();
    private final Map<UUID, LocalDateTime> lastSeenMap = new ConcurrentHashMap<>();

    public void markOnline(UUID userId) {
        onlineUsers.add(userId);
        lastSeenMap.put(userId, LocalDateTime.now());
    }

    public void markOffline(UUID userId) {
        onlineUsers.remove(userId);
        userSessions.remove(userId);
        lastSeenMap.put(userId, LocalDateTime.now());
    }

    public boolean isOnline(UUID userId) {
        return onlineUsers.contains(userId);
    }

    public Set<UUID> getOnlineUsers() {
        return new HashSet<>(onlineUsers);
    }

    public int getOnlineCount() {
        return onlineUsers.size();
    }

    public void bindSession(UUID userId, String sessionId) {
        onlineUsers.add(userId);
        userSessions.computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet()).add(sessionId);
        sessionUserMap.put(sessionId, userId);
        lastSeenMap.put(userId, LocalDateTime.now());
    }

    public void unbindSession(String sessionId) {
        UUID userId = sessionUserMap.remove(sessionId);
        if (userId == null) {
            return;
        }

        Set<String> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
                onlineUsers.remove(userId);
                lastSeenMap.put(userId, LocalDateTime.now());
            }
        }
    }

    public LocalDateTime getLastSeen(UUID userId) {
        return lastSeenMap.get(userId);
    }
}
