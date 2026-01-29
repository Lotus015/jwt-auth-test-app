import { useContext } from 'react';
import { AuthContext, AuthContextValue } from '../context/AuthContext';

/**
 * Custom hook to access auth context values
 * @returns Auth context with state and actions
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
