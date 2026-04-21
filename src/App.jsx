import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/clerk-react'
import ScrollToTop from './components/ScrollToTop'

function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/login" replace />
  return children
}
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import OTPVerification from './pages/OTPVerification'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PostShift from './pages/PostShift'
import Professionals from './pages/Professionals'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import MessageThread from './pages/MessageThread'
import Applicants from './pages/Applicants'
import Bookings from './pages/Bookings'
import Help from './pages/Help'
import Settings from './pages/Settings'
import OfficeProfile from './pages/OfficeProfile'
import SavedProfessionals from './pages/SavedProfessionals'
import ProviderDashboard from './pages/ProviderDashboard'
import FindShifts from './pages/FindShifts'
import ProviderRequests from './pages/ProviderRequests'
import RequestDetail from './pages/RequestDetail'
import ApplyShift from './pages/ApplyShift'
import ProviderMyProfile from './pages/ProviderMyProfile'
import ProviderProfilePreview from './pages/ProviderProfilePreview'
import OfficePublicProfile from './pages/OfficePublicProfile'
import OfficeMyProfile from './pages/OfficeMyProfile'
import ShiftDetails from './pages/ShiftDetails'
import ProviderEarnings from './pages/ProviderEarnings'
import ProviderSchedule from './pages/ProviderSchedule'
import ProviderDocuments from './pages/ProviderDocuments'
import TaxInformation from './pages/TaxInformation'
import FavoriteOffices from './pages/FavoriteOffices'
import ProviderFinance from './pages/ProviderFinance'
import ProviderHelpCenter from './pages/ProviderHelpCenter'
import ProviderSettings from './pages/ProviderSettings'
import ProviderProfile from './pages/ProviderProfile'
import ProfessionalProfile from './pages/ProfessionalProfile'
import ProviderAvailability from './pages/ProviderAvailability'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminUsers from './pages/admin/AdminUsers'
import AdminVerification from './pages/admin/AdminVerification'
import AdminFlags from './pages/admin/AdminFlags'
import AdminShifts from './pages/admin/AdminShifts'
import AdminReviews from './pages/admin/AdminReviews'
import AdminBilling from './pages/admin/AdminBilling'
import AdminTickets from './pages/admin/AdminTickets'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminAudit from './pages/admin/AdminAudit'
import OfficeDashboard from './pages/OfficeDashboard'
import PostTempShiftWizard from './pages/PostTempShiftWizard'
import PostPermanentJobWizard from './pages/PostPermanentJobWizard'
import ProviderAccountMenu from './pages/ProviderAccountMenu'
import ProviderPersonalSettings from './pages/ProviderPersonalSettings'
import ProviderSettingStub from './pages/ProviderSettingStub'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/otp-verification" element={<OTPVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<RequireAuth><OfficeDashboard /></RequireAuth>} />
      <Route path="/dashboard-old" element={<Navigate to="/dashboard" replace />} />
      <Route path="/post-shift" element={<RequireAuth><PostShift /></RequireAuth>} />
      <Route path="/post/temp" element={<RequireAuth><PostTempShiftWizard /></RequireAuth>} />
      <Route path="/post/permanent" element={<RequireAuth><PostPermanentJobWizard /></RequireAuth>} />
      <Route path="/office-dashboard-new" element={<RequireAuth><OfficeDashboard /></RequireAuth>} />
      <Route path="/professionals" element={<RequireAuth><Professionals /></RequireAuth>} />
      <Route path="/professionals/:id" element={<RequireAuth><ProfessionalProfile /></RequireAuth>} />
      <Route path="/profile" element={<Navigate to="/office-profile" replace />} />
      <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
      <Route path="/messages/:conversationId" element={<RequireAuth><MessageThread /></RequireAuth>} />
      <Route path="/applicants" element={<RequireAuth><Applicants /></RequireAuth>} />
      <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
      <Route path="/help" element={<RequireAuth><Help /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/office-profile" element={<RequireAuth><OfficeProfile /></RequireAuth>} />
      <Route path="/saved-professionals" element={<RequireAuth><SavedProfessionals /></RequireAuth>} />
      <Route path="/provider" element={<RequireAuth><ProviderDashboard /></RequireAuth>} />
      <Route path="/provider-dashboard" element={<Navigate to="/provider" replace />} />
      <Route path="/find-shifts" element={<RequireAuth><FindShifts /></RequireAuth>} />
      <Route path="/find-shifts/:id" element={<RequireAuth><ApplyShift /></RequireAuth>} />
      <Route path="/provider-find-shifts" element={<Navigate to="/find-shifts" replace />} />
      <Route path="/requests" element={<RequireAuth><ProviderRequests /></RequireAuth>} />
      <Route path="/requests/:id" element={<RequireAuth><RequestDetail /></RequireAuth>} />
      <Route path="/provider-requests" element={<Navigate to="/requests" replace />} />
      <Route path="/provider-messages" element={<Navigate to="/messages" replace />} />
      <Route path="/finance" element={<RequireAuth><ProviderFinance /></RequireAuth>} />
      <Route path="/provider-earnings" element={<Navigate to="/finance" replace />} />
      <Route path="/provider-schedule" element={<RequireAuth><ProviderSchedule /></RequireAuth>} />
      <Route path="/provider-documents" element={<RequireAuth><ProviderDocuments /></RequireAuth>} />
      <Route path="/provider-tax" element={<RequireAuth><TaxInformation /></RequireAuth>} />
      <Route path="/favorites" element={<RequireAuth><FavoriteOffices /></RequireAuth>} />
      <Route path="/provider-favorites" element={<Navigate to="/favorites" replace />} />
      <Route path="/provider-help" element={<RequireAuth><ProviderHelpCenter /></RequireAuth>} />
      <Route path="/provider-settings" element={<RequireAuth><ProviderSettings /></RequireAuth>} />
      <Route path="/account" element={<RequireAuth><ProviderAccountMenu /></RequireAuth>} />
      <Route path="/account/personal" element={<RequireAuth><ProviderPersonalSettings /></RequireAuth>} />
      <Route path="/account/setting" element={<RequireAuth><ProviderSettingStub /></RequireAuth>} />
      <Route path="/provider-profile" element={<Navigate to="/my-profile" replace />} />
      <Route path="/provider-profile/:id" element={<RequireAuth><ProviderProfile /></RequireAuth>} />
      <Route path="/my-profile" element={<RequireAuth><ProviderMyProfile /></RequireAuth>} />
      <Route path="/provider-profile-preview" element={<RequireAuth><ProviderProfilePreview /></RequireAuth>} />
      <Route path="/provider/:id" element={<RequireAuth><ProviderProfile /></RequireAuth>} />
      <Route path="/provider-availability" element={<RequireAuth><ProviderAvailability /></RequireAuth>} />
      <Route path="/office-profile/:id" element={<RequireAuth><OfficeProfile /></RequireAuth>} />
      <Route path="/office/:id" element={<RequireAuth><OfficePublicProfile /></RequireAuth>} />
      <Route path="/my-office" element={<RequireAuth><OfficeMyProfile /></RequireAuth>} />
      <Route path="/shift/:id" element={<RequireAuth><ShiftDetails /></RequireAuth>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="verification" element={<AdminVerification />} />
        <Route path="flags" element={<AdminFlags />} />
        <Route path="shifts" element={<AdminShifts />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="announce" element={<AdminAnnouncements />} />
        <Route path="audit" element={<AdminAudit />} />
      </Route>
      </Routes>
    </>
  )
}

export default App