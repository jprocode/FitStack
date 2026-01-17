package com.fitstack.workout.controller;

import com.fitstack.workout.dto.ExerciseDto;
import com.fitstack.workout.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    public ResponseEntity<Page<ExerciseDto>> getExercises(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String muscleGroup,
            @RequestParam(required = false) String equipment,
            Pageable pageable
    ) {
        Page<ExerciseDto> exercises = exerciseService.getExercises(search, muscleGroup, equipment, pageable);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseDto> getExercise(@PathVariable Long id) {
        ExerciseDto exercise = exerciseService.getExercise(id);
        return ResponseEntity.ok(exercise);
    }

    @GetMapping("/muscle-groups")
    public ResponseEntity<List<String>> getMuscleGroups() {
        return ResponseEntity.ok(exerciseService.getMuscleGroups());
    }

    @GetMapping("/equipment")
    public ResponseEntity<List<String>> getEquipment() {
        return ResponseEntity.ok(exerciseService.getEquipment());
    }
}

