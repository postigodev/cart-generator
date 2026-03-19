import { BadRequestException, Injectable } from '@nestjs/common';
import type { BaseRecipe, Dish, GenerateCartResponse } from '@cart/shared';
import { AggregationService } from '../aggregation/aggregation.service';
import { MatchingService } from '../matching/matching.service';
import { RecipeService } from '../recipe/recipe.service';
import { GenerateCartDto } from './dto/generate-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly aggregationService: AggregationService,
    private readonly matchingService: MatchingService,
  ) {}

  async generate(
    input: GenerateCartDto,
    actorUserId?: string,
  ): Promise<GenerateCartResponse> {
    const baseSelections = input.selections.filter(
      (selection) => selection.recipe_type === 'base',
    );

    if (baseSelections.length !== input.selections.length) {
      throw new BadRequestException(
        'Variant recipes are not supported yet in cart generation',
      );
    }

    const recipeIds = baseSelections.map((selection) => selection.recipe_id);
    const recipes = await this.recipeService.findManyByIds(recipeIds, actorUserId);
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
        dishes.push(this.toDish(recipe, scaledServings));
      }
    }

    const computation = this.aggregationService.compute(dishes);
    const matchedItems = this.matchingService.matchIngredients(computation.overview);
    const estimatedSubtotal =
      this.matchingService.estimateSubtotal(matchedItems);

    return {
      dishes: computation.dishes,
      overview: computation.overview,
      matched_items: matchedItems,
      estimated_subtotal: estimatedSubtotal,
      retailer: input.retailer,
    };
  }

  private toDish(recipe: BaseRecipe, servings: number): Dish {
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
  }
}
