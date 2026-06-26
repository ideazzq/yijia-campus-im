package com.nicolas.chatapp.repository;

import com.nicolas.chatapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findByYijiaId(String yijiaId);

    @Query("""
            SELECT u FROM APP_USER u
            WHERE LOWER(u.email) = LOWER(:identifier)
               OR u.phoneNumber = :identifier
               OR LOWER(u.yijiaId) = LOWER(:identifier)
            """)
    Optional<User> findByLoginIdentifier(@Param("identifier") String identifier);

    @Query("SELECT u FROM APP_USER u WHERE u.fullName LIKE %:fullName%")
    List<User> findByFullName(@Param("fullName") String fullName);

    @Query("""
            SELECT u FROM APP_USER u
            WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
               OR u.phoneNumber LIKE CONCAT('%', :query, '%')
               OR LOWER(u.yijiaId) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    List<User> findByQuery(@Param("query") String query);
}
