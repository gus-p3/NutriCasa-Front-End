// src/api/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// ─── Token de acceso en memoria ─────────────────────────────────────────────────
// El token vive en memoria (no en localStorage) para prevenir acceso por XSS.
// Se popula después de login/register/refresh y se comparte entre todas las peticiones.

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };
export const getAccessToken = (): string | null => accessToken;

// ─── Instancia de Axios ─────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,   // envía la cookie httpOnly de refresh en cada petición
  headers: { 'Content-Type': 'application/json' },
});

// ─── Interceptor de petición: adjuntar token de acceso ─────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Interceptor de respuesta: refresco silencioso ─────────────────────────────
// Si el servidor responde con 401 (token expirado), intenta un refresco silencioso
// usando la cookie httpOnly de refresh. Si el refresco funciona, reintenta la petición original.
// Si el refresco también falla, limpia el estado y redirige al login.

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processPendingQueue = (err: unknown, token: string | null) => {
  pendingQueue.forEach(p => (err ? p.reject(err) : p.resolve(token!)));
  pendingQueue = [];
};

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Solo intercepta errores 401 que no se hayan reintentado ya
    // También evita el endpoint de refresh para prevenir bucles infinitos
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/refresh') &&
      !original.url?.includes('/login') &&
      !original.url?.includes('/register')
    ) {
      if (isRefreshing) {
        // Encola esta petición hasta que termine el refresco en curso
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<{ token: string }>('/auth/refresh');
        const newToken = data.token;
        setAccessToken(newToken);
        processPendingQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processPendingQueue(refreshError, null);
        setAccessToken(null);
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;