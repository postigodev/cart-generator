import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { GenerateCartResponse } from '@cart/shared';
import { AggregationService } from '../aggregation/aggregation.service';
import { MatchingService } from '../matching/matching.service';
import { RecipeService } from '../recipe/recipe.service';
import { UserContextService } from '../user/user-context.service';
import { CartPersistenceService } from './cart.persistence';
import {
  buildDishesFromSelections,
  buildGeneratedCartResponse,
  getBaseSelections,
} from './cart.runtime';
import { CreateCartDraftDto } from './dto/create-cart-draft.dto';
import { GenerateCartDto } from './dto/generate-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly aggregationService: AggregationService,
    private readonly matchingService: MatchingService,
    private readonly cartPersistenceService: CartPersistenceService,
    private readonly userContextService: UserContextService,
  ) {}

  async generate(
    input: GenerateCartDto,
    actorUserId?: string,
  ): Promise<GenerateCartResponse> {
    const actor = await this.userContextService.resolveActorUser(actorUserId);
    const baseSelections = getBaseSelections(input);
    const recipeIds = baseSelections.map((selection) => selection.recipe_id);
    const recipes = await this.recipeService.findManyByIds(recipeIds, actorUserId);
    const dishes = buildDishesFromSelections(recipes, input);

    const computation = this.aggregationService.compute(dishes);
    const matchedItems = this.matchingService.matchIngredients(computation.overview);
    const estimatedSubtotal =
      this.matchingService.estimateSubtotal(matchedItems);
    const draft = await this.cartPersistenceService.createDraft({
      userId: actor.id,
      selections: input.selections,
      retailer: input.retailer,
    });

    const response = buildGeneratedCartResponse({
      cartDraftId: draft.id,
      dishes: computation.dishes,
      overview: computation.overview,
      matchedItems,
      estimatedSubtotal,
      retailer: input.retailer,
    });

    await this.cartPersistenceService.createGeneratedCart({
      userId: actor.id,
      cartDraftId: draft.id,
      cart: response,
    });

    return response;
  }

  async createDraft(input: CreateCartDraftDto, actorUserId?: string) {
    const actor = await this.userContextService.resolveActorUser(actorUserId);

    return this.cartPersistenceService.createDraft({
      userId: actor.id,
      name: input.name,
      selections: input.selections,
      retailer: input.retailer,
    });
  }

  async listDrafts(actorUserId?: string) {
    const actor = await this.userContextService.resolveActorUser(actorUserId);
    return this.cartPersistenceService.findDraftsByUser(actor.id);
  }

  async findDraft(id: string, actorUserId?: string) {
    const actor = await this.userContextService.resolveActorUser(actorUserId);
    const draft = await this.cartPersistenceService.findDraftById(actor.id, id);

    if (!draft) {
      throw new NotFoundException(`Cart draft ${id} not found`);
    }

    return draft;
  }

  async listGenerated(actorUserId?: string) {
    const actor = await this.userContextService.resolveActorUser(actorUserId);
    return this.cartPersistenceService.findGeneratedCartsByUser(actor.id);
  }

  async listGeneratedHistory(actorUserId?: string) {
    const actor = await this.userContextService.resolveActorUser(actorUserId);
    return this.cartPersistenceService.findGeneratedCartHistoryByUser(actor.id);
  }

  async findGenerated(id: string, actorUserId?: string) {
    const actor = await this.userContextService.resolveActorUser(actorUserId);
    const cart = await this.cartPersistenceService.findGeneratedCartById(
      actor.id,
      id,
    );

    if (!cart) {
      throw new NotFoundException(`Generated cart ${id} not found`);
    }

    return cart;
  }
}
