import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/useAuth"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Goals from "./pages/Goals"
import MyGoals from "./pages/MyGoals"
import GoalProgress from "./pages/GoalProgress"
import DailyMotivation from "./pages/DailyMotivation"
import FutureStory from "./pages/FutureStory"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import Journal from "./pages/Journal"

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) return <p>Loading...</p>

    return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
    const { user, loading } = useAuth()

    if (loading) return <p>Loading...</p>

    return (
        <Routes>
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/goals" /> : <Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/my-goals" element={<ProtectedRoute><MyGoals /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><GoalProgress /></ProtectedRoute>} />
            <Route path="/motivation" element={<ProtectedRoute><DailyMotivation /></ProtectedRoute>} />
            <Route path="/stories" element={<ProtectedRoute><FutureStory /></ProtectedRoute>} />
            <Route path="/stories/:storyId" element={<ProtectedRoute><FutureStory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
            <Route path="/journal/:journalId" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
    )
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    )
}

export default App