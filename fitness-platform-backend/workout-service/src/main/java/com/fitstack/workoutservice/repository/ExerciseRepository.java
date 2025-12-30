package com.fitstack.workoutservice.repository;

import com.fitstack.workoutservice.entity.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    @Query("SELECT e FROM Exercise e WHERE " +
           "(:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:muscleGroup IS NULL OR LOWER(e.muscleGroup) = LOWER(:muscleGroup)) AND " +
           "(:equipment IS NULL OR LOWER(e.equipment) = LOWER(:equipment))")
    Page<Exercise> findByFilters(
            @Param("search") String search,
            @Param("muscleGroup") String muscleGroup,
            @Param("equipment") String equipment,
            Pageable pageable
    );

    @Query("SELECT DISTINCT e.muscleGroup FROM Exercise e WHERE e.muscleGroup IS NOT NULL ORDER BY e.muscleGroup")
    List<String> findDistinctMuscleGroups();

    @Query("SELECT DISTINCT e.equipment FROM Exercise e WHERE e.equipment IS NOT NULL ORDER BY e.equipment")
    List<String> findDistinctEquipment();

    Optional<Exercise> findByExternalId(String externalId);

    boolean existsByExternalId(String externalId);
}

