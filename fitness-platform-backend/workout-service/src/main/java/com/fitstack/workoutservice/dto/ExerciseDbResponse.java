package com.fitstack.workoutservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ExerciseDbResponse {
    private String id;
    private String name;
    private String bodyPart;
    private String equipment;
    private String target;
    private List<String> secondaryMuscles;
    private List<String> instructions;
    
    @JsonProperty("gifUrl")
    private String gifUrl;
}