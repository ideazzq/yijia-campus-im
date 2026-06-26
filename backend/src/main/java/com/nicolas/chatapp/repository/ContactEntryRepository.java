package com.nicolas.chatapp.repository;

import com.nicolas.chatapp.model.ContactEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactEntryRepository extends JpaRepository<ContactEntry, UUID> {

    List<ContactEntry> findByOwner_IdOrderByCreatedAtAsc(UUID ownerId);

    Optional<ContactEntry> findByOwner_IdAndFriend_Id(UUID ownerId, UUID friendId);
}
