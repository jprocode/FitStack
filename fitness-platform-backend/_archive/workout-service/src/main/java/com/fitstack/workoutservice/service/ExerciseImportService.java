package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.dto.ExerciseDbResponse;
import com.fitstack.workoutservice.entity.Exercise;
import com.fitstack.workoutservice.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExerciseImportService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseDbClient exerciseDbClient;

    // Pattern for left/right variations
    private static final Pattern LEFT_RIGHT_PATTERN = Pattern.compile(
            "(?i)\\(\\s*(left|right)\\s*\\)|" +
                    "(?i)\\s+(left|right)\\s*$");

    // Muscle group mapping from API bodyPart/target
    private static final Map<String, String> MUSCLE_GROUP_MAP = Map.ofEntries(
            Map.entry("chest", "Chest"),
            Map.entry("pectorals", "Chest"),
            Map.entry("back", "Back"),
            Map.entry("lats", "Lats"),
            Map.entry("upper back", "Back"),
            Map.entry("lower back", "Back"),
            Map.entry("biceps", "Biceps"),
            Map.entry("triceps", "Triceps"),
            Map.entry("forearms", "Lower Arms"),
            Map.entry("upper arms", "Biceps"),
            Map.entry("shoulders", "Shoulders"),
            Map.entry("delts", "Shoulders"),
            Map.entry("upper legs", "Quads"),
            Map.entry("quads", "Quads"),
            Map.entry("quadriceps", "Quads"),
            Map.entry("hamstrings", "Hamstrings"),
            Map.entry("glutes", "Glutes"),
            Map.entry("calves", "Calves"),
            Map.entry("lower legs", "Calves"),
            Map.entry("waist", "Abs/Core"),
            Map.entry("abs", "Abs/Core"),
            Map.entry("abductors", "Glutes"),
            Map.entry("adductors", "Quads"),
            Map.entry("neck", "Traps"),
            Map.entry("traps", "Traps"),
            Map.entry("cardiovascular system", "Cardio"));

    @Transactional
    public ImportResult importExercises() {
        log.info("========================================");
        log.info("Starting Exercise Import from ExerciseDB API");
        log.info("========================================");

        // Get existing exercise count
        long existingCount = exerciseRepository.count();
        log.info("Existing exercises in database: {}", existingCount);

        // Fetch from API
        List<ExerciseDbResponse> apiExercises = exerciseDbClient.fetchAllExercises();

        if (apiExercises.isEmpty()) {
            log.warn("No exercises fetched from API");
            return new ImportResult(0, 0, 0, exerciseDbClient.getApiCallCount());
        }

        log.info("Fetched {} exercises from API", apiExercises.size());

        // Filter out left/right variations and cardio
        List<ExerciseDbResponse> filtered = apiExercises.stream()
                .filter(this::isNotLeftRightVariation)
                .filter(this::isNotCardio)
                .collect(Collectors.toList());

        int excludedCount = apiExercises.size() - filtered.size();
        log.info("Filtered out {} exercises (left/right variations or cardio)", excludedCount);

        // Remove duplicates by name
        Set<String> seenNames = new HashSet<>();
        List<ExerciseDbResponse> unique = filtered.stream()
                .filter(ex -> seenNames.add(ex.getName().toLowerCase()))
                .collect(Collectors.toList());

        log.info("Unique exercises after dedup: {}", unique.size());

        // Import exercises (skip existing by name)
        int imported = 0;
        int skipped = 0;
        Map<String, Integer> byEquipment = new HashMap<>();
        Map<String, Integer> byMuscle = new HashMap<>();

        for (ExerciseDbResponse apiEx : unique) {
            String normalizedName = normalizeExerciseName(apiEx.getName());

            // Check if exercise already exists
            if (exerciseRepository.existsByNameIgnoreCase(normalizedName)) {
                skipped++;
                continue;
            }

            Exercise exercise = convertToExercise(apiEx);
            exerciseRepository.save(exercise);
            imported++;

            // Track statistics
            byEquipment.merge(exercise.getEquipment(), 1, Integer::sum);
            byMuscle.merge(exercise.getMuscleGroup(), 1, Integer::sum);
        }

        // Log summary
        logImportSummary(imported, skipped, excludedCount, byEquipment, byMuscle);

        return new ImportResult(imported, skipped, excludedCount, exerciseDbClient.getApiCallCount());
    }

    private boolean isNotLeftRightVariation(ExerciseDbResponse ex) {
        return !LEFT_RIGHT_PATTERN.matcher(ex.getName()).find();
    }

    private boolean isNotCardio(ExerciseDbResponse ex) {
        String bodyPart = ex.getBodyPart() != null ? ex.getBodyPart().toLowerCase() : "";
        String target = ex.getTarget() != null ? ex.getTarget().toLowerCase() : "";
        return !bodyPart.contains("cardio") && !target.contains("cardio");
    }

    private String normalizeExerciseName(String name) {
        if (name == null)
            return "";
        // Capitalize each word
        return Arrays.stream(name.split("\\s+"))
                .map(word -> word.isEmpty() ? word
                        : word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    private Exercise convertToExercise(ExerciseDbResponse apiEx) {
        String muscleGroup = mapMuscleGroup(apiEx.getBodyPart(), apiEx.getTarget());
        String equipment = normalizeEquipment(apiEx.getEquipment());
        String instructions = apiEx.getInstructions() != null && !apiEx.getInstructions().isEmpty()
                ? String.join(" ", apiEx.getInstructions())
                : "Perform the exercise with controlled movements.";

        return Exercise.builder()
                .name(normalizeExerciseName(apiEx.getName()))
                .muscleGroup(muscleGroup)
                .equipment(equipment)
                .difficulty("Intermediate")
                .instructions(instructions)
                .externalId(apiEx.getId())
                .build();
    }

    private String mapMuscleGroup(String bodyPart, String target) {
        // Try target first (more specific)
        if (target != null) {
            String mapped = MUSCLE_GROUP_MAP.get(target.toLowerCase());
            if (mapped != null)
                return mapped;
        }
        // Fall back to bodyPart
        if (bodyPart != null) {
            String mapped = MUSCLE_GROUP_MAP.get(bodyPart.toLowerCase());
            if (mapped != null)
                return mapped;
        }
        // Default
        return bodyPart != null ? capitalizeFirst(bodyPart) : "Other";
    }

    private String normalizeEquipment(String equipment) {
        if (equipment == null)
            return "Other";
        return Arrays.stream(equipment.split("\\s+"))
                .map(word -> word.isEmpty() ? word
                        : word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty())
            return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    private void logImportSummary(int imported, int skipped, int excluded,
            Map<String, Integer> byEquipment, Map<String, Integer> byMuscle) {
        log.info("========================================");
        log.info("        EXERCISE IMPORT SUMMARY         ");
        log.info("========================================");
        log.info("Total API calls made: {}", exerciseDbClient.getApiCallCount());
        log.info("Exercises imported: {}", imported);
        log.info("Exercises skipped (already exist): {}", skipped);
        log.info("Exercises excluded (left/right/cardio): {}", excluded);
        log.info("----------------------------------------");
        log.info("BY EQUIPMENT:");
        byEquipment.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .forEach(e -> log.info("  {}: {}", e.getKey(), e.getValue()));
        log.info("----------------------------------------");
        log.info("BY MUSCLE GROUP:");
        byMuscle.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .forEach(e -> log.info("  {}: {}", e.getKey(), e.getValue()));
        log.info("========================================");
    }

    // Result class
    public record ImportResult(int imported, int skipped, int excluded, int apiCalls) {
    }
}
