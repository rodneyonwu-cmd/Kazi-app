import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import PostShift from './pages/PostShift'
import Professionals from './pages/Professionals'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/post-shift" element={<PostShift />} />
      <Route path="/professionals" element={<Professionals />} />
    </Routes>
  )
}

export default App