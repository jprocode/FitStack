package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.dto.*;
import com.fitstack.workoutservice.entity.*;
import com.fitstack.workoutservice.exception.BadRequestException;
import com.fitstack.workoutservice.exception.NotFoundException;
import com.fitstack.workoutservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutSessionService {

    private final WorkoutSessionRepository sessionRepository;
    private final WorkoutSetRepository setRepository;
    private final WorkoutTemplateRepository templateRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutPlanDayRepository planDayRepository;
    private final WorkoutTemplateService templateService;
    private final ExerciseService exerciseService;

    @Transactional
    public WorkoutSessionDto startSession(Long userId, StartSessionRequest request) {
        WorkoutTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new NotFoundException("Template not found"));

        WorkoutSession session = WorkoutSession.builder()
                .userId(userId)
                .template(template)
                .startedAt(LocalDateTime.now())
                .status(WorkoutSession.SessionStatus.IN_PROGRESS)
                .build();

        session = sessionRepository.save(session);
        return toDto(session);
    }

    /**
     * Start a workout session from a workout plan day.
     * This is the new flow for the integrated workout experience.
     */
    @Transactional
    public WorkoutSessionDto startSessionFromPlan(Long userId, Long planDayId) {
        WorkoutPlanDay planDay = planDayRepository.findByIdWithExercises(planDayId)
                .orElseThrow(() -> new NotFoundException("Workout day not found"));

        WorkoutSession session = WorkoutSession.builder()
                .userId(userId)
                .startedAt(LocalDateTime.now())
                .status(WorkoutSession.SessionStatus.IN_PROGRESS)
                .planDayId(planDayId)
                .build();

        session = sessionRepository.save(session);
        return toDtoWithPlanDay(session, planDay);
    }

    @Transactional
    public WorkoutSetDto logSet(Long userId, Long sessionId, LogSetRequest request) {
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new NotFoundException("Session not found"));

        if (session.getStatus() != WorkoutSession.SessionStatus.IN_PROGRESS) {
            throw new BadRequestException("Session is not in progress");
        }

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new NotFoundException("Exercise not found"));

        WorkoutSet set = WorkoutSet.builder()
                .session(session)
                .exercise(exercise)
                .setNumber(request.getSetNumber())
                .repsCompleted(request.getRepsCompleted())
                .weightUsed(request.getWeightUsed())
                .completedAt(LocalDateTime.now())
                .build();

        set = setRepository.save(set);
        return toSetDto(set);
    }

    @Transactional
    public WorkoutSessionDto completeSession(Long userId, Long sessionId, CompleteSessionRequest request) {
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new NotFoundException("Session not found"));

        if (session.getStatus() != WorkoutSession.SessionStatus.IN_PROGRESS) {
            throw new BadRequestException("Session is not in progress");
        }

        session.setStatus(WorkoutSession.SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        if (request != null && request.getNotes() != null) {
            session.setNotes(request.getNotes());
        }

        session = sessionRepository.save(session);
        return toDto(session);
    }

    public WorkoutSessionDto getSession(Long userId, Long sessionId) {
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new NotFoundException("Session not found"));
        return toDto(session);
    }

    public List<WorkoutSessionDto> getHistory(Long userId) {
        return sessionRepository.findByUserIdOrderByStartedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private WorkoutSessionDto toDto(WorkoutSession session) {
        List<WorkoutSet> sets = setRepository.findBySessionIdOrderByCompletedAtAsc(session.getId());

        return WorkoutSessionDto.builder()
                .id(session.getId())
                .userId(session.getUserId())
                .templateId(session.getTemplate() != null ? session.getTemplate().getId() : null)
                .template(session.getTemplate() != null ? templateService.toDto(session.getTemplate()) : null)
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .status(session.getStatus())
                .notes(session.getNotes())
                .sets(sets.stream().map(this::toSetDto).collect(Collectors.toList()))
                .build();
    }

    private WorkoutSessionDto toDtoWithPlanDay(WorkoutSession session, WorkoutPlanDay planDay) {
        return WorkoutSessionDto.builder()
                .id(session.getId())
                .userId(session.getUserId())
                .planDayId(session.getPlanDayId())
                .planDayName(planDay.getName() != null ? planDay.getName() : "Day " + planDay.getDayIdentifier())
                .planDayExercises(planDay.getExercises().stream()
                        .map(this::toPlanExerciseDto)
                        .collect(Collectors.toList()))
                .startedAt(session.getStartedAt())
                .status(session.getStatus())
                .sets(List.of())
                .build();
    }

    private PlanDayExerciseDto toPlanExerciseDto(WorkoutPlanDayExercise ex) {
        return PlanDayExerciseDto.builder()
                .id(ex.getId())
                .exerciseId(ex.getExercise().getId())
                .exerciseName(ex.getExercise().getName())
                .muscleGroup(ex.getExercise().getMuscleGroup())
                .orderIndex(ex.getOrderIndex())
                .targetSets(ex.getTargetSets())
                .targetReps(ex.getTargetReps())
                .restSeconds(ex.getRestSeconds())
                .notes(ex.getNotes())
                .build();
    }

    private WorkoutSetDto toSetDto(WorkoutSet set) {
        return WorkoutSetDto.builder()
                .id(set.getId())
                .sessionId(set.getSession().getId())
                .exerciseId(set.getExercise().getId())
                .exercise(exerciseService.toDto(set.getExercise()))
                .setNumber(set.getSetNumber())
                .repsCompleted(set.getRepsCompleted())
                .weightUsed(set.getWeightUsed())
                .completedAt(set.getCompletedAt())
                .build();
    }
}
