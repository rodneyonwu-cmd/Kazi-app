import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/clerk-react'
import ScrollToTop from './components/ScrollToTop'
import RoleGuard from './components/RoleGuard'

function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/login" replace />
  return children
}

const OfficeOnly = ({ children }) => (
  <RequireAuth>
    <RoleGuard requireRole="office">{children}</RoleGuard>
  </RequireAuth>
)

const ProviderOnly = ({ children }) => (
  <RequireAuth>
    <RoleGuard requireRole="provider">{children}</RoleGuard>
  </RequireAuth>
)
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
import ProviderHourlyRate from './pages/ProviderHourlyRate'
import ProviderTravelRadius from './pages/ProviderTravelRadius'
import ProviderMinimumShift from './pages/ProviderMinimumShift'
import ProviderLegalDoc from './pages/ProviderLegalDoc'
import ProviderChangePassword from './pages/ProviderChangePassword'
import ProviderPhoneNumber from './pages/ProviderPhoneNumber'
import ProviderDateOfBirth from './pages/ProviderDateOfBirth'
import ProviderHomeAddress from './pages/ProviderHomeAddress'
import ProviderProfilePhoto from './pages/ProviderProfilePhoto'

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

      {/* Office-only routes */}
      <Route path="/dashboard" element={<OfficeOnly><OfficeDashboard /></OfficeOnly>} />
      <Route path="/dashboard-old" element={<Navigate to="/dashboard" replace />} />
      <Route path="/post-shift" element={<OfficeOnly><PostShift /></OfficeOnly>} />
      <Route path="/post/temp" element={<OfficeOnly><PostTempShiftWizard /></OfficeOnly>} />
      <Route path="/post/permanent" element={<OfficeOnly><PostPermanentJobWizard /></OfficeOnly>} />
      <Route path="/office-dashboard-new" element={<OfficeOnly><OfficeDashboard /></OfficeOnly>} />
      <Route path="/professionals" element={<OfficeOnly><Professionals /></OfficeOnly>} />
      <Route path="/professionals/:id" element={<RequireAuth><ProfessionalProfile /></RequireAuth>} />
      <Route path="/profile" element={<Navigate to="/office-profile" replace />} />
      <Route path="/applicants" element={<OfficeOnly><Applicants /></OfficeOnly>} />
      <Route path="/bookings" element={<OfficeOnly><Bookings /></OfficeOnly>} />
      <Route path="/help" element={<OfficeOnly><Help /></OfficeOnly>} />
      <Route path="/settings" element={<OfficeOnly><Settings /></OfficeOnly>} />
      <Route path="/office-profile" element={<OfficeOnly><OfficeProfile /></OfficeOnly>} />
      <Route path="/saved-professionals" element={<OfficeOnly><SavedProfessionals /></OfficeOnly>} />
      <Route path="/office-profile/:id" element={<OfficeOnly><OfficeProfile /></OfficeOnly>} />
      <Route path="/office/:id" element={<OfficeOnly><OfficePublicProfile /></OfficeOnly>} />
      <Route path="/my-office" element={<OfficeOnly><OfficeMyProfile /></OfficeOnly>} />

      {/* Shared (both roles, or cross-role discovery) */}
      <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
      <Route path="/messages/:conversationId" element={<RequireAuth><MessageThread /></RequireAuth>} />
      <Route path="/shift/:id" element={<RequireAuth><ShiftDetails /></RequireAuth>} />
      <Route path="/provider-profile/:id" element={<RequireAuth><ProviderProfile /></RequireAuth>} />
      <Route path="/provider/:id" element={<RequireAuth><ProviderProfile /></RequireAuth>} />

      {/* Provider-only routes */}
      <Route path="/provider" element={<ProviderOnly><ProviderDashboard /></ProviderOnly>} />
      <Route path="/provider-dashboard" element={<Navigate to="/provider" replace />} />
      <Route path="/find-shifts" element={<ProviderOnly><FindShifts /></ProviderOnly>} />
      <Route path="/find-shifts/:id" element={<ProviderOnly><ApplyShift /></ProviderOnly>} />
      <Route path="/provider-find-shifts" element={<Navigate to="/find-shifts" replace />} />
      <Route path="/requests" element={<ProviderOnly><ProviderRequests /></ProviderOnly>} />
      <Route path="/requests/:id" element={<ProviderOnly><RequestDetail /></ProviderOnly>} />
      <Route path="/provider-requests" element={<Navigate to="/requests" replace />} />
      <Route path="/provider-messages" element={<Navigate to="/messages" replace />} />
      <Route path="/finance" element={<ProviderOnly><ProviderFinance /></ProviderOnly>} />
      <Route path="/provider-earnings" element={<Navigate to="/finance" replace />} />
      <Route path="/provider-schedule" element={<ProviderOnly><ProviderSchedule /></ProviderOnly>} />
      <Route path="/provider-documents" element={<ProviderOnly><ProviderDocuments /></ProviderOnly>} />
      <Route path="/provider-tax" element={<ProviderOnly><TaxInformation /></ProviderOnly>} />
      <Route path="/favorites" element={<ProviderOnly><FavoriteOffices /></ProviderOnly>} />
      <Route path="/provider-favorites" element={<Navigate to="/favorites" replace />} />
      <Route path="/provider-help" element={<ProviderOnly><ProviderHelpCenter /></ProviderOnly>} />
      <Route path="/provider-settings" element={<ProviderOnly><ProviderSettings /></ProviderOnly>} />
      <Route path="/account" element={<ProviderOnly><ProviderAccountMenu /></ProviderOnly>} />
      <Route path="/account/personal" element={<ProviderOnly><ProviderPersonalSettings /></ProviderOnly>} />
      <Route path="/account/hourly-rate" element={<ProviderOnly><ProviderHourlyRate /></ProviderOnly>} />
      <Route path="/account/travel-radius" element={<ProviderOnly><ProviderTravelRadius /></ProviderOnly>} />
      <Route path="/account/minimum-shift" element={<ProviderOnly><ProviderMinimumShift /></ProviderOnly>} />
      <Route path="/legal/:slug" element={<ProviderOnly><ProviderLegalDoc /></ProviderOnly>} />
      <Route path="/account/change-password" element={<ProviderOnly><ProviderChangePassword /></ProviderOnly>} />
      <Route path="/account/phone" element={<ProviderOnly><ProviderPhoneNumber /></ProviderOnly>} />
      <Route path="/account/date-of-birth" element={<ProviderOnly><ProviderDateOfBirth /></ProviderOnly>} />
      <Route path="/account/home-address" element={<ProviderOnly><ProviderHomeAddress /></ProviderOnly>} />
      <Route path="/account/profile-photo" element={<ProviderOnly><ProviderProfilePhoto /></ProviderOnly>} />
      <Route path="/provider-profile" element={<Navigate to="/my-profile" replace />} />
      <Route path="/my-profile" element={<ProviderOnly><ProviderMyProfile /></ProviderOnly>} />
      <Route path="/provider-profile-preview" element={<ProviderOnly><ProviderProfilePreview /></ProviderOnly>} />
      <Route path="/provider-availability" element={<ProviderOnly><ProviderAvailability /></ProviderOnly>} />

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
