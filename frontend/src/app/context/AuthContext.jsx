import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { auth, onUnauthorized } from '../../lib/api/index.js';

const AuthContext = createContext(null);

/**
 * Holds the signed-in visitor. The cookie is the real source of truth — this
 * only mirrors it for the UI, and drops the mirror the moment the API reports
 * the session has gone.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    auth
      .me({ signal: controller.signal })
      .then((current) => {
        if (active) setUser(current);
      })
      .catch(() => {
        // 401 simply means nobody is signed in on this browser.
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  // An expired session anywhere in the app clears the local user immediately.
  useEffect(() => onUnauthorized(() => setUser(null)), []);

  const login = useCallback(async (credentials) => {
    const signedIn = await auth.login(credentials);
    setUser(signedIn);
    return signedIn;
  }, []);

  const register = useCallback(async (details) => {
    const created = await auth.register(details);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      setUser,
    }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
