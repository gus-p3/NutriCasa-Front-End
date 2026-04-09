// src/api/auth.api.ts
import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse, User, ApiError } from '../types';
import { setAccessToken } from './api';
import api from './api';


const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/auth`
  : 'http://localhost:3000/api/auth';

// Separate axios instance for auth (no interceptors to avoid loops)
const authAxios: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,            // send/receive the httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

export const authApi = {

  // ── Register ────────────────────────────────────────────────────────────────
  register: async (userData: RegisterData): Promise<{ message: string; email: string }> => {
    try {
      const response = await authAxios.post<{ message: string; email: string }>('/register', userData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error en el registro' };
    }
  },

  // ── Login ────────────────────────────────────────────────────────────────────
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authAxios.post<AuthResponse>('/login', credentials);
      const { token, user, require2FA } = response.data;
      
      // Solo guardar si no requiere 2FA adicional
      if (!require2FA) {
        setAccessToken(token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error en el login' };
    }
  },

  // ── Silent refresh (called on app mount) ────────────────────────────────────
  // Uses the httpOnly refresh cookie to get a fresh access token.
  // Returns the user object if successful, null if not authenticated.
  silentRefresh: async (): Promise<AuthResponse | null> => {
    try {
      const response = await authAxios.post<AuthResponse>('/refresh');
      const { token, user } = response.data;
      setAccessToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch {
      setAccessToken(null);
      localStorage.removeItem('user');
      return null;
    }
  },

  // ── Get profile ──────────────────────────────────────────────────────────────
  getProfile: async (): Promise<{ user: User }> => {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al obtener perfil' };
    }
  },

  // ── Update profile ───────────────────────────────────────────────────────────
  updateProfile: async (profileData: Partial<User>): Promise<{ message: string; user: User }> => {
    try {
      const response = await api.put<{ message: string; user: User }>('/auth/me', profileData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al actualizar perfil' };
    }
  },

  // ── Setup nutritional profile ────────────────────────────────────────────────
  setupProfile: async (setupData: any): Promise<any> => {
    try {
      const response = await api.put('/auth/me/profile', setupData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error en setup de perfil' };
    }
  },

  // ── Logout ───────────────────────────────────────────────────────────────────
  // Clears the httpOnly cookie server-side + clears client state.
  logout: async (): Promise<void> => {
    try {
      await authAxios.post('/logout');
    } catch {
      /* proceed with client-side cleanup even if server fails */
    } finally {
      setAccessToken(null);
      localStorage.removeItem('user');
    }
  },

  // ── Verification & Recovery ──────────────────────────────────────────────────
  verifyEmail: async (email: string, code: string): Promise<AuthResponse> => {
    try {
      const response = await authAxios.post<AuthResponse>('/verify', { email, code });
      const { token, user } = response.data;
      setAccessToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al verificar email' };
    }
  },

  resendCode: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await authAxios.post<{ message: string }>('/resend-code', { email });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al reenviar código' };
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await authAxios.post<{ message: string }>('/forgot-password', { email });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al solicitar recuperación' };
    }
  },

  resetPassword: async (resetData: { email: string; code: string; newPassword: string }): Promise<{ message: string }> => {
    try {
      const response = await authAxios.post<{ message: string }>('/reset-password', resetData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al restablecer contraseña' };
    }
  },

  // ── 2FA ──────────────────────────────────────────────────────────────────────
  verify2FA: async (email: string, code: string): Promise<AuthResponse> => {
    try {
      const response = await authAxios.post<AuthResponse>('/verify-2fa', { email, code });
      const { token, user } = response.data;
      setAccessToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error en la verificación 2FA' };
    }
  },

  toggle2FA: async (enabled: boolean): Promise<{ message: string; twoFactorEnabled: boolean }> => {
    try {
      const response = await api.put<{ message: string; twoFactorEnabled: boolean }>('/auth/me/2fa', { enabled });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al cambiar 2FA' };
    }
  },

  // ── Helpers ──────────────────────────────────────────────────────────────────
  isAuthenticated: (): boolean => !!localStorage.getItem('user'),

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};