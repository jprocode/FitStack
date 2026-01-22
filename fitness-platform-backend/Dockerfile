# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the entire repo (since we're building from root)
COPY . .

# Build the monolith from the backend directory
WORKDIR /app/fitness-platform-backend
RUN mvn clean package -DskipTests -pl fitstack-monolith -am

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR
COPY --from=build /app/fitness-platform-backend/fitstack-monolith/target/fitstack-monolith-*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
