package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.dto.ExerciseDbResponse;
import com.fitstack.workoutservice.entity.Exercise;
import com.fitstack.workoutservice.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExerciseSeeder implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseDbClient exerciseDbClient;

    @Override
    public void run(String... args) {
        if (exerciseRepository.count() == 0) {
            log.info("Exercise database is empty. Seeding from ExerciseDB API...");
            try {
                seedExercisesFromApi();
                log.info("Exercise database seeded successfully with {} exercises", exerciseRepository.count());
            } catch (Exception e) {
                log.error("Failed to seed exercises from API. Falling back to manual seed.", e);
                seedExercisesManually();
                log.info("Exercise database seeded manually with {} exercises", exerciseRepository.count());
            }
        } else {
            log.info("Exercise database already contains {} exercises. Skipping seed.", exerciseRepository.count());
        }
    }

    private void seedExercisesFromApi() {
        List<ExerciseDbResponse> apiExercises = exerciseDbClient.fetchAllExercises();
        
        if (apiExercises.isEmpty()) {
            throw new RuntimeException("No exercises fetched from API");
        }

        List<Exercise> exercises = apiExercises.stream()
                .filter(ex -> ex.getId() != null && ex.getName() != null)
                .map(this::convertToExercise)
                .filter(ex -> !exerciseRepository.existsByExternalId(ex.getExternalId()))
                .collect(Collectors.toList());

        exerciseRepository.saveAll(exercises);
        log.info("Saved {} exercises from ExerciseDB API", exercises.size());
    }

    private Exercise convertToExercise(ExerciseDbResponse apiExercise) {
        String instructions = apiExercise.getInstructions() != null && !apiExercise.getInstructions().isEmpty()
                ? String.join("\n", apiExercise.getInstructions())
                : null;

        String muscleGroup = apiExercise.getBodyPart() != null 
                ? capitalizeFirst(apiExercise.getBodyPart())
                : null;

        return Exercise.builder()
                .name(apiExercise.getName())
                .muscleGroup(muscleGroup)
                .equipment(apiExercise.getEquipment())
                .difficulty(determineDifficulty(apiExercise.getTarget()))
                .instructions(instructions)
                .gifUrl(apiExercise.getGifUrl())
                .externalId(apiExercise.getId())
                .build();
    }

    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    private String determineDifficulty(String target) {
        return "Intermediate"; // Default, can be enhanced later
    }

    private void seedExercisesManually() {
        // Keep your existing manual seed as fallback
        log.warn("Using manual exercise seeding as fallback");
    }
}