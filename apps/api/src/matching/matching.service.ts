import { Injectable } from '@nestjs/common';
import type {
  AggregatedIngredient,
  MatchedIngredientProduct,
  Retailer,
} from '@cart/shared';
import { KrogerRetailerProductProvider } from './kroger-retailer-product.provider';
import { MockRetailerProductProvider } from './mock-retailer-product.provider';
import { pickCandidate } from './candidate-selection';
import {
  mapMatchedIngredientProduct,
  mapMissingIngredientMatch,
} from './matching.mapper';
import { computeQuantity } from './quantity-estimation';
import type { RetailerSearchContext } from './retailer-product-provider';
import { WalmartRetailerProductProvider } from './walmart-retailer-product.provider';

@Injectable()
export class MatchingService {
  constructor(
    private readonly mockProvider: MockRetailerProductProvider,
    private readonly krogerProvider: KrogerRetailerProductProvider,
    private readonly walmartProvider: WalmartRetailerProductProvider,
  ) {}

  async matchIngredients(
    ingredients: AggregatedIngredient[],
    retailer: Retailer,
    context?: RetailerSearchContext,
  ): Promise<MatchedIngredientProduct[]> {
    return Promise.all(
      ingredients.map((ingredient) =>
        this.matchIngredient(ingredient, retailer, context),
      ),
    );
  }

  estimateSubtotal(items: MatchedIngredientProduct[]): number {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.estimated_line_total ?? 0),
      0,
    );

    return Number(subtotal.toFixed(2));
  }

  async searchProducts(
    retailer: Retailer,
    query: string,
    context?: RetailerSearchContext,
  ) {
    return this.getProvider(retailer).searchProducts(query, context);
  }

  isProviderEnabled(retailer: Retailer) {
    if (retailer === 'kroger') {
      return this.krogerProvider.isEnabled();
    }

    if (retailer === 'walmart') {
      return this.walmartProvider.isEnabled() || this.mockProvider.isEnabled();
    }

    return false;
  }

  private async matchIngredient(
    ingredient: AggregatedIngredient,
    retailer: Retailer,
    context?: RetailerSearchContext,
  ): Promise<MatchedIngredientProduct> {
    const candidates = await this.getProvider(retailer).findCandidatesForIngredient(
      ingredient.canonical_ingredient,
      context,
    );
    const selectedMatch = pickCandidate(ingredient, candidates);

    if (!selectedMatch) {
      return mapMissingIngredientMatch(ingredient);
    }

    const selectedQuantity = computeQuantity(
      ingredient,
      selectedMatch.product,
      selectedMatch.convertedSizeValue,
    );

    return mapMatchedIngredientProduct(ingredient, selectedMatch, selectedQuantity);
  }

  private getProvider(retailer: Retailer) {
    if (retailer === 'kroger') {
      return this.krogerProvider;
    }

    if (retailer === 'walmart' && this.walmartProvider.isEnabled()) {
      return this.walmartProvider;
    }

    return this.mockProvider;
  }
}
