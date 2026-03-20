// src/api/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// ─── In-memory access token ───────────────────────────────────────────────────
// The token lives in memory (not localStorage) to prevent XSS access.
// It is populated after login/register/refresh and shared across all requests.

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };
export const getAccessToken = (): string | null => accessToken;

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,   // sends the httpOnly refresh cookie on every request
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach access token ─────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response interceptor: silent refresh ─────────────────────────────────────
// If the server returns 401 (token expired), attempt one silent refresh using
// the httpOnly refresh cookie. If the refresh succeeds, retry the original request.
// If the refresh also fails, clear state and redirect to login.

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

    // Only intercept 401 errors that haven't already been retried
    // Also skip the refresh endpoint itself to avoid infinite loops
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/refresh') &&
      !original.url?.includes('/login') &&
      !original.url?.includes('/register')
    ) {
      if (isRefreshing) {
        // Queue this request until the in-flight refresh completes
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