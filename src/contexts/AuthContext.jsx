import { createContext, useContext, useCallback, useMemo } from 'react';
import useAuthStore from '../store/useAuthStore';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, token, setAuth, logout, isAuthenticated } = useAuthStore();

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    setAuth(data.data.user, data.data.token);
    return data.data;
  }, [setAuth]);

  const register = useCallback(async (userData) => {
    const { data } = await authService.register(userData);
    setAuth(data.data.user, data.data.token);
    return data.data;
  }, [setAuth]);

  const signOut = useCallback(() => {
    logout();
  }, [logout]);

  const updateUser = useCallback((updatedUser) => {
    setAuth(updatedUser, token);
  }, [setAuth, token]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: isAuthenticated(),
    login,
    register,
    signOut,
    updateUser,
  }), [user, token, isAuthenticated, login, register, signOut, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  return ctx;
}
