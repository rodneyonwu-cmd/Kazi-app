import { Navigate } from 'react-router-dom';
import useUserRole from '../hooks/useUserRole';

// Role-based route firewall. Prevents cross-role screen leaks:
// an office user who somehow lands on a provider-guarded route is
// redirected to the office home, and vice versa. While role is still
// loading, renders nothing — never falls through to a default role.
export default function RoleGuard({ requireRole, children }) {
  const { role, isLoading, isSignedIn } = useUserRole();

  if (isLoading) return null;
  if (!isSignedIn) return <Navigate to="/login" replace />;

  if (role !== requireRole) {
    if (role === 'office') return <Navigate to="/dashboard" replace />;
    if (role === 'provider') return <Navigate to="/provider" replace />;
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
