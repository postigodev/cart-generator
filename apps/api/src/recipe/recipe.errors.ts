import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { BaseRecipe } from '@cart/shared';

export const assertVisibleRecipe = (
  recipe: BaseRecipe | null,
  id: string,
): BaseRecipe => {
  if (!recipe) {
    throw new NotFoundException(`Recipe ${id} not found`);
  }

  return recipe;
};

export const assertMutableRecipeResult = (
  recipe: BaseRecipe | null,
  visibleRecipe: BaseRecipe | null,
  id: string,
  action: 'edited' | 'deleted',
): BaseRecipe | null => {
  if (recipe) {
    return recipe;
  }

  if (visibleRecipe?.is_system_recipe) {
    throw new ForbiddenException(`System recipes cannot be ${action}`);
  }

  throw new NotFoundException(`Recipe ${id} not found`);
};
