package com.fitstack.workout.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTemplateRequest {

    @Size(max = 255)
    private String name;

    private String description;

    private Boolean isPublic;

    @Valid
    private List<CreateTemplateRequest.ExerciseEntry> exercises;
}

