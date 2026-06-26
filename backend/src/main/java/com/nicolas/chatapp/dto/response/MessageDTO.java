package com.nicolas.chatapp.dto.response;

import com.nicolas.chatapp.model.Message;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Builder
public record MessageDTO(
        UUID id,
        String content,
        String fileName,
        String fileType,
        Long fileSize,
        String fileDownloadUrl,
        LocalDateTime timeStamp,
        UserDTO user,
        Set<UUID> readBy) {

    public static MessageDTO fromMessage(Message message) {
        if (Objects.isNull(message)) return null;
        return MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .fileName(message.getFileName())
                .fileType(message.getFileType())
                .fileSize(message.getFileSize())
                .fileDownloadUrl(Objects.nonNull(message.getFilePath()) ? "/api/messages/file/" + message.getId() : null)
                .timeStamp(message.getTimeStamp())
                .user(UserDTO.fromUser(message.getUser()))
                .readBy(new HashSet<>(message.getReadBy()))
                .build();
    }

    public static List<MessageDTO> fromMessages(Collection<Message> messages) {
        if (Objects.isNull(messages)) return List.of();
        return messages.stream()
                .sorted(Comparator.comparing(Message::getTimeStamp))
                .map(MessageDTO::fromMessage)
                .toList();
    }
}
