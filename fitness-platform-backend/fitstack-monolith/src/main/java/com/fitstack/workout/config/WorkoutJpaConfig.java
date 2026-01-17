package com.fitstack.workout.config;

import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.fitstack.workout.repository",
    entityManagerFactoryRef = "workoutsEntityManagerFactory",
    transactionManagerRef = "workoutsTransactionManager"
)
public class WorkoutJpaConfig {
}
