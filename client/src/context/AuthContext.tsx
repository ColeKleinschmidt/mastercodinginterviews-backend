import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthResponse, AuthUser, extractErrorMessage, fetchCurrentUser, getStoredToken, login, setAuthToken, signup } from '../api/auth';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setAuthToken(storedToken);
      setToken(storedToken);

      try {
        const profile = await fetchCurrentUser();
        setUser(profile);
      } catch (error) {
        console.error('Failed to fetch current user', extractErrorMessage(error));
        setAuthToken(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const handleAuthSuccess = (response: AuthResponse) => {
    setUser(response.user);
    setToken(response.token);
    setAuthToken(response.token);
    return response;
  };

  const performLogin = async (email: string, password: string) => {
    const response = await login({ email, password });
    return handleAuthSuccess(response);
  };

  const performSignup = async (name: string, email: string, password: string) => {
    const response = await signup({ name, email, password });
    return handleAuthSuccess(response);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login: performLogin,
      signup: performSignup,
      logout,
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
