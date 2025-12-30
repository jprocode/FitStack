package com.fitstack.nutritionservice.repository;

import com.fitstack.nutritionservice.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {

    Optional<Food> findByFdcId(Integer fdcId);

    @Query("SELECT f FROM Food f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Food> searchByName(@Param("query") String query);

    boolean existsByFdcId(Integer fdcId);
}

