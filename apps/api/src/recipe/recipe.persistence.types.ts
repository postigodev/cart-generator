import type {
  BaseRecipe as PrismaBaseRecipe,
  DishIngredient as PrismaDishIngredient,
  RecipeStep as PrismaRecipeStep,
} from '../../generated/prisma/index.js';

export type BaseRecipeWithRelations = PrismaBaseRecipe & {
  ingredients: PrismaDishIngredient[];
  steps: PrismaRecipeStep[];
};
