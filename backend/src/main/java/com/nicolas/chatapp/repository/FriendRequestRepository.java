package com.nicolas.chatapp.repository;

import com.nicolas.chatapp.model.FriendRequest;
import com.nicolas.chatapp.model.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {

    Optional<FriendRequest> findBySender_IdAndReceiver_Id(UUID senderId, UUID receiverId);

    List<FriendRequest> findByReceiver_IdAndStatusOrderByCreatedAtDesc(UUID receiverId, FriendRequestStatus status);

    List<FriendRequest> findBySender_IdAndStatusOrderByCreatedAtDesc(UUID senderId, FriendRequestStatus status);
}
