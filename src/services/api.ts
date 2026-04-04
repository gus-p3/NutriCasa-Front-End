// src/services/api.ts
// ✅ UNIFICADO: Ahora re-exporta la instancia centralizada que maneja el token en memoria
// y el refresco automático de sesión (silent refresh).
import api from '../api/api';

export default api;