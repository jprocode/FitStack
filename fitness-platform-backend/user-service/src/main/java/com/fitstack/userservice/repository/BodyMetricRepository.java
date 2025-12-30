package com.fitstack.userservice.repository;

import com.fitstack.userservice.entity.BodyMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BodyMetricRepository extends JpaRepository<BodyMetric, Long> {
    
    List<BodyMetric> findByUserIdOrderByMeasurementDateDesc(Long userId);
    
    Page<BodyMetric> findByUserIdOrderByMeasurementDateDesc(Long userId, Pageable pageable);
    
    Optional<BodyMetric> findTopByUserIdOrderByMeasurementDateDesc(Long userId);
    
    @Query("SELECT bm FROM BodyMetric bm WHERE bm.user.id = :userId AND bm.measurementDate BETWEEN :startDate AND :endDate ORDER BY bm.measurementDate ASC")
    List<BodyMetric> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

