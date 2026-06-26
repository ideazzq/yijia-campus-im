package com.nicolas.chatapp.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "CONTACT_ENTRY",
        uniqueConstraints = @UniqueConstraint(columnNames = {"owner_id", "friend_id"})
)
public class ContactEntry {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User owner;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User friend;

    private String remarkName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof ContactEntry other)) {
            return false;
        }
        return Objects.equals(owner, other.getOwner()) && Objects.equals(friend, other.getFriend());
    }

    @Override
    public int hashCode() {
        return Objects.hash(owner, friend);
    }
}
