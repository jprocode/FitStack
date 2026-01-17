package com.fitstack.nutrition.config;

import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.fitstack.nutrition.repository",
    entityManagerFactoryRef = "nutritionEntityManagerFactory",
    transactionManagerRef = "nutritionTransactionManager"
)
public class NutritionJpaConfig {
}
