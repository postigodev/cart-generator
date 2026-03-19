import { Injectable } from '@nestjs/common';
import type {
  AggregatedIngredient,
  MatchedIngredientProduct,
  ProductCandidate,
} from '@cart/shared';
import { mockCatalog } from './mock-catalog';

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

  private matchIngredient(
    ingredient: AggregatedIngredient,
  ): MatchedIngredientProduct {
    const candidates = mockCatalog[ingredient.canonical_ingredient] ?? [];
    const compatibleCandidates = candidates.filter(
      (candidate) => candidate.size_unit === ingredient.unit,
    );

    const selectedProduct = this.pickCandidate(
      compatibleCandidates.length > 0 ? compatibleCandidates : candidates,
    );

    if (!selectedProduct) {
      return {
        canonical_ingredient: ingredient.canonical_ingredient,
        needed_amount: ingredient.total_amount,
        needed_unit: ingredient.unit,
        purchase_unit_hint: ingredient.purchase_unit_hint,
        walmart_search_query: ingredient.canonical_ingredient,
        selected_product: null,
        selected_quantity: 0,
        estimated_line_total: 0,
        fallback_used: true,
        notes: 'No mock catalog candidate found',
      };
    }

    const selectedQuantity = this.computeQuantity(ingredient, selectedProduct);
    const estimatedLineTotal = Number(
      (selectedProduct.price * selectedQuantity).toFixed(2),
    );
    const usedFallback = selectedProduct.size_unit !== ingredient.unit;

    return {
      canonical_ingredient: ingredient.canonical_ingredient,
      needed_amount: ingredient.total_amount,
      needed_unit: ingredient.unit,
      purchase_unit_hint: ingredient.purchase_unit_hint,
      walmart_search_query: ingredient.canonical_ingredient,
      selected_product: selectedProduct,
      selected_quantity: selectedQuantity,
      estimated_line_total: estimatedLineTotal,
      fallback_used: usedFallback || undefined,
      notes: usedFallback
        ? `Matched using ${selectedProduct.size_unit ?? 'unknown'} package size`
        : undefined,
    };
  }

  private pickCandidate(
    candidates: ProductCandidate[],
  ): ProductCandidate | null {
    if (candidates.length === 0) {
      return null;
    }

    return candidates
      .slice()
      .sort((left, right) => left.price - right.price)[0];
  }

  private computeQuantity(
    ingredient: AggregatedIngredient,
    selectedProduct: ProductCandidate,
  ): number {
    if (
      selectedProduct.size_value &&
      selectedProduct.size_unit === ingredient.unit
    ) {
      return Math.max(
        1,
        Math.ceil(ingredient.total_amount / selectedProduct.size_value),
      );
    }

    return 1;
  }
}
