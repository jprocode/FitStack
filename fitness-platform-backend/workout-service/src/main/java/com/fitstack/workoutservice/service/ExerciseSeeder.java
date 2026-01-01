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
        log.warn("Using manual exercise seeding as fallback");
        
        List<Exercise> exercises = List.of(
            Exercise.builder().name("Barbell Bench Press").muscleGroup("Chest").equipment("barbell").difficulty("Intermediate").instructions("Lie on bench, grip barbell, lower to chest, press up.").build(),
            Exercise.builder().name("Push-ups").muscleGroup("Chest").equipment("body weight").difficulty("Beginner").instructions("Start in plank, lower chest to floor, push back up.").build(),
            Exercise.builder().name("Incline Dumbbell Press").muscleGroup("Chest").equipment("dumbbell").difficulty("Intermediate").instructions("On incline bench, press dumbbells up from shoulders.").build(),
            Exercise.builder().name("Cable Flyes").muscleGroup("Chest").equipment("cable").difficulty("Intermediate").instructions("Stand between cables, bring arms together in front.").build(),
            
            Exercise.builder().name("Pull-ups").muscleGroup("Back").equipment("body weight").difficulty("Intermediate").instructions("Hang from bar, pull chin above bar, lower with control.").build(),
            Exercise.builder().name("Barbell Rows").muscleGroup("Back").equipment("barbell").difficulty("Intermediate").instructions("Bend over, pull barbell to lower chest, lower with control.").build(),
            Exercise.builder().name("Lat Pulldown").muscleGroup("Back").equipment("cable").difficulty("Beginner").instructions("Sit at machine, pull bar to chest, control the return.").build(),
            Exercise.builder().name("Seated Cable Row").muscleGroup("Back").equipment("cable").difficulty("Beginner").instructions("Sit upright, pull handle to torso, squeeze shoulder blades.").build(),
            Exercise.builder().name("Deadlift").muscleGroup("Back").equipment("barbell").difficulty("Advanced").instructions("Stand with feet hip-width, hinge at hips, lift barbell.").build(),
            
            Exercise.builder().name("Barbell Squat").muscleGroup("Upper legs").equipment("barbell").difficulty("Intermediate").instructions("Bar on upper back, squat down until thighs parallel, stand up.").build(),
            Exercise.builder().name("Leg Press").muscleGroup("Upper legs").equipment("leverage machine").difficulty("Beginner").instructions("Sit in machine, push platform away, control return.").build(),
            Exercise.builder().name("Romanian Deadlift").muscleGroup("Upper legs").equipment("barbell").difficulty("Intermediate").instructions("Hold barbell, hinge at hips keeping legs slightly bent.").build(),
            Exercise.builder().name("Leg Curl").muscleGroup("Upper legs").equipment("leverage machine").difficulty("Beginner").instructions("Lie face down, curl weight towards glutes.").build(),
            Exercise.builder().name("Leg Extension").muscleGroup("Upper legs").equipment("leverage machine").difficulty("Beginner").instructions("Sit in machine, extend legs, control the return.").build(),
            Exercise.builder().name("Lunges").muscleGroup("Upper legs").equipment("body weight").difficulty("Beginner").instructions("Step forward, lower back knee towards floor, push back up.").build(),
            
            Exercise.builder().name("Standing Calf Raises").muscleGroup("Lower legs").equipment("leverage machine").difficulty("Beginner").instructions("Stand on platform, raise heels, lower with control.").build(),
            Exercise.builder().name("Seated Calf Raises").muscleGroup("Lower legs").equipment("leverage machine").difficulty("Beginner").instructions("Sit in machine, raise heels, lower with control.").build(),
            
            Exercise.builder().name("Overhead Press").muscleGroup("Shoulders").equipment("barbell").difficulty("Intermediate").instructions("Press barbell overhead from shoulders, lower with control.").build(),
            Exercise.builder().name("Lateral Raises").muscleGroup("Shoulders").equipment("dumbbell").difficulty("Beginner").instructions("Raise dumbbells to sides until shoulder height.").build(),
            Exercise.builder().name("Front Raises").muscleGroup("Shoulders").equipment("dumbbell").difficulty("Beginner").instructions("Raise dumbbells in front until shoulder height.").build(),
            Exercise.builder().name("Face Pulls").muscleGroup("Shoulders").equipment("cable").difficulty("Beginner").instructions("Pull rope to face, squeeze shoulder blades together.").build(),
            Exercise.builder().name("Arnold Press").muscleGroup("Shoulders").equipment("dumbbell").difficulty("Intermediate").instructions("Start palms facing you, rotate and press overhead.").build(),
            
            Exercise.builder().name("Barbell Curl").muscleGroup("Upper arms").equipment("barbell").difficulty("Beginner").instructions("Curl barbell from thighs to shoulders, lower with control.").build(),
            Exercise.builder().name("Hammer Curl").muscleGroup("Upper arms").equipment("dumbbell").difficulty("Beginner").instructions("Curl dumbbells with palms facing each other.").build(),
            Exercise.builder().name("Tricep Pushdown").muscleGroup("Upper arms").equipment("cable").difficulty("Beginner").instructions("Push cable down, keep elbows at sides, extend fully.").build(),
            Exercise.builder().name("Skull Crushers").muscleGroup("Upper arms").equipment("barbell").difficulty("Intermediate").instructions("Lie on bench, lower bar to forehead, extend arms.").build(),
            Exercise.builder().name("Dumbbell Curl").muscleGroup("Upper arms").equipment("dumbbell").difficulty("Beginner").instructions("Curl dumbbells alternating or together.").build(),
            Exercise.builder().name("Tricep Dips").muscleGroup("Upper arms").equipment("body weight").difficulty("Intermediate").instructions("Lower body by bending arms, push back up.").build(),
            Exercise.builder().name("Preacher Curl").muscleGroup("Upper arms").equipment("barbell").difficulty("Intermediate").instructions("Rest arms on pad, curl barbell up, lower with control.").build(),
            Exercise.builder().name("Overhead Tricep Extension").muscleGroup("Upper arms").equipment("dumbbell").difficulty("Beginner").instructions("Hold dumbbell overhead, lower behind head, extend.").build(),
            
            Exercise.builder().name("Crunches").muscleGroup("Waist").equipment("body weight").difficulty("Beginner").instructions("Lie on back, curl shoulders towards hips.").build(),
            Exercise.builder().name("Plank").muscleGroup("Waist").equipment("body weight").difficulty("Beginner").instructions("Hold body straight on forearms and toes.").build(),
            Exercise.builder().name("Hanging Leg Raise").muscleGroup("Waist").equipment("body weight").difficulty("Intermediate").instructions("Hang from bar, raise legs to horizontal.").build(),
            Exercise.builder().name("Russian Twist").muscleGroup("Waist").equipment("body weight").difficulty("Beginner").instructions("Sit with knees bent, rotate torso side to side.").build(),
            Exercise.builder().name("Cable Crunch").muscleGroup("Waist").equipment("cable").difficulty("Beginner").instructions("Kneel at cable, crunch down against resistance.").build(),
            
            Exercise.builder().name("Wrist Curl").muscleGroup("Lower arms").equipment("dumbbell").difficulty("Beginner").instructions("Rest forearm on knee, curl wrist up.").build(),
            Exercise.builder().name("Reverse Wrist Curl").muscleGroup("Lower arms").equipment("dumbbell").difficulty("Beginner").instructions("Rest forearm on knee palm down, extend wrist up.").build()
        );
        
        exerciseRepository.saveAll(exercises);
        log.info("Saved {} exercises manually", exercises.size());
    }
}