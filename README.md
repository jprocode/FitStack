# FitStack - AI-Powered Fitness & Nutrition Platform

<div align="center">

![FitStack Logo](https://img.shields.io/badge/FitStack-Fitness%20Platform-10b981?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIyIDEyaC00bC0zIDlMOSAzbC0zIDloLTQiLz48L3N2Zz4=)

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A full-stack microservices application for tracking workouts, AI-powered meal planning, and body metrics analytics.

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [API Documentation](API.md) • [Deployment](DEPLOYMENT.md)

</div>

---

## Features

### 🏋️ Workout Management
- **Exercise Library** - Browse 30+ exercises with instructions
- **Workout Templates** - Create and save custom workout routines
- **Real-time Sessions** - Track sets, reps, and weights with live updates
- **Progressive Overload** - AI-generated suggestions for progression
- **Personal Records** - Automatic PR tracking with estimated 1RM

### 🥗 AI Nutrition Planning
- **Food Search** - Search USDA database with 300,000+ foods
- **Meal Logging** - Track daily meals and macros
- **AI Meal Plans** - Generate personalized meal plans based on your goals
- **Macro Dashboard** - Visualize daily protein, carbs, and fat intake

### 📊 Analytics & Progress
- **Weight Trends** - Interactive charts with 7-day moving average
- **Goal Tracking** - Visual progress toward weight/fitness goals
- **Workout Frequency** - Weekly workout consistency charts
- **Volume Progression** - Track total weight lifted over time

### 🎨 Modern UI/UX
- **Dark/Light Mode** - System-aware theme with manual toggle
- **Mobile Responsive** - Full functionality on any device
- **Real-time Updates** - WebSocket-powered live workout sessions
- **Beautiful Charts** - Recharts-powered data visualization

---

## Quick Start

### Prerequisites

- Java 21 (LTS)
- Node.js 22+ (LTS)
- PostgreSQL 14+
- Redis 7+
- Maven 3.9+

### 1. Clone the Repository

```bash
git clone https://github.com/jprocode/FitStack.git
cd FitStack
```

### 2. Database Setup

```bash
# Create databases
psql -U postgres -c "CREATE DATABASE fitness_users;"
psql -U postgres -c "CREATE DATABASE fitness_workouts;"
psql -U postgres -c "CREATE DATABASE fitness_nutrition;"
```

### 3. Environment Variables

```bash
# Backend (.env or export)
export JWT_SECRET=your-secret-key-min-32-chars
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=your-password
export USDA_API_KEY=your-usda-api-key
export AI_API_KEY=your-openai-or-anthropic-key
export EXERCISE_API_KEY=your-exercisedb-api-key
```

### 4. Start Backend Services

```bash
cd fitness-platform-backend

# Start Eureka Server
cd eureka-server && mvn spring-boot:run &

# Start API Gateway
cd ../api-gateway && mvn spring-boot:run &

# Start User Service
cd ../user-service && mvn spring-boot:run &

# Start Workout Service
cd ../workout-service && mvn spring-boot:run &

# Start Nutrition Service
cd ../nutrition-service && mvn spring-boot:run &
```

### 5. Start Frontend

```bash
cd fitness-platform-frontend
npm install
npm run dev
```

### 6. Access Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (5173)                     │
│              TypeScript + TailwindCSS + Recharts            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (8080)                         │
│           Spring Cloud Gateway + JWT Validation              │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│User Service │   │Workout Svc  │   │Nutrition Svc│
│   (8081)    │   │   (8082)    │   │   (8083)    │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       │    ┌────────────┴────────────┐    │
       │    │     Eureka Server       │    │
       │    │        (8761)           │    │
       │    └─────────────────────────┘    │
       │                                   │
       ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
│   fitness_users │ fitness_workouts │ fitness_nutrition      │
└─────────────────────────────────────────────────────────────┘
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system design.

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Core language |
| Spring Boot 3.4 | Application framework |
| Spring Cloud Gateway | API Gateway |
| Spring Cloud Netflix Eureka | Service discovery |
| Spring Security + JWT | Authentication |
| Spring Data JPA | Database ORM |
| Spring WebSocket | Real-time features |
| PostgreSQL | Primary database |
| Redis | Caching |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript 5.7 | Type safety |
| Vite 6 | Build tool |
| TailwindCSS | Styling |
| shadcn/ui | Component library |
| Recharts | Data visualization |
| Zustand | State management |
| Axios | HTTP client |

### External APIs
| API | Purpose |
|-----|---------|
| ExerciseDB | Exercise library |
| USDA FoodData Central | Food nutrition data |
| OpenAI/Claude | AI meal planning |

---

## Project Structure

```
FitStack/
├── fitness-platform-backend/
│   ├── eureka-server/          # Service registry
│   ├── api-gateway/            # API routing & auth
│   ├── user-service/           # Users, auth, metrics, goals
│   ├── workout-service/        # Exercises, workouts, analytics
│   ├── nutrition-service/      # Foods, meals, AI planning
│   └── pom.xml                 # Parent POM
├── fitness-platform-frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route pages
│   │   ├── lib/                # API client, utilities
│   │   ├── store/              # Zustand stores
│   │   └── types/              # TypeScript types
│   └── package.json
├── test1.md                    # Month 1 testing guide
├── test2.md                    # Month 2 testing guide
├── test3.md                    # Month 3 testing guide
├── design.md                   # Design document
├── ARCHITECTURE.md             # System architecture
├── API.md                      # API documentation
├── DEPLOYMENT.md               # Deployment guide
└── README.md
```

---

## Testing

Testing Guides will be updated shortly after removign sensitive information (testing.md)

### Running Backend Tests
```bash
cd fitness-platform-backend
mvn test
```

### Manual Testing
1. Register a new user
2. Log body metrics
3. Create a workout template
4. Complete a workout session
5. Search and log meals
6. Generate an AI meal plan
7. View analytics dashboards

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
File not yet added. 
---

## Acknowledgments

- [ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb) for exercise data
- [USDA FoodData Central](https://fdc.nal.usda.gov/) for nutrition data
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Recharts](https://recharts.org/) for chart components

---

<div align="center">
Built with hundreds of protien shakes by Jay Pandya
</div>
