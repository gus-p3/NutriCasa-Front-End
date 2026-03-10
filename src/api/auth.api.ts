// src/api/auth.api.ts
import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse, User, ApiError } from '../types';


const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth`
  : 'http://localhost:3000/api/auth';

console.log('🔧 API_URL final:', API_URL);

// ... resto del código
// Configuración base de axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authApi = {
  // Registro de usuario
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error en el registro' };
    }
  },

  // Login de usuario
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error en el login' };
    }
  },

  // Obtener perfil del usuario
  getProfile: async (): Promise<{ user: User }> => {
    try {
      const response = await api.get<{ user: User }>('/me');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al obtener perfil' };
    }
  },

  // Actualizar perfil
  updateProfile: async (profileData: Partial<User>): Promise<{ message: string; user: User }> => {
    try {
      const response = await api.put<{ message: string; user: User }>('/me', profileData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al actualizar perfil' };
    }
  },

  // Configurar perfil nutricional (setup)
  setupProfile: async (setupData: any): Promise<any> => {
    try {
      const response = await api.put('/me/profile', setupData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error en setup de perfil' };
    }
  },

  // Cerrar sesión
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario del localStorage
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};