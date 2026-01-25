package com.fitstack.user.repository;

import com.fitstack.user.entity.BodyMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BodyMetricRepository extends JpaRepository<BodyMetric, Long> {

        List<BodyMetric> findByUserIdOrderByMeasurementDateDesc(Long userId);

        Page<BodyMetric> findByUserIdOrderByMeasurementDateDesc(Long userId, Pageable pageable);

        Optional<BodyMetric> findTopByUserIdOrderByMeasurementDateDesc(Long userId);

        // Find oldest entry for a user
        Optional<BodyMetric> findFirstByUserIdOrderByMeasurementDateAsc(Long userId);

        @Query("SELECT bm FROM BodyMetric bm WHERE bm.user.id = :userId AND bm.measurementDate BETWEEN :startDate AND :endDate ORDER BY bm.measurementDate ASC")
        List<BodyMetric> findByUserIdAndDateRange(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        // Aggregate statistics queries
        @Query("SELECT AVG(bm.weightKg) FROM BodyMetric bm WHERE bm.user.id = :userId AND bm.measurementDate BETWEEN :startDate AND :endDate")
        BigDecimal findAverageWeightByUserIdAndDateRange(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT MIN(bm.weightKg) FROM BodyMetric bm WHERE bm.user.id = :userId AND bm.measurementDate BETWEEN :startDate AND :endDate")
        BigDecimal findMinWeightByUserIdAndDateRange(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT MAX(bm.weightKg) FROM BodyMetric bm WHERE bm.user.id = :userId AND bm.measurementDate BETWEEN :startDate AND :endDate")
        BigDecimal findMaxWeightByUserIdAndDateRange(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT AVG(bm.bodyFatPct) FROM BodyMetric bm WHERE bm.user.id = :userId AND bm.measurementDate BETWEEN :startDate AND :endDate AND bm.bodyFatPct IS NOT NULL")
        BigDecimal findAverageBodyFatByUserIdAndDateRange(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT COUNT(bm) FROM BodyMetric bm WHERE bm.user.id = :userId AND bm.measurementDate BETWEEN :startDate AND :endDate")
        Long countByUserIdAndDateRange(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        // For cascade delete on account deletion
        void deleteByUserId(Long userId);
}
