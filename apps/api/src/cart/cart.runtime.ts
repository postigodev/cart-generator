import { BadRequestException } from '@nestjs/common';
import type {
  BaseRecipe,
  Dish,
  GenerateCartResponse,
} from '@cart/shared';
import type { GenerateCartDto } from './dto/generate-cart.dto';

export const getBaseSelections = (input: GenerateCartDto) => {
  const baseSelections = input.selections.filter(
    (selection) => selection.recipe_type === 'base',
  );

  if (baseSelections.length !== input.selections.length) {
    throw new BadRequestException(
      'Variant recipes are not supported yet in cart generation',
    );
  }

  return baseSelections;
};

export const buildDishesFromSelections = (
  recipes: BaseRecipe[],
  input: GenerateCartDto,
): Dish[] => {
  const baseSelections = getBaseSelections(input);
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const dishes: Dish[] = [];

  for (const selection of baseSelections) {
    const recipe = recipesById.get(selection.recipe_id);

    if (!recipe) {
      throw new BadRequestException(
        `Recipe ${selection.recipe_id} is not available to this user`,
      );
    }

    const scaledServings = selection.servings_override ?? recipe.servings;

    for (let index = 0; index < selection.quantity; index += 1) {
      dishes.push(toDish(recipe, scaledServings));
    }
  }

  return dishes;
};

export const buildGeneratedCartResponse = (input: {
  cartDraftId: string;
  dishes: Dish[];
  overview: GenerateCartResponse['overview'];
  matchedItems: GenerateCartResponse['matched_items'];
  estimatedSubtotal: number;
  retailer: GenerateCartResponse['retailer'];
}): GenerateCartResponse => ({
  cart_draft_id: input.cartDraftId,
  dishes: input.dishes,
  overview: input.overview,
  matched_items: input.matchedItems,
  estimated_subtotal: input.estimatedSubtotal,
  retailer: input.retailer,
});

const toDish = (recipe: BaseRecipe, servings: number): Dish => {
  const scaleFactor = servings / recipe.servings;

  return {
    id: recipe.id,
    name: recipe.name,
    cuisine: recipe.cuisine,
    servings,
    tags: recipe.tags,
    steps: recipe.steps,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      amount: ingredient.amount * scaleFactor,
    })),
  };
};
