import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

// ============================================================
// useUserRole — Single source of truth for "is this user an
// office or a provider?" Role is stored in the backend DB
// (User.role + User.office / User.provider), not in Clerk
// metadata. This hook fetches /api/users/me once per signed-in
// session and exposes the result to the whole app.
//
// Never branch on role from anywhere else. Never store role in
// local component state. Always read from here.
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const UserRoleContext = createContext({
  role: null,
  isOffice: false,
  isProvider: false,
  isLoading: true,
  isSignedIn: false,
  refresh: async () => {},
});

export function UserRoleProvider({ children }) {
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [role, setRole] = useState(null); // 'office' | 'provider' | null
  const [isLoading, setIsLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!authLoaded) return;
    setIsLoading(true);
    if (!isSignedIn) {
      setRole(null);
      setIsLoading(false);
      return;
    }
    try {
      const token = await getToken();
      if (!token) {
        setRole(null);
        setIsLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // User not yet onboarded (404) — role unknown, not an error
        setRole(null);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      if (data.office) {
        setRole('office');
      } else if (data.provider) {
        setRole('provider');
      } else {
        setRole(null);
      }
      setIsLoading(false);
    } catch {
      setRole(null);
      setIsLoading(false);
    }
  }, [authLoaded, isSignedIn, getToken]);

  // Re-fetch whenever the signed-in user identity changes.
  useEffect(() => {
    fetchRole();
  }, [user?.id, fetchRole]);

  const value = {
    role,
    isOffice: role === 'office',
    isProvider: role === 'provider',
    isLoading,
    isSignedIn: !!isSignedIn,
    refresh: fetchRole,
  };

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export default function useUserRole() {
  return useContext(UserRoleContext);
}
