package com.fitstack.nutritionservice.repository;

import com.fitstack.nutritionservice.entity.MealFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MealFoodRepository extends JpaRepository<MealFood, Long> {

    List<MealFood> findByMealId(Long mealId);

    void deleteByMealId(Long mealId);
}

