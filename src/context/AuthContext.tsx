// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, useRef, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { User, LoginCredentials, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  role: string | null;
  verifyEmail: (email: string, code: string) => Promise<any>;
  resendCode: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (resetData: { email: string; code: string; newPassword: string }) => Promise<any>;
  verify2FA: (email: string, code: string) => Promise<any>;
  toggle2FA: (enabled: boolean) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initialized = useRef(false);

  // ── On mount: try silent refresh using the httpOnly cookie ─────────────────
  // This restores the session after a page reload without showing a login screen.
  // Ref helps prevent strict-mode double invocation which ruins refresh token rotation.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const restoreSession = async () => {
      // Fast path: if we have a cached user in localStorage, hydrate state immediately
      const cached = authApi.getCurrentUser();
      if (cached) setUser(cached);

      // Then silently refresh to get a fresh access token and up-to-date user info
      const result = await authApi.silentRefresh();
      if (result) {
        setUser(result.user);
      } else {
        // Refresh cookie expired or invalid — user must log in
        setUser(null);
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    if (!response.require2FA) {
      setUser(response.user);
    }
    return response;
  };

  const verify2FA = async (email: string, code: string) => {
    const response = await authApi.verify2FA(email, code);
    setUser(response.user);
    return response;
  };

  const toggle2FA = async (enabled: boolean) => {
    const response = await authApi.toggle2FA(enabled);
    if (user) {
      const updatedUser = { ...user, twoFactorEnabled: response.twoFactorEnabled };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response;
  };

  const register = async (userData: RegisterData) => {
    const response = await authApi.register(userData);
    // No establecemos el usuario aquí porque debe verificarse primero
    return response;
  };

  const verifyEmail = async (email: string, code: string) => {
    const response = await authApi.verifyEmail(email, code);
    setUser(response.user);
    return response;
  };

  const resendCode = async (email: string) => {
    return await authApi.resendCode(email);
  };

  const forgotPassword = async (email: string) => {
    return await authApi.forgotPassword(email);
  };

  const resetPassword = async (resetData: any) => {
    return await authApi.resetPassword(resetData);
  };

  const logout = async () => {
    await authApi.logout();   // clears httpOnly cookie on server
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: () => !!user,
      isAdmin: () => user?.role === 'admin',
      role: user?.role ?? null,
      verifyEmail,
      resendCode,
      forgotPassword,
      resetPassword,
      verify2FA,
      toggle2FA,
    }}>
      {children}
    </AuthContext.Provider>
  );
};