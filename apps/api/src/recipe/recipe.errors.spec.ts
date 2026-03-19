import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { BaseRecipe } from '@cart/shared';
import {
  assertMutableRecipeResult,
  assertVisibleRecipe,
} from './recipe.errors';

describe('recipe.errors', () => {
  const recipe: BaseRecipe = {
    id: 'recipe-1',
    owner_user_id: 'user-1',
    is_system_recipe: false,
    name: 'Arroz con pollo casero',
    servings: 4,
    ingredients: [],
    steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('returns the recipe when it is visible', () => {
    expect(assertVisibleRecipe(recipe, recipe.id)).toBe(recipe);
  });

  it('throws when the recipe is not visible', () => {
    expect(() => assertVisibleRecipe(null, 'missing-recipe')).toThrow(
      NotFoundException,
    );
  });

  it('returns the mutable recipe result when present', () => {
    expect(
      assertMutableRecipeResult(recipe, recipe, recipe.id, 'edited'),
    ).toBe(recipe);
  });

  it('throws forbidden when trying to mutate a visible system recipe', () => {
    expect(() =>
      assertMutableRecipeResult(
        null,
        { ...recipe, is_system_recipe: true },
        recipe.id,
        'edited',
      ),
    ).toThrow(ForbiddenException);
  });

  it('throws not found when mutable recipe is missing and not visible', () => {
    expect(() =>
      assertMutableRecipeResult(null, null, 'missing-recipe', 'deleted'),
    ).toThrow(NotFoundException);
  });
});
