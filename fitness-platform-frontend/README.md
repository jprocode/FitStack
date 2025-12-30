# FitStack Frontend

AI-Powered Fitness and Nutrition Platform - React Frontend

## Tech Stack

- React 18 with TypeScript
- Vite - Build tool
- TailwindCSS - Styling
- shadcn/ui - Component library
- Zustand - State management
- React Router - Routing
- Axios - HTTP client
- Recharts - Data visualization
- STOMP.js - WebSocket client

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8082/ws/workout
```

### 3. Start development server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui components
│   └── ...        # Custom components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and API client
├── pages/         # Page components
├── store/         # Zustand stores
└── types/         # TypeScript types
```

## Features

- **Authentication**: Login, Register, Protected Routes
- **User Profile**: Profile management, Body metrics tracking
- **Goals**: Set and track fitness goals
- **Exercise Library**: Browse and search exercises
- **Workout Templates**: Create custom workout routines
- **Active Workouts**: Real-time workout tracking with WebSocket
- **Workout History**: Review past workout sessions

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This project is configured for deployment on Vercel.

```bash
vercel --prod
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

