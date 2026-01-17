package com.fitstack.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "body_metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "body_fat_pct", precision = 4, scale = 2)
    private BigDecimal bodyFatPct;

    @Column(name = "measurement_date", nullable = false)
    private LocalDate measurementDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Extended Measurements (in cm)
    @Column(name = "neck_cm", precision = 5, scale = 2)
    private BigDecimal neckCm;

    @Column(name = "shoulders_cm", precision = 5, scale = 2)
    private BigDecimal shouldersCm;

    @Column(name = "chest_cm", precision = 5, scale = 2)
    private BigDecimal chestCm;

    @Column(name = "waist_cm", precision = 5, scale = 2)
    private BigDecimal waistCm;

    @Column(name = "hips_cm", precision = 5, scale = 2)
    private BigDecimal hipsCm;

    @Column(name = "left_bicep_cm", precision = 5, scale = 2)
    private BigDecimal leftBicepCm;

    @Column(name = "right_bicep_cm", precision = 5, scale = 2)
    private BigDecimal rightBicepCm;

    @Column(name = "left_thigh_cm", precision = 5, scale = 2)
    private BigDecimal leftThighCm;

    @Column(name = "right_thigh_cm", precision = 5, scale = 2)
    private BigDecimal rightThighCm;

    @Column(name = "left_calf_cm", precision = 5, scale = 2)
    private BigDecimal leftCalfCm;

    @Column(name = "right_calf_cm", precision = 5, scale = 2)
    private BigDecimal rightCalfCm;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
