// services/api.ts
// Re-exports the centralized axios instance that has the in-memory access token
// and the silent refresh interceptor. All services must import from here.
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // cambia el puerto si es otro
});

export default api;