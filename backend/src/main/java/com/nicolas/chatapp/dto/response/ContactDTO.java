package com.nicolas.chatapp.dto.response;

import com.nicolas.chatapp.model.ContactEntry;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Builder
public record ContactDTO(
        UUID id,
        UserDTO friend,
        String remarkName,
        LocalDateTime createdAt
) {

    public static ContactDTO fromContact(ContactEntry contactEntry) {
        if (Objects.isNull(contactEntry)) {
            return null;
        }
        return ContactDTO.builder()
                .id(contactEntry.getId())
                .friend(UserDTO.fromUser(contactEntry.getFriend()))
                .remarkName(contactEntry.getRemarkName())
                .createdAt(contactEntry.getCreatedAt())
                .build();
    }

    public static List<ContactDTO> fromContacts(Collection<ContactEntry> contactEntries) {
        if (Objects.isNull(contactEntries)) {
            return List.of();
        }
        return contactEntries.stream()
                .map(ContactDTO::fromContact)
                .toList();
    }
}
