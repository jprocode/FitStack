package com.fitstack.workoutservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single day within a workout plan.
 * Contains exercises and can be identified by weekday or number.
 */
@Entity
@Table(name = "workout_plan_days")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_plan_id", nullable = false)
    private WorkoutPlan workoutPlan;

    /**
     * For WEEKLY plans: "MONDAY", "TUESDAY", etc.
     * For NUMBERED plans: "1", "2", "3", etc.
     */
    @Column(name = "day_identifier", nullable = false, length = 20)
    private String dayIdentifier;

    /**
     * Optional custom name for the day (e.g., "Push Day", "Leg Day")
     */
    @Column(length = 100)
    private String name;

    /**
     * Order of this day within the plan
     */
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @OneToMany(mappedBy = "planDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<WorkoutPlanDayExercise> exercises = new ArrayList<>();
}
