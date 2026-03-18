import type { AggregatedIngredient } from "./aggregation";
import type { Dish } from "./recipe";
import type {
  MatchedIngredientProduct,
  Retailer,
} from "./product";

export type GenerateCartSelectionAdaptationRequest = {
  halal?: boolean;
  vegan?: boolean;
  calorie_range?: {
    min?: number;
    max?: number;
  };
  cheaper?: boolean;
  custom_notes?: string;
};

export type GenerateCartRequestSelection = {
  recipe_id: string;
  recipe_type: "base" | "variant";
  quantity: number;
  servings_override?: number;
  adaptation_request?: GenerateCartSelectionAdaptationRequest;
};

export type GenerateCartRequest = {
  selections: GenerateCartRequestSelection[];
  retailer: Retailer;
};

export type GenerateCartResponse = {
  cart_draft_id?: string;
  dishes: Dish[];
  overview: AggregatedIngredient[];
  matched_items: MatchedIngredientProduct[];
  estimated_subtotal: number;
  retailer: Retailer;
};

export type GeneratedCart = {
  id?: string;
  dishes: Dish[];
  overview: AggregatedIngredient[];
  matched_items: MatchedIngredientProduct[];
  estimated_subtotal: number;
  estimated_total?: number;
  retailer: Retailer;
  created_at?: string;
};
