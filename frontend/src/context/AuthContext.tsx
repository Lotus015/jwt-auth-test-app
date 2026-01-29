import { createContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { authApi, User, LoginRequest } from '../services/api';

// Auth state interface
export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// Auth actions interface
export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
}

// Combined context value
export interface AuthContextValue extends AuthState, AuthActions {}

// Create context with undefined default
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Derived state
  const isAuthenticated = useMemo(() => !!accessToken, [accessToken]);

  // Login action
  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    setAccessToken(response.accessToken);

    // Fetch user info after login
    const meResponse = await authApi.me(response.accessToken);
    setUser(meResponse.user);
  }, []);

  // Logout action
  const logout = useCallback(async () => {
    await authApi.logout();
    setAccessToken(null);
    setUser(null);
  }, []);

  // Refresh action
  const refresh = useCallback(async () => {
    const response = await authApi.refresh();
    setAccessToken(response.accessToken);

    // Fetch updated user info
    const meResponse = await authApi.me(response.accessToken);
    setUser(meResponse.user);
  }, []);

  // Context value
  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      user,
      isAuthenticated,
      login,
      logout,
      refresh,
      setAccessToken,
    }),
    [accessToken, user, isAuthenticated, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
