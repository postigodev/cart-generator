import { BadRequestException } from '@nestjs/common';
import type { BaseRecipe } from '@cart/shared';
import { AggregationService } from '../aggregation/aggregation.service';
import { MatchingService } from '../matching/matching.service';
import { RecipeService } from '../recipe/recipe.service';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let recipeService: jest.Mocked<RecipeService>;

  const recipe: BaseRecipe = {
    id: 'recipe-1',
    owner_user_id: 'user-1',
    is_system_recipe: false,
    name: 'Arroz con pollo casero',
    cuisine: 'Peruvian',
    description: 'Test recipe',
    servings: 4,
    ingredients: [
      {
        canonical_ingredient: 'rice',
        amount: 2,
        unit: 'cup',
      },
      {
        canonical_ingredient: 'chicken thigh',
        amount: 800,
        unit: 'g',
      },
    ],
    steps: [],
    tags: ['test'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    recipeService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findManyByIds: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<RecipeService>;

    service = new CartService(
      recipeService,
      new AggregationService(),
      new MatchingService(),
    );
  });

  it('generates a cart with matched items and subtotal', async () => {
    recipeService.findManyByIds.mockResolvedValue([recipe]);

    const result = await service.generate({
      selections: [
        {
          recipe_id: 'recipe-1',
          recipe_type: 'base',
          quantity: 2,
        },
      ],
      retailer: 'walmart',
    });

    expect(result.dishes).toHaveLength(2);
    expect(result.overview).toEqual([
      expect.objectContaining({
        canonical_ingredient: 'chicken thigh',
        total_amount: 1600,
        unit: 'g',
      }),
      expect.objectContaining({
        canonical_ingredient: 'rice',
        total_amount: 4,
        unit: 'cup',
      }),
    ]);
    expect(result.matched_items).toEqual([
      expect.objectContaining({
        canonical_ingredient: 'chicken thigh',
        selected_quantity: 2,
        estimated_line_total: 15.92,
      }),
      expect.objectContaining({
        canonical_ingredient: 'rice',
        selected_quantity: 1,
        estimated_line_total: 3.98,
      }),
    ]);
    expect(result.estimated_subtotal).toBe(19.9);
  });

  it('scales servings_override before aggregation', async () => {
    recipeService.findManyByIds.mockResolvedValue([recipe]);

    const result = await service.generate({
      selections: [
        {
          recipe_id: 'recipe-1',
          recipe_type: 'base',
          quantity: 1,
          servings_override: 2,
        },
      ],
      retailer: 'walmart',
    });

    expect(result.overview).toEqual([
      expect.objectContaining({
        canonical_ingredient: 'chicken thigh',
        total_amount: 400,
      }),
      expect.objectContaining({
        canonical_ingredient: 'rice',
        total_amount: 1,
      }),
    ]);
  });

  it('throws when a requested recipe is not visible', async () => {
    recipeService.findManyByIds.mockResolvedValue([]);

    await expect(
      service.generate({
        selections: [
          {
            recipe_id: 'missing-recipe',
            recipe_type: 'base',
            quantity: 1,
          },
        ],
        retailer: 'walmart',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
