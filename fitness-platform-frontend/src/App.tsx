import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import BodyMetrics from '@/pages/BodyMetrics'
import Goals from '@/pages/Goals'
import ExerciseLibrary from '@/pages/ExerciseLibrary'
import TemplateList from '@/pages/TemplateList'
import TemplateBuilder from '@/pages/TemplateBuilder'
import TemplateDetail from '@/pages/TemplateDetail'
import ActiveWorkout from '@/pages/ActiveWorkout'
import WorkoutHistory from '@/pages/WorkoutHistory'
import { Toaster } from '@/components/ui/toaster'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/metrics" element={<BodyMetrics />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/templates" element={<TemplateList />} />
            <Route path="/templates/new" element={<TemplateBuilder />} />
            <Route path="/templates/:id" element={<TemplateDetail />} />
            <Route path="/templates/:id/edit" element={<TemplateBuilder />} />
            <Route path="/workout/:sessionId" element={<ActiveWorkout />} />
            <Route path="/history" element={<WorkoutHistory />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App

