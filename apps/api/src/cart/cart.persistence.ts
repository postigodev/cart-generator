import { Injectable } from '@nestjs/common';
import type {
  GenerateCartRequestSelection,
  GenerateCartResponse,
} from '@cart/shared';
import { PrismaService } from '../prisma/prisma.service';

type PersistedCartDraft = {
  id: string;
  user_id: string;
  name?: string;
  selections: GenerateCartRequestSelection[];
  retailer: string;
  created_at: string;
  updated_at: string;
};

type GeneratedCartHistorySummary = {
  id: string;
  user_id: string;
  cart_draft_id?: string;
  retailer: GenerateCartResponse['retailer'];
  estimated_subtotal: number;
  dish_count: number;
  overview_count: number;
  matched_item_count: number;
  created_at: string;
  updated_at: string;
};

type PersistedGeneratedCart = GenerateCartResponse & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class CartPersistenceService {
  constructor(private readonly prisma: PrismaService) {}

  async createDraft(input: {
    userId: string;
    name?: string;
    selections: GenerateCartRequestSelection[];
    retailer: string;
  }): Promise<PersistedCartDraft> {
    const draft = await this.prisma.cartDraft.create({
      data: {
        userId: input.userId,
        name: input.name,
        selections: input.selections,
        retailer: input.retailer,
      },
    });

    return {
      id: draft.id,
      user_id: draft.userId,
      name: draft.name ?? undefined,
      selections: draft.selections as GenerateCartRequestSelection[],
      retailer: draft.retailer,
      created_at: draft.createdAt.toISOString(),
      updated_at: draft.updatedAt.toISOString(),
    };
  }

  async createGeneratedCart(input: {
    userId: string;
    cartDraftId?: string;
    cart: GenerateCartResponse;
  }): Promise<PersistedGeneratedCart> {
    const created = await this.prisma.generatedCart.create({
      data: {
        userId: input.userId,
        cartDraftId: input.cartDraftId,
        retailer: input.cart.retailer,
        dishes: input.cart.dishes,
        overview: input.cart.overview,
        matchedItems: input.cart.matched_items,
        estimatedSubtotal: input.cart.estimated_subtotal,
      },
    });

    return {
      id: created.id,
      user_id: created.userId,
      cart_draft_id: created.cartDraftId ?? undefined,
      dishes: created.dishes as GenerateCartResponse['dishes'],
      overview: created.overview as GenerateCartResponse['overview'],
      matched_items: created.matchedItems as GenerateCartResponse['matched_items'],
      estimated_subtotal: created.estimatedSubtotal,
      retailer: created.retailer as GenerateCartResponse['retailer'],
      created_at: created.createdAt.toISOString(),
      updated_at: created.updatedAt.toISOString(),
    };
  }

  async findDraftsByUser(userId: string): Promise<PersistedCartDraft[]> {
    const drafts = await this.prisma.cartDraft.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return drafts.map((draft) => ({
      id: draft.id,
      user_id: draft.userId,
      name: draft.name ?? undefined,
      selections: draft.selections as GenerateCartRequestSelection[],
      retailer: draft.retailer,
      created_at: draft.createdAt.toISOString(),
      updated_at: draft.updatedAt.toISOString(),
    }));
  }

  async findDraftById(userId: string, id: string): Promise<PersistedCartDraft | null> {
    const draft = await this.prisma.cartDraft.findFirst({
      where: { id, userId },
    });

    if (!draft) {
      return null;
    }

    return {
      id: draft.id,
      user_id: draft.userId,
      name: draft.name ?? undefined,
      selections: draft.selections as GenerateCartRequestSelection[],
      retailer: draft.retailer,
      created_at: draft.createdAt.toISOString(),
      updated_at: draft.updatedAt.toISOString(),
    };
  }

  async findGeneratedCartsByUser(userId: string): Promise<PersistedGeneratedCart[]> {
    const carts = await this.prisma.generatedCart.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return carts.map((created) => ({
      id: created.id,
      user_id: created.userId,
      cart_draft_id: created.cartDraftId ?? undefined,
      dishes: created.dishes as GenerateCartResponse['dishes'],
      overview: created.overview as GenerateCartResponse['overview'],
      matched_items: created.matchedItems as GenerateCartResponse['matched_items'],
      estimated_subtotal: created.estimatedSubtotal,
      retailer: created.retailer as GenerateCartResponse['retailer'],
      created_at: created.createdAt.toISOString(),
      updated_at: created.updatedAt.toISOString(),
    }));
  }

  async findGeneratedCartHistoryByUser(
    userId: string,
  ): Promise<GeneratedCartHistorySummary[]> {
    const carts = await this.prisma.generatedCart.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return carts.map((created) => ({
      id: created.id,
      user_id: created.userId,
      cart_draft_id: created.cartDraftId ?? undefined,
      retailer: created.retailer as GenerateCartResponse['retailer'],
      estimated_subtotal: created.estimatedSubtotal,
      dish_count: (created.dishes as GenerateCartResponse['dishes']).length,
      overview_count: (created.overview as GenerateCartResponse['overview']).length,
      matched_item_count: (
        created.matchedItems as GenerateCartResponse['matched_items']
      ).length,
      created_at: created.createdAt.toISOString(),
      updated_at: created.updatedAt.toISOString(),
    }));
  }

  async findGeneratedCartById(
    userId: string,
    id: string,
  ): Promise<PersistedGeneratedCart | null> {
    const created = await this.prisma.generatedCart.findFirst({
      where: { id, userId },
    });

    if (!created) {
      return null;
    }

    return {
      id: created.id,
      user_id: created.userId,
      cart_draft_id: created.cartDraftId ?? undefined,
      dishes: created.dishes as GenerateCartResponse['dishes'],
      overview: created.overview as GenerateCartResponse['overview'],
      matched_items: created.matchedItems as GenerateCartResponse['matched_items'],
      estimated_subtotal: created.estimatedSubtotal,
      retailer: created.retailer as GenerateCartResponse['retailer'],
      created_at: created.createdAt.toISOString(),
      updated_at: created.updatedAt.toISOString(),
    };
  }
}
