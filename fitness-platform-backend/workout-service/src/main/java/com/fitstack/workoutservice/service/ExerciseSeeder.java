package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Exercise seeder - now only provides manual fallback data.
 * For API import, use POST /api/exercises/import endpoint.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ExerciseSeeder implements CommandLineRunner {

        private final ExerciseRepository exerciseRepository;

        @Override
        public void run(String... args) {
                long count = exerciseRepository.count();
                log.info("Exercise database contains {} exercises", count);

                if (count == 0) {
                        log.info("No exercises found. Use POST /api/exercises/import to import from ExerciseDB API.");
                } else {
                        log.info("To add more exercises from API, use POST /api/exercises/import");
                }
        }
}
