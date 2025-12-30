package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.entity.Exercise;
import com.fitstack.workoutservice.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExerciseSeeder implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;

    @Override
    public void run(String... args) {
        if (exerciseRepository.count() == 0) {
            log.info("Seeding exercise database...");
            seedExercises();
            log.info("Exercise database seeded with {} exercises", exerciseRepository.count());
        }
    }

    private void seedExercises() {
        List<Exercise> exercises = Arrays.asList(
            // Chest
            Exercise.builder().name("Bench Press").muscleGroup("Chest").equipment("Barbell").difficulty("Intermediate").instructions("Lie on bench, lower bar to chest, press up.").build(),
            Exercise.builder().name("Incline Dumbbell Press").muscleGroup("Chest").equipment("Dumbbell").difficulty("Intermediate").instructions("On incline bench, press dumbbells up from shoulder level.").build(),
            Exercise.builder().name("Push-ups").muscleGroup("Chest").equipment("Bodyweight").difficulty("Beginner").instructions("Start in plank, lower chest to ground, push back up.").build(),
            Exercise.builder().name("Cable Flyes").muscleGroup("Chest").equipment("Cable").difficulty("Intermediate").instructions("Stand between cables, bring hands together in front of chest.").build(),
            Exercise.builder().name("Dips").muscleGroup("Chest").equipment("Bodyweight").difficulty("Intermediate").instructions("Support body on parallel bars, lower and push up.").build(),

            // Back
            Exercise.builder().name("Deadlift").muscleGroup("Back").equipment("Barbell").difficulty("Advanced").instructions("Stand over bar, hinge at hips, lift bar keeping back straight.").build(),
            Exercise.builder().name("Pull-ups").muscleGroup("Back").equipment("Bodyweight").difficulty("Intermediate").instructions("Hang from bar, pull chin over bar.").build(),
            Exercise.builder().name("Barbell Row").muscleGroup("Back").equipment("Barbell").difficulty("Intermediate").instructions("Bend forward, row bar to lower chest.").build(),
            Exercise.builder().name("Lat Pulldown").muscleGroup("Back").equipment("Cable").difficulty("Beginner").instructions("Pull bar down to upper chest.").build(),
            Exercise.builder().name("Seated Cable Row").muscleGroup("Back").equipment("Cable").difficulty("Beginner").instructions("Pull handle to midsection, squeeze shoulder blades.").build(),

            // Shoulders
            Exercise.builder().name("Overhead Press").muscleGroup("Shoulders").equipment("Barbell").difficulty("Intermediate").instructions("Press bar overhead from shoulder level.").build(),
            Exercise.builder().name("Lateral Raises").muscleGroup("Shoulders").equipment("Dumbbell").difficulty("Beginner").instructions("Raise dumbbells out to sides until parallel with floor.").build(),
            Exercise.builder().name("Front Raises").muscleGroup("Shoulders").equipment("Dumbbell").difficulty("Beginner").instructions("Raise dumbbells in front until parallel with floor.").build(),
            Exercise.builder().name("Face Pulls").muscleGroup("Shoulders").equipment("Cable").difficulty("Beginner").instructions("Pull rope to face, spreading hands at end.").build(),
            Exercise.builder().name("Arnold Press").muscleGroup("Shoulders").equipment("Dumbbell").difficulty("Intermediate").instructions("Start palms facing you, rotate as you press overhead.").build(),

            // Biceps
            Exercise.builder().name("Barbell Curl").muscleGroup("Biceps").equipment("Barbell").difficulty("Beginner").instructions("Curl bar up, keeping elbows at sides.").build(),
            Exercise.builder().name("Dumbbell Curl").muscleGroup("Biceps").equipment("Dumbbell").difficulty("Beginner").instructions("Curl dumbbells up alternately or together.").build(),
            Exercise.builder().name("Hammer Curl").muscleGroup("Biceps").equipment("Dumbbell").difficulty("Beginner").instructions("Curl with palms facing each other.").build(),
            Exercise.builder().name("Preacher Curl").muscleGroup("Biceps").equipment("EZ Bar").difficulty("Intermediate").instructions("Curl on preacher bench for isolation.").build(),
            Exercise.builder().name("Cable Curl").muscleGroup("Biceps").equipment("Cable").difficulty("Beginner").instructions("Curl cable handle up from low pulley.").build(),

            // Triceps
            Exercise.builder().name("Tricep Pushdown").muscleGroup("Triceps").equipment("Cable").difficulty("Beginner").instructions("Push cable down, extending elbows fully.").build(),
            Exercise.builder().name("Skull Crushers").muscleGroup("Triceps").equipment("EZ Bar").difficulty("Intermediate").instructions("Lower bar to forehead, extend arms.").build(),
            Exercise.builder().name("Overhead Tricep Extension").muscleGroup("Triceps").equipment("Dumbbell").difficulty("Beginner").instructions("Extend dumbbell overhead behind head.").build(),
            Exercise.builder().name("Close Grip Bench Press").muscleGroup("Triceps").equipment("Barbell").difficulty("Intermediate").instructions("Bench press with hands close together.").build(),
            Exercise.builder().name("Tricep Dips").muscleGroup("Triceps").equipment("Bodyweight").difficulty("Intermediate").instructions("Dip focusing on keeping elbows back.").build(),

            // Legs
            Exercise.builder().name("Squat").muscleGroup("Quadriceps").equipment("Barbell").difficulty("Intermediate").instructions("Bar on back, squat down until thighs parallel.").build(),
            Exercise.builder().name("Leg Press").muscleGroup("Quadriceps").equipment("Machine").difficulty("Beginner").instructions("Press platform away by extending legs.").build(),
            Exercise.builder().name("Lunges").muscleGroup("Quadriceps").equipment("Dumbbell").difficulty("Beginner").instructions("Step forward, lower back knee toward ground.").build(),
            Exercise.builder().name("Leg Extension").muscleGroup("Quadriceps").equipment("Machine").difficulty("Beginner").instructions("Extend legs against resistance.").build(),
            Exercise.builder().name("Romanian Deadlift").muscleGroup("Hamstrings").equipment("Barbell").difficulty("Intermediate").instructions("Hinge at hips, lower bar along legs.").build(),
            Exercise.builder().name("Leg Curl").muscleGroup("Hamstrings").equipment("Machine").difficulty("Beginner").instructions("Curl legs up against resistance.").build(),
            Exercise.builder().name("Calf Raises").muscleGroup("Calves").equipment("Machine").difficulty("Beginner").instructions("Rise up on toes, lower slowly.").build(),
            Exercise.builder().name("Hip Thrust").muscleGroup("Glutes").equipment("Barbell").difficulty("Intermediate").instructions("Drive hips up with upper back on bench.").build(),

            // Core
            Exercise.builder().name("Plank").muscleGroup("Core").equipment("Bodyweight").difficulty("Beginner").instructions("Hold body in straight line on forearms and toes.").build(),
            Exercise.builder().name("Crunches").muscleGroup("Core").equipment("Bodyweight").difficulty("Beginner").instructions("Curl upper body toward knees.").build(),
            Exercise.builder().name("Russian Twists").muscleGroup("Core").equipment("Bodyweight").difficulty("Beginner").instructions("Twist torso side to side.").build(),
            Exercise.builder().name("Hanging Leg Raises").muscleGroup("Core").equipment("Pull-up Bar").difficulty("Intermediate").instructions("Hang and raise legs up.").build(),
            Exercise.builder().name("Cable Woodchop").muscleGroup("Core").equipment("Cable").difficulty("Intermediate").instructions("Pull cable diagonally across body.").build()
        );

        exerciseRepository.saveAll(exercises);
    }
}

