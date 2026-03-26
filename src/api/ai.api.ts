// src/api/ai.api.ts
import axios from './api';

export interface GenerateRecipesRequest {
  prompt?: string;
  count?: number;
}

export const generateRecipes = async (data: GenerateRecipesRequest) => {
  const response = await axios.post('/ai/generate-recipes', data);
  return response.data; // { message, recipes: [...] }
};

export const saveGeneratedRecipe = async (recipe: any) => {
  const response = await axios.post('/ai/save-recipe', { recipe });
  return response.data; // { message, recipe }
};

export const chatWithAssistant = async (message: string, history: any[]) => {
  const response = await axios.post('/ai/chat', { message, history });
  return response.data; // { response: "..." }
};
