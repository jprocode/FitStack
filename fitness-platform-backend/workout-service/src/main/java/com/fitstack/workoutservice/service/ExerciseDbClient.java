package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.dto.ExerciseDbResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;

@Service
@Slf4j
public class ExerciseDbClient {

    private final WebClient webClient;

    @Value("${exercisedb.api.url}")
    private String apiUrl;

    @Value("${exercisedb.api.key}")
    private String apiKey;

    @Value("${exercisedb.api.host}")
    private String apiHost;

    public ExerciseDbClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public List<ExerciseDbResponse> fetchAllExercises() {
        try {
            log.info("Fetching all exercises from ExerciseDB API at {}/api/v1/exercises", apiUrl);
            
            List<ExerciseDbResponse> exercises = webClient.get()
                    .uri(apiUrl + "/api/v1/exercises")
                    .header("X-RapidAPI-Key", apiKey)
                    .header("X-RapidAPI-Host", apiHost)
                    .retrieve()
                    .bodyToFlux(ExerciseDbResponse.class)
                    .retryWhen(Retry.fixedDelay(3, Duration.ofSeconds(2)))
                    .doOnError(error -> log.error("Error fetching exercises: {}", error.getMessage()))
                    .collectList()
                    .block(Duration.ofMinutes(2));

            log.info("Successfully fetched {} exercises from ExerciseDB API", exercises != null ? exercises.size() : 0);
            return exercises != null ? exercises : List.of();
        } catch (WebClientResponseException e) {
            log.error("ExerciseDB API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to fetch exercises from ExerciseDB API: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error fetching exercises: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch exercises from ExerciseDB API", e);
        }
    }
}