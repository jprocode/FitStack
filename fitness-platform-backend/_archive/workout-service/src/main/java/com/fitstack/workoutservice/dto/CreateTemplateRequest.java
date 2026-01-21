package com.fitstack.workoutservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTemplateRequest {

    @NotBlank(message = "Template name is required")
    @Size(max = 255)
    private String name;

    private String description;

    private Boolean isPublic;

    @Valid
    private List<ExerciseEntry> exercises;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExerciseEntry {
        @NotNull(message = "Exercise ID is required")
        private Long exerciseId;
        private Integer orderIndex;
        private Integer targetSets;
        private Integer targetReps;
        private BigDecimal targetWeight;
        private String notes;
    }
}

