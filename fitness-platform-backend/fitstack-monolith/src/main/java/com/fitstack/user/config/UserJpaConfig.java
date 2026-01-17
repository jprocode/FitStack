package com.fitstack.user.config;

import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.fitstack.user.repository",
    entityManagerFactoryRef = "usersEntityManagerFactory",
    transactionManagerRef = "usersTransactionManager"
)
public class UserJpaConfig {
}
