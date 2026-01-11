package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.dto.PersonalRecordDto;
import com.fitstack.workoutservice.dto.ProgressiveOverloadDto;
import com.fitstack.workoutservice.dto.VolumeProgressionDto;
import com.fitstack.workoutservice.dto.WorkoutFrequencyDto;
import com.fitstack.workoutservice.entity.Exercise;
import com.fitstack.workoutservice.entity.WorkoutSession;
import com.fitstack.workoutservice.entity.WorkoutSet;
import com.fitstack.workoutservice.repository.ExerciseRepository;
import com.fitstack.workoutservice.repository.WorkoutSessionRepository;
import com.fitstack.workoutservice.repository.WorkoutSetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkoutAnalyticsService {

    private final WorkoutSessionRepository sessionRepository;
    private final WorkoutSetRepository setRepository;
    private final ExerciseRepository exerciseRepository;

    /**
     * Get workout frequency data (workouts per week)
     */
    public List<WorkoutFrequencyDto> getWorkoutFrequency(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<WorkoutSession> sessions = sessionRepository.findByUserIdAndStatusAndStartedAtBetweenOrderByStartedAtAsc(
                userId, WorkoutSession.SessionStatus.COMPLETED, startDate, endDate);

        // Group by week
        Map<LocalDate, List<WorkoutSession>> sessionsByWeek = new LinkedHashMap<>();

        LocalDate currentWeekStart = startDate.toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endWeek = endDate.toLocalDate();

        // Initialize all weeks in range
        while (!currentWeekStart.isAfter(endWeek)) {
            sessionsByWeek.put(currentWeekStart, new ArrayList<>());
            currentWeekStart = currentWeekStart.plusWeeks(1);
        }

        // Populate with actual sessions
        for (WorkoutSession session : sessions) {
            LocalDate weekStart = session.getStartedAt().toLocalDate()
                    .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            sessionsByWeek.computeIfAbsent(weekStart, k -> new ArrayList<>()).add(session);
        }

        List<WorkoutFrequencyDto> frequencyData = new ArrayList<>();
        int weekNumber = 1;

        for (Map.Entry<LocalDate, List<WorkoutSession>> entry : sessionsByWeek.entrySet()) {
            frequencyData.add(WorkoutFrequencyDto.builder()
                    .date(entry.getKey())
                    .workoutCount(entry.getValue().size())
                    .weekNumber(weekNumber++)
                    .weekLabel("Week of " + entry.getKey().format(DateTimeFormatter.ofPattern("MMM d")))
                    .build());
        }

        return frequencyData;
    }

    /**
     * Get volume progression data
     */
    public List<VolumeProgressionDto> getVolumeProgression(Long userId, Long exerciseId, String period) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = calculateStartDate(period);

        List<WorkoutSession> sessions = sessionRepository.findByUserIdAndStatusAndStartedAtBetweenOrderByStartedAtAsc(
                userId, WorkoutSession.SessionStatus.COMPLETED, startDate, endDate);

        if (sessions.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> sessionIds = sessions.stream().map(WorkoutSession::getId).toList();
        List<WorkoutSet> allSets = setRepository.findBySessionIdIn(sessionIds);

        // Group sets by session
        Map<Long, List<WorkoutSet>> setsBySession = allSets.stream()
                .collect(Collectors.groupingBy(ws -> ws.getSession().getId()));

        List<VolumeProgressionDto> volumeData = new ArrayList<>();

        for (WorkoutSession session : sessions) {
            List<WorkoutSet> sessionSets = setsBySession.getOrDefault(session.getId(), new ArrayList<>());

            // Filter by exercise if specified
            if (exerciseId != null) {
                sessionSets = sessionSets.stream()
                        .filter(ws -> ws.getExercise().getId().equals(exerciseId))
                        .toList();
            }

            if (sessionSets.isEmpty())
                continue;

            BigDecimal totalVolume = BigDecimal.ZERO;
            int totalSets = sessionSets.size();
            int totalReps = 0;
            Map<String, BigDecimal> exerciseBreakdown = new HashMap<>();

            for (WorkoutSet set : sessionSets) {
                if (set.getWeightUsed() != null && set.getRepsCompleted() != null) {
                    BigDecimal setVolume = set.getWeightUsed()
                            .multiply(BigDecimal.valueOf(set.getRepsCompleted()));
                    totalVolume = totalVolume.add(setVolume);
                    totalReps += set.getRepsCompleted();

                    String exerciseName = set.getExercise().getName();
                    exerciseBreakdown.merge(exerciseName, setVolume, BigDecimal::add);
                }
            }

            volumeData.add(VolumeProgressionDto.builder()
                    .date(session.getStartedAt().toLocalDate())
                    .totalVolume(totalVolume)
                    .totalSets(totalSets)
                    .totalReps(totalReps)
                    .exerciseBreakdown(exerciseBreakdown)
                    .build());
        }

        return volumeData;
    }

    /**
     * Get personal records for all exercises
     */
    public List<PersonalRecordDto> getPersonalRecords(Long userId) {
        List<Long> exerciseIds = setRepository.findDistinctExerciseIdsByUserId(userId);
        List<PersonalRecordDto> records = new ArrayList<>();
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        for (Long exerciseId : exerciseIds) {
            Optional<Exercise> exerciseOpt = exerciseRepository.findById(exerciseId);
            if (exerciseOpt.isEmpty())
                continue;

            Exercise exercise = exerciseOpt.get();
            List<WorkoutSet> sets = setRepository.findRecentSetsByUserIdAndExerciseId(userId, exerciseId);

            if (sets.isEmpty())
                continue;

            // Find max weight, max reps, max volume
            BigDecimal maxWeight = BigDecimal.ZERO;
            Integer maxReps = 0;
            BigDecimal maxVolume = BigDecimal.ZERO;
            LocalDateTime maxWeightDate = null;

            for (WorkoutSet set : sets) {
                if (set.getWeightUsed() != null && set.getWeightUsed().compareTo(maxWeight) > 0) {
                    maxWeight = set.getWeightUsed();
                    maxWeightDate = set.getCompletedAt();
                }
                if (set.getRepsCompleted() != null && set.getRepsCompleted() > maxReps) {
                    maxReps = set.getRepsCompleted();
                }
                if (set.getWeightUsed() != null && set.getRepsCompleted() != null) {
                    BigDecimal setVolume = set.getWeightUsed()
                            .multiply(BigDecimal.valueOf(set.getRepsCompleted()));
                    if (setVolume.compareTo(maxVolume) > 0) {
                        maxVolume = setVolume;
                    }
                }
            }

            // Calculate estimated 1RM using Brzycki formula: 1RM = w × (36 / (37 - r))
            BigDecimal estimated1RM = null;
            if (maxWeight.compareTo(BigDecimal.ZERO) > 0 && maxReps > 0 && maxReps < 37) {
                estimated1RM = maxWeight.multiply(BigDecimal.valueOf(36))
                        .divide(BigDecimal.valueOf(37 - maxReps), 2, RoundingMode.HALF_UP);
            }

            boolean isRecent = maxWeightDate != null && maxWeightDate.isAfter(thirtyDaysAgo);

            records.add(PersonalRecordDto.builder()
                    .exerciseId(exerciseId)
                    .exerciseName(exercise.getName())
                    .muscleGroup(exercise.getMuscleGroup())
                    .maxWeight(maxWeight)
                    .maxReps(maxReps)
                    .maxVolume(maxVolume)
                    .estimatedOneRepMax(estimated1RM)
                    .achievedAt(maxWeightDate)
                    .isRecent(isRecent)
                    .build());
        }

        // Sort by max weight descending
        records.sort((a, b) -> b.getMaxWeight().compareTo(a.getMaxWeight()));

        return records;
    }

    /**
     * Get progressive overload suggestions
     */
    public List<ProgressiveOverloadDto> getProgressiveOverloadSuggestions(Long userId) {
        List<Long> exerciseIds = setRepository.findDistinctExerciseIdsByUserId(userId);
        List<ProgressiveOverloadDto> suggestions = new ArrayList<>();

        for (Long exerciseId : exerciseIds) {
            Optional<Exercise> exerciseOpt = exerciseRepository.findById(exerciseId);
            if (exerciseOpt.isEmpty())
                continue;

            Exercise exercise = exerciseOpt.get();
            List<WorkoutSet> recentSets = setRepository.findRecentSetsByUserIdAndExerciseId(userId, exerciseId);

            if (recentSets.isEmpty())
                continue;

            // Get the most recent session's sets for this exercise
            LocalDateTime mostRecentSession = recentSets.get(0).getCompletedAt();
            List<WorkoutSet> lastSessionSets = recentSets.stream()
                    .filter(s -> s.getCompletedAt() != null &&
                            ChronoUnit.HOURS.between(s.getCompletedAt(), mostRecentSession) < 3)
                    .toList();

            if (lastSessionSets.isEmpty())
                continue;

            // Calculate averages from last session
            BigDecimal avgWeight = lastSessionSets.stream()
                    .filter(s -> s.getWeightUsed() != null)
                    .map(WorkoutSet::getWeightUsed)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(lastSessionSets.size()), 2, RoundingMode.HALF_UP);

            int avgReps = (int) lastSessionSets.stream()
                    .filter(s -> s.getRepsCompleted() != null)
                    .mapToInt(WorkoutSet::getRepsCompleted)
                    .average()
                    .orElse(0);

            int lastSets = lastSessionSets.size();

            // Generate suggestion based on performance
            ProgressiveOverloadDto suggestion = generateSuggestion(
                    exercise, avgWeight, avgReps, lastSets);

            if (suggestion != null) {
                suggestions.add(suggestion);
            }
        }

        return suggestions;
    }

    private ProgressiveOverloadDto generateSuggestion(Exercise exercise, BigDecimal lastWeight,
            int lastReps, int lastSets) {
        String reasoning;
        String progressType;
        BigDecimal suggestedWeight = lastWeight;
        int suggestedReps = lastReps;

        // Modern Exercise Science: Double Progression Model
        // Target rep range: 8-12 reps
        //
        // DECISION LOGIC:
        // 1. If reps >= 12 on all sets → User mastered this weight, increase by 5 lbs
        // 2. If reps 10-11 → Close to ready, try for 12 reps before increasing
        // 3. If reps 8-9 → Progressing well, stay at current weight and aim for more
        // reps
        // 4. If reps < 8 → Weight might be too heavy, stay at current weight and build
        // strength

        if (lastReps >= 12) {
            // User hit top of rep range - time to add weight
            BigDecimal increment = BigDecimal.valueOf(5.0); // 5 lbs standard increment
            suggestedWeight = lastWeight.add(increment);
            suggestedReps = 8; // Reset to bottom of rep range with new weight
            progressType = "WEIGHT";
            reasoning = String.format(
                    "Great work hitting %d reps! You've mastered this weight. " +
                            "Increase to %.1f lbs and aim for 8 reps.",
                    lastReps, suggestedWeight.doubleValue());
        } else if (lastReps >= 10) {
            // Almost there - push for top of range
            suggestedReps = 12;
            progressType = "REPS";
            reasoning = String.format(
                    "You're at %d reps - almost ready to increase weight! " +
                            "Push for 12 reps this session, then you can add weight.",
                    lastReps);
        } else if (lastReps >= 8) {
            // Good progress in target range
            suggestedReps = lastReps + 1;
            progressType = "REPS";
            reasoning = String.format(
                    "Solid %d reps at this weight. " +
                            "Stay at %.1f lbs and try to hit %d reps before adding weight.",
                    lastReps, lastWeight.doubleValue(), suggestedReps);
        } else {
            // Below target range - focus on building strength at current weight
            suggestedReps = 8;
            progressType = "REPS";
            reasoning = String.format(
                    "You hit %d reps last time. Focus on building strength at %.1f lbs " +
                            "and aim for 8 reps with good form before progressing.",
                    lastReps, lastWeight.doubleValue());
        }

        return ProgressiveOverloadDto.builder()
                .exerciseId(exercise.getId())
                .exerciseName(exercise.getName())
                .muscleGroup(exercise.getMuscleGroup())
                .lastWeight(lastWeight)
                .suggestedWeight(suggestedWeight)
                .lastReps(lastReps)
                .suggestedReps(suggestedReps)
                .lastSets(lastSets)
                .reasoning(reasoning)
                .progressType(progressType)
                .build();
    }

    private LocalDateTime calculateStartDate(String period) {
        LocalDateTime now = LocalDateTime.now();
        return switch (period.toLowerCase()) {
            case "30d" -> now.minusDays(30);
            case "90d" -> now.minusDays(90);
            case "1y" -> now.minusYears(1);
            case "all" -> now.minusYears(10);
            default -> now.minusDays(90);
        };
    }
}
