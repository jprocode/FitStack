package com.fitstack.workoutservice.controller;

import com.fitstack.workoutservice.service.ExerciseImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
@Slf4j
public class ExerciseImportController {

    private final ExerciseImportService importService;

    /**
     * Trigger exercise import from ExerciseDB API.
     * This is a one-time import endpoint. Use sparingly - API has monthly call
     * limits.
     * 
     * POST /api/exercises/import
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importExercises() {
        log.info("Exercise import triggered via REST endpoint");

        try {
            ExerciseImportService.ImportResult result = importService.importExercises();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Import completed successfully",
                    "imported", result.imported(),
                    "skipped", result.skipped(),
                    "excluded", result.excluded(),
                    "apiCalls", result.apiCalls()));
        } catch (Exception e) {
            log.error("Import failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Import failed: " + e.getMessage()));
        }
    }
}
