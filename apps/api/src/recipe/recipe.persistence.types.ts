import type {
  BaseRecipe as PrismaBaseRecipe,
  DishIngredient as PrismaDishIngredient,
  RecipeTag as PrismaRecipeTag,
  RecipeStep as PrismaRecipeStep,
  Tag as PrismaTag,
} from '../../generated/prisma/index.js';

export type BaseRecipeWithRelations = PrismaBaseRecipe & {
  ingredients: PrismaDishIngredient[];
  recipeTags: Array<
    PrismaRecipeTag & {
      tag: PrismaTag;
    }
  >;
  steps: PrismaRecipeStep[];
};
