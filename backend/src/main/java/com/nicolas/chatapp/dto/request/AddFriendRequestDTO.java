package com.nicolas.chatapp.dto.request;

import java.util.UUID;

public record AddFriendRequestDTO(UUID friendId, String remarkName) {
}
