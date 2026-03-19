import type { CreateRecipeDto } from './dto/create-recipe.dto';
import type { UpdateRecipeDto } from './dto/update-recipe.dto';

const mapIngredientCreateInput = (
  ingredient: CreateRecipeDto['ingredients'][number],
  index: number,
) => ({
  canonicalIngredient: ingredient.canonical_ingredient,
  amount: ingredient.amount,
  unit: ingredient.unit,
  displayIngredient: ingredient.display_ingredient,
  preparation: ingredient.preparation,
  optional: ingredient.optional ?? false,
  ingredientGroup: ingredient.group,
  sortOrder: index,
});

const mapStepCreateInput = (step: CreateRecipeDto['steps'][number]) => ({
  stepNumber: step.step,
  whatToDo: step.what_to_do,
});

export const buildCreateRecipeData = (
  input: CreateRecipeDto,
  ownerUserId: string,
) => ({
  ownerUserId,
  isSystemRecipe: false,
  name: input.name,
  cuisine: input.cuisine,
  description: input.description,
  servings: input.servings,
  tags: input.tags ?? [],
  ingredients: {
    create: input.ingredients.map(mapIngredientCreateInput),
  },
  steps: {
    create: input.steps.map(mapStepCreateInput),
  },
});

export const buildUpdateRecipeData = (input: UpdateRecipeDto) => ({
  name: input.name,
  cuisine: input.cuisine,
  description: input.description,
  servings: input.servings,
  tags: input.tags,
  ...(input.ingredients
    ? {
        ingredients: {
          deleteMany: {},
          create: input.ingredients.map(mapIngredientCreateInput),
        },
      }
    : {}),
  ...(input.steps
    ? {
        steps: {
          deleteMany: {},
          create: input.steps.map(mapStepCreateInput),
        },
      }
    : {}),
});

export const buildVisibleRecipeWhere = (actorId: string) => ({
  OR: [{ isSystemRecipe: true }, { ownerUserId: actorId }],
});

export const buildOwnedMutableRecipeWhere = (id: string, actorId: string) => ({
  id,
  ownerUserId: actorId,
  isSystemRecipe: false,
});
