package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.dto.*;
import com.fitstack.workoutservice.entity.Exercise;
import com.fitstack.workoutservice.entity.WorkoutTemplate;
import com.fitstack.workoutservice.entity.WorkoutTemplateExercise;
import com.fitstack.workoutservice.exception.NotFoundException;
import com.fitstack.workoutservice.repository.ExerciseRepository;
import com.fitstack.workoutservice.repository.WorkoutTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutTemplateService {

    private final WorkoutTemplateRepository templateRepository;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseService exerciseService;

    public List<WorkoutTemplateDto> getTemplates(Long userId) {
        return templateRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public WorkoutTemplateDto getTemplate(Long userId, Long templateId) {
        WorkoutTemplate template = templateRepository.findByIdAndUserId(templateId, userId)
                .orElseThrow(() -> new NotFoundException("Template not found"));
        return toDto(template);
    }

    @Transactional
    public WorkoutTemplateDto createTemplate(Long userId, CreateTemplateRequest request) {
        WorkoutTemplate template = WorkoutTemplate.builder()
                .userId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .exercises(new ArrayList<>())
                .build();

        template = templateRepository.save(template);

        if (request.getExercises() != null) {
            for (int i = 0; i < request.getExercises().size(); i++) {
                CreateTemplateRequest.ExerciseEntry entry = request.getExercises().get(i);
                Exercise exercise = exerciseRepository.findById(entry.getExerciseId())
                        .orElseThrow(() -> new NotFoundException("Exercise not found: " + entry.getExerciseId()));

                WorkoutTemplateExercise templateExercise = WorkoutTemplateExercise.builder()
                        .template(template)
                        .exercise(exercise)
                        .orderIndex(entry.getOrderIndex() != null ? entry.getOrderIndex() : i)
                        .targetSets(entry.getTargetSets())
                        .targetReps(entry.getTargetReps())
                        .targetWeight(entry.getTargetWeight())
                        .notes(entry.getNotes())
                        .build();

                template.getExercises().add(templateExercise);
            }
        }

        template = templateRepository.save(template);
        return toDto(template);
    }

    @Transactional
    public WorkoutTemplateDto updateTemplate(Long userId, Long templateId, UpdateTemplateRequest request) {
        WorkoutTemplate template = templateRepository.findByIdAndUserId(templateId, userId)
                .orElseThrow(() -> new NotFoundException("Template not found"));

        if (request.getName() != null) {
            template.setName(request.getName());
        }
        if (request.getDescription() != null) {
            template.setDescription(request.getDescription());
        }
        if (request.getIsPublic() != null) {
            template.setIsPublic(request.getIsPublic());
        }

        if (request.getExercises() != null) {
            template.getExercises().clear();

            for (int i = 0; i < request.getExercises().size(); i++) {
                CreateTemplateRequest.ExerciseEntry entry = request.getExercises().get(i);
                Exercise exercise = exerciseRepository.findById(entry.getExerciseId())
                        .orElseThrow(() -> new NotFoundException("Exercise not found: " + entry.getExerciseId()));

                WorkoutTemplateExercise templateExercise = WorkoutTemplateExercise.builder()
                        .template(template)
                        .exercise(exercise)
                        .orderIndex(entry.getOrderIndex() != null ? entry.getOrderIndex() : i)
                        .targetSets(entry.getTargetSets())
                        .targetReps(entry.getTargetReps())
                        .targetWeight(entry.getTargetWeight())
                        .notes(entry.getNotes())
                        .build();

                template.getExercises().add(templateExercise);
            }
        }

        template = templateRepository.save(template);
        return toDto(template);
    }

    @Transactional
    public void deleteTemplate(Long userId, Long templateId) {
        WorkoutTemplate template = templateRepository.findByIdAndUserId(templateId, userId)
                .orElseThrow(() -> new NotFoundException("Template not found"));
        templateRepository.delete(template);
    }

    public WorkoutTemplateDto toDto(WorkoutTemplate template) {
        return WorkoutTemplateDto.builder()
                .id(template.getId())
                .userId(template.getUserId())
                .name(template.getName())
                .description(template.getDescription())
                .isPublic(template.getIsPublic())
                .exercises(template.getExercises().stream()
                        .map(this::toExerciseDto)
                        .collect(Collectors.toList()))
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }

    private TemplateExerciseDto toExerciseDto(WorkoutTemplateExercise te) {
        return TemplateExerciseDto.builder()
                .id(te.getId())
                .exerciseId(te.getExercise().getId())
                .exercise(exerciseService.toDto(te.getExercise()))
                .orderIndex(te.getOrderIndex())
                .targetSets(te.getTargetSets())
                .targetReps(te.getTargetReps())
                .targetWeight(te.getTargetWeight())
                .notes(te.getNotes())
                .build();
    }
}

