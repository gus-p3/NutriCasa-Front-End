// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  profile: {
    age?: number | null;
    weight?: number | null;
    height?: number | null;
    activityLevel: 'low' | 'medium' | 'high';
    goal: 'lose' | 'maintain' | 'gain';
    dietType: 'normal' | 'vegetarian' | 'vegan' | 'custom';
    allergies: string[];
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  weeklyBudget: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}