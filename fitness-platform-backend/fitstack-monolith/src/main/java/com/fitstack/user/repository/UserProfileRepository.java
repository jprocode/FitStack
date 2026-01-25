package com.fitstack.user.repository;

import com.fitstack.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    // For cascade delete on account deletion
    void deleteByUserId(Long userId);
}
