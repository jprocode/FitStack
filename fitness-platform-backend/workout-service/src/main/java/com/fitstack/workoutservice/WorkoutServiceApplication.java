package com.fitstack.workoutservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class WorkoutServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkoutServiceApplication.class, args);
    }
}

