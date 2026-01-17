package com.fitstack.nutrition.repository;

import com.fitstack.nutrition.entity.Meal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealRepository extends JpaRepository<Meal, Long> {

    List<Meal> findByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    List<Meal> findByUserIdAndDate(Long userId, LocalDate date);

    @Query("SELECT m FROM Meal m WHERE m.userId = :userId AND m.date BETWEEN :startDate AND :endDate ORDER BY m.date DESC, m.createdAt DESC")
    List<Meal> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT m FROM Meal m LEFT JOIN FETCH m.mealFoods mf LEFT JOIN FETCH mf.food WHERE m.userId = :userId AND m.date = :date")
    List<Meal> findByUserIdAndDateWithFoods(@Param("userId") Long userId, @Param("date") LocalDate date);

    void deleteByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}

