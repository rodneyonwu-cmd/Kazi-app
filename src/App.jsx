import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import PostShift from './pages/PostShift'
import Professionals from './pages/Professionals'
import Profile from './pages/Profile'
import Messages from './pages/Messages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/post-shift" element={<PostShift />} />
      <Route path="/professionals" element={<Professionals />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/messages" element={<Messages />} />
    </Routes>
  )
}

export default App