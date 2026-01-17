package com.fitstack.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Configuration
@EnableTransactionManagement
public class DataSourceConfig {

    private Map<String, Object> jpaProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put("hibernate.hbm2ddl.auto", "update");
        props.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        props.put("hibernate.format_sql", "true");
        return props;
    }

    // =====================================================
    // USER DATABASE CONFIGURATION (Primary)
    // =====================================================

    @Primary
    @Bean(name = "usersDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.users")
    public DataSource usersDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean(name = "usersEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean usersEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("usersDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.fitstack.user.entity")
                .persistenceUnit("users")
                .properties(jpaProperties())
                .build();
    }

    @Primary
    @Bean(name = "usersTransactionManager")
    public PlatformTransactionManager usersTransactionManager(
            @Qualifier("usersEntityManagerFactory") LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        return new JpaTransactionManager(Objects.requireNonNull(entityManagerFactory.getObject()));
    }

    // =====================================================
    // WORKOUT DATABASE CONFIGURATION
    // =====================================================

    @Bean(name = "workoutsDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.workouts")
    public DataSource workoutsDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "workoutsEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean workoutsEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("workoutsDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.fitstack.workout.entity")
                .persistenceUnit("workouts")
                .properties(jpaProperties())
                .build();
    }

    @Bean(name = "workoutsTransactionManager")
    public PlatformTransactionManager workoutsTransactionManager(
            @Qualifier("workoutsEntityManagerFactory") LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        return new JpaTransactionManager(Objects.requireNonNull(entityManagerFactory.getObject()));
    }

    // =====================================================
    // NUTRITION DATABASE CONFIGURATION
    // =====================================================

    @Bean(name = "nutritionDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.nutrition")
    public DataSource nutritionDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "nutritionEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean nutritionEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("nutritionDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.fitstack.nutrition.entity")
                .persistenceUnit("nutrition")
                .properties(jpaProperties())
                .build();
    }

    @Bean(name = "nutritionTransactionManager")
    public PlatformTransactionManager nutritionTransactionManager(
            @Qualifier("nutritionEntityManagerFactory") LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        return new JpaTransactionManager(Objects.requireNonNull(entityManagerFactory.getObject()));
    }
}
