# FitStack Technology Stack

A comprehensive overview of all technologies used in the FitStack fitness and nutrition platform.

---

## Backend Technologies

### Core

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **Java** | 21 | Primary programming language | LTS release with modern features like virtual threads, pattern matching, and record classes. Industry-standard for enterprise applications. |
| **Spring Boot** | 3.4.1 | Application framework | Provides auto-configuration, embedded servers, and production-ready features. Simplifies microservices development with minimal boilerplate. |
| **Maven** | 3.x | Build and dependency management | Manages project dependencies, builds JAR/WAR files, and handles multi-module project structure. |

### Microservices Infrastructure

| Technology | What It Does | Why It's Used |
|------------|--------------|---------------|
| **Spring Cloud Gateway** | API Gateway | Routes all client requests to appropriate microservices. Handles JWT validation, CORS, and will support rate limiting. Non-blocking and reactive. |
| **Netflix Eureka** | Service Discovery | Services register themselves on startup. Enables dynamic service discovery without hardcoded URLs. Essential for scaling and load balancing. |
| **Spring Cloud** | 2024.0.0 | Cloud-native tools | Provides coordinated configuration and integration between all Spring Cloud components. |

### Security

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **JJWT (JSON Web Tokens)** | 0.12.6 | Authentication tokens | Stateless authentication using signed tokens. Contains user ID and expiration. Validated at the gateway level. |
| **BCrypt** | (Spring Security) | Password hashing | Industry-standard password hashing algorithm. Automatically salts passwords and is resistant to brute-force attacks. |
| **Spring Security** | (via Spring Boot) | Security framework | Handles authentication, authorization, and protection against common vulnerabilities (CSRF, XSS, etc.). |

### Data Layer

| Technology | What It Does | Why It's Used |
|------------|--------------|---------------|
| **PostgreSQL** | Relational database | Reliable, ACID-compliant database with excellent JSON support and full-text search. Each service has its own database for data isolation. |
| **Spring Data JPA** | ORM layer | Simplifies database operations with repository interfaces. Auto-generates queries from method names. |
| **Hibernate** | JPA implementation | Object-relational mapping. Maps Java objects to database tables. Handles lazy loading and caching. |
| **HikariCP** | Connection pooling | High-performance JDBC connection pool. Manages database connections efficiently. |
| **Redis** | In-memory cache | Caches frequently accessed data (exercises, active sessions). Supports pub/sub for WebSocket coordination. |

### Development Tools

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **Lombok** | 1.18.36 | Boilerplate reduction | Auto-generates getters, setters, constructors, builders, and more via annotations. Keeps code clean. |
| **Spring Boot Actuator** | (via Spring Boot) | Production monitoring | Exposes health endpoints, metrics, and application info. Essential for production deployments. |
| **Spring Boot Test** | (via Spring Boot) | Testing framework | Provides test utilities, mock beans, and integration testing support. |

### Real-time Communication

| Technology | What It Does | Why It's Used |
|------------|--------------|---------------|
| **Spring WebSocket** | Bi-directional communication | Enables real-time updates during active workouts. Broadcasts set completions and rest timer updates. |
| **STOMP** | Messaging protocol | Simple text-based messaging protocol over WebSocket. Provides pub/sub semantics. |

---

## Frontend Technologies

### Core

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **React** | 19.0.0 | UI library | Latest version with improved performance. Component-based architecture for reusable UI elements. Massive ecosystem and community. |
| **TypeScript** | 5.7.2 | Type-safe JavaScript | Catches errors at compile time, provides better IDE support, and improves code maintainability. |
| **Vite** | 6.0.7 | Build tool | Lightning-fast development server with hot module replacement (HMR). Optimized production builds. |

### Styling

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **TailwindCSS** | 3.4.17 | Utility-first CSS | Rapid UI development with utility classes. Highly customizable, purges unused CSS for small bundles. |
| **tailwindcss-animate** | 1.0.7 | Animation utilities | Pre-built animation classes for smooth transitions and micro-interactions. |
| **tailwind-merge** | 2.6.0 | Class merging | Intelligently merges Tailwind classes, avoiding conflicts when combining conditional styles. |
| **PostCSS** | 8.4.49 | CSS processing | Transforms CSS with plugins. Required for TailwindCSS and autoprefixing. |
| **Autoprefixer** | 10.4.20 | Vendor prefixes | Automatically adds browser-specific prefixes for cross-browser compatibility. |

### UI Components

| Technology | What It Does | Why It's Used |
|------------|--------------|---------------|
| **Radix UI** | Headless UI primitives | Accessible, unstyled component primitives. Handles keyboard navigation, focus management, and ARIA attributes. |
| **class-variance-authority** | 0.7.1 | Variant management | Creates type-safe component variants. Manages complex conditional styling. |
| **clsx** | 2.1.1 | Conditional classes | Utility for constructing className strings conditionally. Clean syntax for dynamic styles. |
| **Lucide React** | 0.469.0 | Icon library | Beautiful, customizable SVG icons. Tree-shakeable for optimal bundle size. |

