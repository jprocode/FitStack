# Fitness Platform Backend

AI-Powered Fitness and Nutrition Platform - Backend Microservices Monorepo

## Architecture

This monorepo contains the following microservices:

- **eureka-server** (Port 8761) - Service discovery server
- **api-gateway** (Port 8080) - API Gateway with JWT validation and routing
- **user-service** (Port 8081) - User authentication, profiles, body metrics, goals
- **workout-service** (Port 8082) - Exercise library, workout templates, sessions
- **nutrition-service** (Port 8083) - Food database, meal planning, AI integration

## Tech Stack

- Java 17
- Spring Boot 3.2.x
- Spring Cloud 2023.0.0
- Spring Cloud Netflix Eureka
- Spring Cloud Gateway
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Redis (for caching)

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- PostgreSQL 14+
- Redis 7+

## Getting Started

### 1. Start Eureka Server first
```bash
cd eureka-server
mvn spring-boot:run
```

### 2. Start other services
```bash
# In separate terminals
cd user-service && mvn spring-boot:run
cd workout-service && mvn spring-boot:run
cd nutrition-service && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run
```

### 3. Access Eureka Dashboard
Open http://localhost:8761 in your browser

## API Gateway Routes

All requests go through the API Gateway at `http://localhost:8080/api/`

- `/api/users/**` → User Service
- `/api/workouts/**` → Workout Service
- `/api/nutrition/**` → Nutrition Service

## Environment Variables

See individual service `application.properties` files for required configuration.

## Building

```bash
# Build all modules
mvn clean package

# Build specific module
mvn clean package -pl user-service
```

## Testing

```bash
# Run all tests
mvn test

# Run tests for specific module
mvn test -pl user-service
```

