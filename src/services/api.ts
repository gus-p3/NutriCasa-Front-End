// services/api.ts
// Re-exports the centralized axios instance that has the in-memory access token
// and the silent refresh interceptor. All services must import from here.
import api from '../api/api';
export default api;
