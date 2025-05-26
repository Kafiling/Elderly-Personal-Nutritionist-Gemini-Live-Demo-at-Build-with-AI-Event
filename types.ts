export interface UserPreferences {
  healthConditions: string[];
  allergies: string[];
  nutritionalFocus: string[];
  likedFoods: string[];
  dislikedFoods: string[];
}

export interface Meal {
  name: string;
  description: string;
  mainIngredients: string[];
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  mealName: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTime: string;
  cookTime: string; // Corrected from "string" to string
  nutritionalInfo: {
    calories?: string;
    protein?: string;
    fiber?: string;
    calcium?: string;
    vitaminD?: string;
    sodium?: string;
    [key: string]: string | undefined; // For other dynamic nutrients
  };
  servingSuggestion?: string;
  imageUrl?: string; // Added to store generated image URL
}

export type AppView = 'upload' | 'preferences' | 'meals' | 'recipe' | 'error';