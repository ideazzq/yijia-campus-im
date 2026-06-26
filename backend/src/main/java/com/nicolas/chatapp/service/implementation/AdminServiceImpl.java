package com.nicolas.chatapp.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nicolas.chatapp.dto.request.AdminBroadcastRequestDTO;
import com.nicolas.chatapp.dto.response.AdminBroadcastResultDTO;
import com.nicolas.chatapp.dto.response.AdminDashboardSummaryDTO;
import com.nicolas.chatapp.dto.response.AdminOnlineUserDTO;
import com.nicolas.chatapp.dto.response.EncryptedPacketDTO;
import com.nicolas.chatapp.dto.response.UserDTO;
import com.nicolas.chatapp.dto.response.UserPresenceDTO;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.repository.ChatRepository;
import com.nicolas.chatapp.repository.MessageRepository;
import com.nicolas.chatapp.repository.UserRepository;
import com.nicolas.chatapp.service.AdminService;
import com.nicolas.chatapp.service.PacketEncryptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;
    private final PacketEncryptionService packetEncryptionService;
    private final ObjectMapper objectMapper;

    @Override
    public AdminDashboardSummaryDTO getDashboardSummary() {
        return AdminDashboardSummaryDTO.builder()
                .onlineUsers(presenceService.getOnlineCount())
                .totalUsers(userRepository.count())
                .totalChats(chatRepository.count())
                .totalMessages(messageRepository.count())
                .serverTime(LocalDateTime.now().toString())
                .packetEncryptionEnabled(true)
                .build();
    }

    @Override
    public List<AdminOnlineUserDTO> getUsersWithPresence() {
        return userRepository.findAll().stream()
                .map(UserDTO::fromUser)
                .map(user -> UserPresenceDTO.fromUser(user, presenceService.isOnline(user.id())))
                .map(user -> AdminOnlineUserDTO.from(user, presenceService.getLastSeen(user.id())))
                .toList();
    }

    @Override
    public AdminBroadcastResultDTO broadcastMessage(AdminBroadcastRequestDTO request) {
        String title = request.title() == null || request.title().isBlank() ? "系统广播" : request.title().trim();
        String content = request.content() == null ? "" : request.content().trim();
        String issuedAt = LocalDateTime.now().toString();

        List<User> users = userRepository.findAll();
        for (User user : users) {
            String payload = buildBroadcastPayload(title, content, issuedAt);
            EncryptedPacketDTO packet = EncryptedPacketDTO.builder()
                    .type("ADMIN_BROADCAST")
                    .title(title)
                    .encryptedPayload(packetEncryptionService.encrypt(payload))
                    .issuedAt(issuedAt)
                    .build();
            messagingTemplate.convertAndSend("/topic/" + user.getId(), packet);
        }

        return AdminBroadcastResultDTO.builder()
                .title(title)
                .content(content)
                .deliveredUsers(users.size())
                .sentAt(issuedAt)
                .build();
    }

    private String buildBroadcastPayload(String title, String content, String issuedAt) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "title", title,
                    "content", content,
                    "issuedAt", issuedAt
            ));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("广播消息封装失败", e);
        }
    }
}
