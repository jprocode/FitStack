# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the entire backend directory
COPY . .

# Navigate to parent and build
WORKDIR /app
RUN mvn clean package -DskipTests -pl fitstack-monolith -am

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the monolith target
COPY --from=build /app/fitstack-monolith/target/fitstack-monolith-*.jar app.jar

# Expose port (Render uses PORT env var)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
