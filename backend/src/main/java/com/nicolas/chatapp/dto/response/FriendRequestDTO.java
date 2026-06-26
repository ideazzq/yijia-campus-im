package com.nicolas.chatapp.dto.response;

import com.nicolas.chatapp.model.FriendRequest;
import com.nicolas.chatapp.model.FriendRequestStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Builder
public record FriendRequestDTO(
        UUID id,
        UserDTO sender,
        UserDTO receiver,
        String remarkName,
        FriendRequestStatus status,
        LocalDateTime createdAt,
        LocalDateTime respondedAt
) {

    public static FriendRequestDTO fromRequest(FriendRequest request) {
        if (Objects.isNull(request)) {
            return null;
        }

        return FriendRequestDTO.builder()
                .id(request.getId())
                .sender(UserDTO.fromUser(request.getSender()))
                .receiver(UserDTO.fromUser(request.getReceiver()))
                .remarkName(request.getRemarkName())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .respondedAt(request.getRespondedAt())
                .build();
    }

    public static List<FriendRequestDTO> fromRequests(Collection<FriendRequest> requests) {
        if (Objects.isNull(requests)) {
            return List.of();
        }

        return requests.stream()
                .map(FriendRequestDTO::fromRequest)
                .toList();
    }
}
