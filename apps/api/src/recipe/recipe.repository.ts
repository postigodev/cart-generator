import { Injectable } from '@nestjs/common';
import type { BaseRecipe } from '@cart/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { mapBaseRecipe } from './recipe.mapper';
import {
  buildCreateRecipeData,
  buildOwnedMutableRecipeWhere,
  buildUpdateRecipeData,
  buildVisibleRecipeWhere,
} from './recipe.persistence.mapper';
import { UserContextService } from '../user/user-context.service';

@Injectable()
export class RecipeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userContextService: UserContextService,
  ) {}

  private resolveActorUser(actorUserId?: string): Promise<{ id: string }> {
    return this.userContextService.resolveActorUser(actorUserId);
  }

  async create(input: CreateRecipeDto, actorUserId?: string): Promise<BaseRecipe> {
    const actor = await this.resolveActorUser(actorUserId);

    const recipe = await this.prisma.baseRecipe.create({
      data: buildCreateRecipeData(input, actor.id),
      include: {
        ingredients: true,
        steps: true,
      },
    });

    return mapBaseRecipe(recipe);
  }

  async findMany(actorUserId?: string): Promise<BaseRecipe[]> {
    const actor = await this.resolveActorUser(actorUserId);

    const recipes = await this.prisma.baseRecipe.findMany({
      where: {
        ...buildVisibleRecipeWhere(actor.id),
      },
      include: {
        ingredients: true,
        steps: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recipes.map(mapBaseRecipe);
  }

  async findById(id: string, actorUserId?: string): Promise<BaseRecipe | null> {
    const actor = await this.resolveActorUser(actorUserId);

    const recipe = await this.prisma.baseRecipe.findFirst({
      where: {
        id,
        ...buildVisibleRecipeWhere(actor.id),
      },
      include: {
        ingredients: true,
        steps: true,
      },
    });

    return recipe ? mapBaseRecipe(recipe) : null;
  }

  async findManyByIds(
    ids: string[],
    actorUserId?: string,
  ): Promise<BaseRecipe[]> {
    const actor = await this.resolveActorUser(actorUserId);

    const recipes = await this.prisma.baseRecipe.findMany({
      where: {
        id: { in: ids },
        ...buildVisibleRecipeWhere(actor.id),
      },
      include: {
        ingredients: true,
        steps: true,
      },
    });

    return recipes.map(mapBaseRecipe);
  }

  async update(
    id: string,
    input: UpdateRecipeDto,
    actorUserId?: string,
  ): Promise<BaseRecipe | null> {
    const actor = await this.resolveActorUser(actorUserId);
    const existing = await this.prisma.baseRecipe.findFirst({
      where: buildOwnedMutableRecipeWhere(id, actor.id),
      include: {
        ingredients: true,
        steps: true,
      },
    });

    if (!existing) {
      return null;
    }

    const recipe = await this.prisma.baseRecipe.update({
      where: { id },
      data: buildUpdateRecipeData(input),
      include: {
        ingredients: true,
        steps: true,
      },
    });

    return mapBaseRecipe(recipe);
  }

  async delete(id: string, actorUserId?: string): Promise<boolean> {
    const actor = await this.resolveActorUser(actorUserId);
    const existing = await this.prisma.baseRecipe.findFirst({
      where: buildOwnedMutableRecipeWhere(id, actor.id),
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await this.prisma.baseRecipe.delete({
      where: { id },
    });

    return true;
  }
}
