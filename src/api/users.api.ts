import api from './api';
import type { User, ApiError } from '../types';
import { AxiosError } from 'axios';

export const usersApi = {
  updateProfile: async (data: any): Promise<{ message: string; user: User }> => {
    try {
      const response = await api.put<{ message: string; user: User }>('/users/profile', data);
      
      // Actualizar localStorage sincronizando localmente el contexto global indirectamente si es necesario
      const localString = localStorage.getItem('user');
      if(localString) {
          const localUser = JSON.parse(localString);
          localStorage.setItem('user', JSON.stringify({ ...localUser, ...response.data.user }));
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al actualizar el perfil' };
    }
  },

  changePassword: async (data: any): Promise<{ message: string }> => {
    try {
      const response = await api.put<{ message: string }>('/users/change-password', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw axiosError.response?.data || { message: 'Error al cambiar la contraseña' };
    }
  }
};
