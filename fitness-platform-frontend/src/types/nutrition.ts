export interface Food {
  id: number;
  fdcId: number | null;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: string;
}

export interface FoodSearchResponse {
  foods: Food[];
  totalResults: number;
  query: string;
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealFood {
  id: number;
  foodId: number;
  food: Food;
  servings: number;
}

export interface Meal {
  id: number;
  userId: number;
  mealPlanId: number | null;
  mealType: MealType;
  name: string;
  date: string;
  notes: string | null;
  createdAt: string;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface CreateMealRequest {
  mealType: MealType;
  name?: string;
  date: string;
  notes?: string;
  foods: {
    foodId: number;
    servings: number;
  }[];
}

export interface DailyMacrosResponse {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Meal[];
  mealCount: number;
}

export interface MealPlan {
  id: number;
  userId: number;
  name: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  dietaryPrefs: string;
  generatedPlan: string;
  createdAt: string;
}

export interface GenerateMealPlanRequest {
  name: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  dietaryPrefs: string[];
}

