import api from './api';

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: 'desayuno' | 'comida' | 'cena' | 'snack';
  dietTypes: Array<'normal' | 'vegetarian' | 'vegan'>;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    alternatives?: string[];
  }>;
  steps: Array<{
    stepNumber: number;
    description: string;
    timerSeconds?: number;
    detailedNote?: string;
  }>;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  prepTimeMinutes: number;
  estimatedCost: number;
  difficulty?: 'fácil' | 'media' | 'difícil';
}

// Obtener recetas del usuario
export const getUserRecipes = async (): Promise<Recipe[]> => {
  const response = await api.get('/recipes/user');
  return response.data.data;
};

// Crear receta
export const createRecipe = async (recipeData: Omit<Recipe, '_id'>): Promise<Recipe> => {
  const response = await api.post('/recipes', recipeData);
  return response.data.data;
};

// Actualizar receta
export const updateRecipe = async (id: string, recipeData: Partial<Recipe>): Promise<Recipe> => {
  const response = await api.put(`/recipes/${id}`, recipeData);
  return response.data.data;
};

// Eliminar receta
export const deleteRecipe = async (id: string): Promise<void> => {
  await api.delete(`/recipes/${id}`);
};