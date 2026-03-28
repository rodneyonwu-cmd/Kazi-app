import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import OTPVerification from './pages/OTPVerification'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import PostShift from './pages/PostShift'
import Professionals from './pages/Professionals'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Applicants from './pages/Applicants'
import Bookings from './pages/Bookings'
import Help from './pages/Help'
import Settings from './pages/Settings'
import OfficeProfile from './pages/OfficeProfile'
import SavedProfessionals from './pages/SavedProfessionals'
import ProviderDashboard from './pages/ProviderDashboard'
import FindShifts from './pages/FindShifts'
import ShiftRequests from './pages/ShiftRequests'
import ProviderMessages from './pages/ProviderMessages'
import ProviderEarnings from './pages/ProviderEarnings'
import ProviderSchedule from './pages/ProviderSchedule'
import ProviderDocuments from './pages/ProviderDocuments'
import TaxInformation from './pages/TaxInformation'
import FavoriteOffices from './pages/FavoriteOffices'
import ProviderHelpCenter from './pages/ProviderHelpCenter'
import ProviderSettings from './pages/ProviderSettings'
import ProviderProfile from './pages/ProviderProfile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/otp-verification" element={<OTPVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/post-shift" element={<PostShift />} />
      <Route path="/professionals" element={<Professionals />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/applicants" element={<Applicants />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/help" element={<Help />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/office-profile" element={<OfficeProfile />} />
      <Route path="/saved-professionals" element={<SavedProfessionals />} />
      <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      <Route path="/provider-find-shifts" element={<FindShifts />} />
      <Route path="/provider-requests" element={<ShiftRequests />} />
      <Route path="/provider-messages" element={<ProviderMessages />} />
      <Route path="/provider-earnings" element={<ProviderEarnings />} />
      <Route path="/provider-schedule" element={<ProviderSchedule />} />
      <Route path="/provider-documents" element={<ProviderDocuments />} />
      <Route path="/provider-tax" element={<TaxInformation />} />
      <Route path="/provider-favorites" element={<FavoriteOffices />} />
      <Route path="/provider-help" element={<ProviderHelpCenter />} />
      <Route path="/provider-settings" element={<ProviderSettings />} />
      <Route path="/provider-profile" element={<ProviderProfile />} />
    </Routes>
  )
}

export default App
