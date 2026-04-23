import { Navigate } from 'react-router-dom';
import useUserRole from '../hooks/useUserRole';

// Renders a different subtree per role on the same path. Paired with
// the role firewall: while role is loading nothing renders, and a
// signed-out user is sent to /login. Unknown role → onboarding.
export default function RoleSwitch({ office, provider, fallback = null }) {
  const { role, isLoading, isSignedIn } = useUserRole();

  if (isLoading) return null;
  if (!isSignedIn) return <Navigate to="/login" replace />;

  if (role === 'office') return office ?? fallback;
  if (role === 'provider') return provider ?? fallback;

  return <Navigate to="/onboarding" replace />;
}
