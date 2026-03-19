import { Injectable } from '@nestjs/common';
import type { BaseRecipe } from '@cart/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { mapBaseRecipe } from './recipe.mapper';
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
      data: {
        ownerUserId: actor.id,
        isSystemRecipe: false,
        name: input.name,
        cuisine: input.cuisine,
        description: input.description,
        servings: input.servings,
        tags: input.tags ?? [],
        ingredients: {
          create: input.ingredients.map((ingredient, index) => ({
            canonicalIngredient: ingredient.canonical_ingredient,
            amount: ingredient.amount,
            unit: ingredient.unit,
            displayIngredient: ingredient.display_ingredient,
            preparation: ingredient.preparation,
            optional: ingredient.optional ?? false,
            ingredientGroup: ingredient.group,
            sortOrder: index,
          })),
        },
        steps: {
          create: input.steps.map((step) => ({
            stepNumber: step.step,
            whatToDo: step.what_to_do,
          })),
        },
      },
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
        OR: [{ isSystemRecipe: true }, { ownerUserId: actor.id }],
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
        OR: [{ isSystemRecipe: true }, { ownerUserId: actor.id }],
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
        OR: [{ isSystemRecipe: true }, { ownerUserId: actor.id }],
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
      where: {
        id,
        ownerUserId: actor.id,
        isSystemRecipe: false,
      },
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
      data: {
        name: input.name,
        cuisine: input.cuisine,
        description: input.description,
        servings: input.servings,
        tags: input.tags,
        ...(input.ingredients
          ? {
              ingredients: {
                deleteMany: {},
                create: input.ingredients.map((ingredient, index) => ({
                  canonicalIngredient: ingredient.canonical_ingredient,
                  amount: ingredient.amount,
                  unit: ingredient.unit,
                  displayIngredient: ingredient.display_ingredient,
                  preparation: ingredient.preparation,
                  optional: ingredient.optional ?? false,
                  ingredientGroup: ingredient.group,
                  sortOrder: index,
                })),
              },
            }
          : {}),
        ...(input.steps
          ? {
              steps: {
                deleteMany: {},
                create: input.steps.map((step) => ({
                  stepNumber: step.step,
                  whatToDo: step.what_to_do,
                })),
              },
            }
          : {}),
      },
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
      where: {
        id,
        ownerUserId: actor.id,
        isSystemRecipe: false,
      },
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
