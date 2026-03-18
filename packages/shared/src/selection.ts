export type AppliedRecipeConstraints = {
  halal?: boolean;
  vegan?: boolean;
  calorie_range?: {
    min?: number;
    max?: number;
  };
  cheaper?: boolean;
};

export type SelectedRecipe = {
  recipe_id: string;
  recipe_type: "base" | "variant";
  quantity: number;
  servings_override?: number;
  applied_constraints?: AppliedRecipeConstraints;
};

export type CartDraft = {
  id: string;
  user_id?: string;
  name?: string;
  selected_recipes: SelectedRecipe[];
  created_at: string;
  updated_at: string;
};
