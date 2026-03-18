import API from "./api";

// Configuración inicial del perfil
export const setupProfile = async (data: any) => {
  await API.put("/auth/me/profile", data);

  // después de guardar, obtener el perfil actualizado
  const response = await API.get("/auth/me");
  return response.data;
};

// Obtener perfil del usuario
export const getProfile = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

// Actualizar perfil existente
export const updateProfile = async (data: any) => {
  const response = await API.put("/auth/me", data);
  return response.data;
};
