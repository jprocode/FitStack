package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.dto.ExerciseDto;
import com.fitstack.workoutservice.entity.Exercise;
import com.fitstack.workoutservice.exception.NotFoundException;
import com.fitstack.workoutservice.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public Page<ExerciseDto> getExercises(String search, String muscleGroup, String equipment, Pageable pageable) {
        return exerciseRepository.findByFilters(search, muscleGroup, equipment, pageable)
                .map(this::toDto);
    }

    public ExerciseDto getExercise(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Exercise not found"));
        return toDto(exercise);
    }

    public List<String> getMuscleGroups() {
        return exerciseRepository.findDistinctMuscleGroups();
    }

    public List<String> getEquipment() {
        return exerciseRepository.findDistinctEquipment();
    }

    public ExerciseDto toDto(Exercise exercise) {
        return ExerciseDto.builder()
                .id(exercise.getId())
                .name(exercise.getName())
                .muscleGroup(exercise.getMuscleGroup())
                .equipment(exercise.getEquipment())
                .difficulty(exercise.getDifficulty())
                .instructions(exercise.getInstructions())
                .gifUrl(exercise.getGifUrl())
                .createdAt(exercise.getCreatedAt())
                .build();
    }
}

