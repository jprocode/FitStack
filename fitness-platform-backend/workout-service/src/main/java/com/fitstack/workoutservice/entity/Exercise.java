package com.fitstack.workoutservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "exercises")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "muscle_group", length = 100)
    private String muscleGroup;

    @Column(length = 100)
    private String equipment;

    @Column(length = 50)
    private String difficulty;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "gif_url")
    private String gifUrl;

    @Column(name = "external_id")
    private String externalId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

