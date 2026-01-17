package com.fitstack.nutrition.repository;

import com.fitstack.nutrition.entity.CustomFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomFoodRepository extends JpaRepository<CustomFood, Long> {

    List<CustomFood> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT cf FROM CustomFood cf WHERE cf.userId = :userId AND LOWER(cf.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<CustomFood> searchByUserIdAndName(@Param("userId") Long userId, @Param("query") String query);

    @Query("SELECT cf FROM CustomFood cf WHERE cf.userId = :userId AND cf.id = :id")
    CustomFood findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
