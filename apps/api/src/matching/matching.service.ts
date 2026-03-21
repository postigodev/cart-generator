import { Injectable } from '@nestjs/common';
import type {
  AggregatedIngredient,
  ProductCandidate,
  MatchedIngredientProduct,
  Retailer,
} from '@cart/shared';
import { mockCatalog } from './mock-catalog';
import { pickCandidate } from './candidate-selection';
import {
  mapMatchedIngredientProduct,
  mapMissingIngredientMatch,
} from './matching.mapper';
import { computeQuantity } from './quantity-estimation';

@Injectable()
export class MatchingService {
  matchIngredients(
    ingredients: AggregatedIngredient[],
  ): MatchedIngredientProduct[] {
    return ingredients.map((ingredient) => this.matchIngredient(ingredient));
  }

  estimateSubtotal(items: MatchedIngredientProduct[]): number {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.estimated_line_total ?? 0),
      0,
    );

    return Number(subtotal.toFixed(2));
  }

  searchProducts(retailer: Retailer, query: string): ProductCandidate[] {
    if (retailer !== 'walmart') {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    const seen = new Set<string>();

    return Object.entries(mockCatalog)
      .flatMap(([canonicalIngredient, candidates]) =>
        candidates.map((candidate) => ({
          canonicalIngredient,
          candidate,
          haystack: [
            canonicalIngredient,
            candidate.title,
            candidate.brand,
            candidate.quantity_text,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
        })),
      )
      .map((entry) => ({
        ...entry,
        score: terms.reduce((score, term) => {
          if (entry.canonicalIngredient.includes(term)) {
            return score + 4;
          }
          if (entry.candidate.title.toLowerCase().includes(term)) {
            return score + 3;
          }
          if (entry.candidate.brand?.toLowerCase().includes(term)) {
            return score + 2;
          }
          if (entry.haystack.includes(term)) {
            return score + 1;
          }
          return score;
        }, 0),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return left.candidate.price - right.candidate.price;
      })
      .map((entry) => entry.candidate)
      .filter((candidate) => {
        if (seen.has(candidate.product_id)) {
          return false;
        }
        seen.add(candidate.product_id);
        return true;
      })
      .slice(0, 12);
  }

  private matchIngredient(
    ingredient: AggregatedIngredient,
  ): MatchedIngredientProduct {
    const candidates = mockCatalog[ingredient.canonical_ingredient] ?? [];
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
}
