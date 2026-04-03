import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Habits from './pages/Habits'
import Tasks from './pages/Tasks'
import Wellness from './pages/Wellness'
import Journal from './pages/Journal'
import AIAssistant from './pages/AIAssistant'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="habits" element={<Habits />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="wellness" element={<Wellness />} />
        <Route path="journal" element={<Journal />} />
        <Route path="assistant" element={<AIAssistant />} />
      </Route>
    </Routes>
  )
}
