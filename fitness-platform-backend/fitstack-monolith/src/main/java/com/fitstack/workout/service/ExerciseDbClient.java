package com.fitstack.workout.service;

import com.fitstack.workout.dto.ExerciseDbResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class ExerciseDbClient {

    private final WebClient webClient;

    @Value("${exercisedb.api.key}")
    private String apiKey;

    private static final String API_URL = "https://exercisedb.p.rapidapi.com";
    private static final String API_HOST = "exercisedb.p.rapidapi.com";

    // Equipment types to fetch (hypertrophy relevant only)
    private static final String[] EQUIPMENT_TYPES = {
            "barbell", "dumbbell", "cable", "leverage machine",
            "smith machine", "ez barbell", "sled machine", "kettlebell",
            "trap bar", "olympic barbell", "weighted", "hammer"
    };

    // Track total API calls made
    private final AtomicInteger apiCallCount = new AtomicInteger(0);

    public ExerciseDbClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public int getApiCallCount() {
        return apiCallCount.get();
    }

    public void resetApiCallCount() {
        apiCallCount.set(0);
    }

    public List<ExerciseDbResponse> fetchAllExercises() {
        resetApiCallCount();
        List<ExerciseDbResponse> allExercises = new ArrayList<>();

        log.info("========================================");
        log.info("Starting ExerciseDB API Import");
        log.info("Equipment types to fetch: {}", EQUIPMENT_TYPES.length);
        log.info("========================================");

        for (String equipment : EQUIPMENT_TYPES) {
            try {
                List<ExerciseDbResponse> exercises = fetchByEquipment(equipment);
                allExercises.addAll(exercises);
                log.info("Cumulative total: {} exercises", allExercises.size());
            } catch (Exception e) {
                log.error("Failed to fetch {} exercises: {}", equipment, e.getMessage());
            }
        }

        log.info("========================================");
        log.info("IMPORT COMPLETE");
        log.info("Total API calls made: {}", apiCallCount.get());
        log.info("Total exercises fetched: {}", allExercises.size());
        log.info("========================================");

        return allExercises;
    }

    private List<ExerciseDbResponse> fetchByEquipment(String equipment) {
        List<ExerciseDbResponse> exercises = new ArrayList<>();
        int offset = 0;
        int batchSize = 10; // Free tier limit

        log.info("Fetching {} exercises...", equipment);

        while (true) {
            try {
                String encodedEquipment = java.net.URLEncoder.encode(equipment, java.nio.charset.StandardCharsets.UTF_8)
                        .replace("+", "%20");
                String uriString = API_URL + "/exercises/equipment/" + encodedEquipment +
                        "?limit=" + batchSize + "&offset=" + offset;

                apiCallCount.incrementAndGet();

                List<ExerciseDbResponse> batch = webClient.get()
                        .uri(java.net.URI.create(uriString))
                        .header("X-RapidAPI-Key", apiKey)
                        .header("X-RapidAPI-Host", API_HOST)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<List<ExerciseDbResponse>>() {
                        })
                        .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)))
                        .block(Duration.ofSeconds(30));

                if (batch == null || batch.isEmpty()) {
                    break;
                }

                exercises.addAll(batch);

                if (batch.size() < batchSize) {
                    break;
                }

                offset += batchSize;

                // Small delay to avoid rate limiting
                Thread.sleep(100);

            } catch (WebClientResponseException e) {
                log.error("API error at offset {}: {} - {}", offset, e.getStatusCode(), e.getMessage());
                break;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("Error at offset {}: {}", offset, e.getMessage());
                break;
            }
        }

        log.info("  {} -> {} exercises ({} API calls so far)",
                equipment, exercises.size(), apiCallCount.get());
        return exercises;
    }
}