import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BaseRecipe } from '@cart/shared';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeRepository } from './recipe.repository';

@Injectable()
export class RecipeService {
  constructor(private readonly recipeRepository: RecipeRepository) {}

  create(input: CreateRecipeDto, actorUserId?: string): Promise<BaseRecipe> {
    return this.recipeRepository.create(input, actorUserId);
  }

  findAll(actorUserId?: string): Promise<BaseRecipe[]> {
    return this.recipeRepository.findMany(actorUserId);
  }

  findManyByIds(ids: string[], actorUserId?: string): Promise<BaseRecipe[]> {
    return this.recipeRepository.findManyByIds(ids, actorUserId);
  }

  async findOne(id: string, actorUserId?: string): Promise<BaseRecipe> {
    const recipe = await this.recipeRepository.findById(id, actorUserId);

    if (!recipe) {
      throw new NotFoundException(`Recipe ${id} not found`);
    }

    return recipe;
  }

  async update(
    id: string,
    input: UpdateRecipeDto,
    actorUserId?: string,
  ): Promise<BaseRecipe> {
    const recipe = await this.recipeRepository.update(id, input, actorUserId);

    if (!recipe) {
      const visibleRecipe = await this.recipeRepository.findById(id, actorUserId);

      if (visibleRecipe?.is_system_recipe) {
        throw new ForbiddenException('System recipes cannot be edited');
      }

      throw new NotFoundException(`Recipe ${id} not found`);
    }

    return recipe;
  }

  async remove(id: string, actorUserId?: string): Promise<void> {
    const deleted = await this.recipeRepository.delete(id, actorUserId);

    if (!deleted) {
      const visibleRecipe = await this.recipeRepository.findById(id, actorUserId);

      if (visibleRecipe?.is_system_recipe) {
        throw new ForbiddenException('System recipes cannot be deleted');
      }

      throw new NotFoundException(`Recipe ${id} not found`);
    }
  }
}
