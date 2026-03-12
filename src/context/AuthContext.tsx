// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { User, LoginCredentials, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar
    const currentUser = authApi.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<any> => {
    const response = await authApi.login(credentials);
    setUser(response.user);
    return response;
  };

  const register = async (userData: RegisterData): Promise<any> => {
    const response = await authApi.register(userData);
    setUser(response.user);
    return response;
  };

  const logout = (): void => {
    authApi.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: authApi.isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};