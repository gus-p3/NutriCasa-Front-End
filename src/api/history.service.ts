import api from './api';

export interface PopulatedRecipe {
  _id: string;
  title?: string;
  imageUrl?: string;
  category?: string;
}

export interface IngredientUsed {
  _id?: string;
  name: string;
  quantityUsed: number;
  unit: string;
  leftover: number;
}

export interface HistoryEntry {
  _id: string;
  recipeId: string | PopulatedRecipe;
  recipeName: string;
  cookedAt: string;
  rating: number;
  caloriesConsumed: number;
  estimatedCost: number;
  mealTime: string;
  ingredientsUsed: IngredientUsed[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Obtener el historial completo del usuario
 */
export const getUserHistory = async (): Promise<HistoryEntry[]> => {
  const response = await api.get<ApiResponse<HistoryEntry[]>>('/history');
  return response.data.data;
};

/**
 * Obtener una entrada de historial específica por ID
 */
export const getUserHistoryById = async (id: string | number): Promise<HistoryEntry> => {
  const response = await api.get<ApiResponse<HistoryEntry>>(`/history/${id}`);
  return response.data.data;
};

/**
 * Formatear fecha para el historial (formato es-MX con hora)
 */
export const formatHistoryDate = (dateString: string): string => {
  // Manejo defensivo en caso de fecha inválida
  if (!dateString) return 'Fecha desconocida';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

/**
 * Contar cuántos ingredientes usados tienen sobrante
 */
export const countLeftoverIngredients = (ingredients: IngredientUsed[]): number => {
  if (!ingredients || ingredients.length === 0) return 0;
  return ingredients.filter(i => i.leftover > 0).length;
};