**Radix Components Used:**
- `react-avatar` - User profile images with fallbacks
- `react-dialog` - Modal dialogs
- `react-dropdown-menu` - Accessible dropdown menus
- `react-label` - Form labels
- `react-popover` - Popup content
- `react-progress` - Progress indicators
- `react-select` - Select inputs
- `react-separator` - Visual separators
- `react-slot` - Polymorphic components
- `react-switch` - Toggle switches
- `react-tabs` - Tabbed interfaces
- `react-toast` - Toast notifications

### State Management & Routing

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **Zustand** | 5.0.2 | State management | Minimal, fast state management. No boilerplate like Redux. Uses hooks for intuitive API. |
| **React Router DOM** | 7.1.1 | Client-side routing | Declarative routing for React. Handles navigation, URL parameters, and protected routes. |

### Forms & Validation

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **React Hook Form** | 7.54.2 | Form management | Performant form handling with minimal re-renders. Easy validation integration. |
| **Zod** | 3.24.1 | Schema validation | TypeScript-first schema declaration and validation. Type inference for forms. |
| **@hookform/resolvers** | 3.9.1 | Validation bridge | Connects Zod schemas with React Hook Form for seamless validation. |

### Data Fetching & API

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **Axios** | 1.7.9 | HTTP client | Promise-based HTTP client with interceptors, automatic JSON transforms, and request cancellation. |

### Real-time & WebSocket

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **@stomp/stompjs** | 7.0.0 | STOMP client | WebSocket messaging protocol client. Connects to Spring WebSocket endpoints. |
| **sockjs-client** | 1.6.1 | WebSocket fallback | Provides fallback transports for browsers without WebSocket support. |

### Charts & Data Visualization

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **Recharts** | 2.15.0 | Charts library | Composable charting components built on D3. Perfect for React with declarative API. |

### Date Handling

| Technology | Version | What It Does | Why It's Used |
|------------|---------|--------------|---------------|
| **date-fns** | 4.1.0 | Date utility library | Modern, modular date utility. Tree-shakeable, immutable, and TypeScript-friendly. |
| **react-day-picker** | 9.4.4 | Date picker | Flexible, customizable date picker component. Works well with date-fns. |

### Development & Build

| Technology | What It Does | Why It's Used |
|------------|--------------|---------------|
| **ESLint** | 9.17.0 | Code linting | Identifies and fixes JavaScript/TypeScript problems. Enforces code style consistency. |
| **eslint-plugin-react-hooks** | 5.1.0 | Hooks linting | Enforces Rules of Hooks. Catches common React mistakes. |
| **eslint-plugin-react-refresh** | 0.4.16 | HMR linting | Ensures components are compatible with Fast Refresh. |
| **@vitejs/plugin-react** | 4.3.4 | Vite React plugin | Enables React Fast Refresh in Vite. Handles JSX transformation. |

---

## External APIs

| API | What It Does | Why It's Used |
|-----|--------------|---------------|
| **ExerciseDB API** | Exercise database | Provides 847 exercises across 12 equipment types and 13 muscle groups. Imported via REST API and stored locally. |
| **USDA FoodData Central** | Food & nutrition data | Official U.S. government source for food nutrition information. Powers food search and macro tracking. |
| **OpenAI / Claude** | AI meal generation | Generates personalized meal plans based on user preferences, dietary restrictions, and macro targets. |

---

## Database Structure

Monolith uses separate PostgreSQL databases for data isolation:

| Database | Module | Primary Tables |
|----------|--------|----------------|
| `fitness_users` | User Module | users, user_profiles, body_metrics, goals |
| `fitness_workouts` | Workout Module | exercises (847 rows), workout_templates, workout_plans, workout_sessions, workout_sets |
| `fitness_nutrition` | Nutrition Module | foods, meals, meal_foods, meal_plans |

---

## Port Assignments

| Component | Port | Description |
|-----------|------|-------------|
| Frontend (Dev) | 5173 | Vite development server |
| Backend API | 8080 | Spring Boot monolith |
| PostgreSQL | 5432 | Database server |

---

## Architecture Pattern

**Modular Monolith Architecture** with:
- **User Module** - Authentication, profiles, body metrics, goals
- **Workout Module** - 847 exercises, templates, plans, sessions, analytics
- **Nutrition Module** - Food search, meal logging, AI meal plans
- **JWT Authentication** - Stateless security
- **WebSocket** - Real-time workout sessions

---

## Key Design Decisions

1. **Java 21 over lower versions** - Virtual threads for efficient concurrent processing, pattern matching for cleaner code.

2. **Spring Boot 3.4** - Latest stable release with best performance and security.

3. **PostgreSQL over NoSQL** - Need for ACID transactions, complex queries, and data integrity in fitness tracking.

4. **React 19 with TypeScript** - Type safety catches bugs early, better refactoring support.

5. **Zustand over Redux** - Simpler API, less boilerplate, perfect for medium-complexity state.

6. **TailwindCSS** - Rapid development, consistent styling, small production bundles.

7. **Radix UI** - Accessibility built-in, unstyled for full customization.

8. **Vite over Webpack** - Significantly faster development experience.
