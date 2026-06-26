package com.nicolas.chatapp.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "FRIEND_REQUEST",
        uniqueConstraints = @UniqueConstraint(columnNames = {"sender_id", "receiver_id"})
)
public class FriendRequest {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User sender;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User receiver;

    private String remarkName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendRequestStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime respondedAt;
}
