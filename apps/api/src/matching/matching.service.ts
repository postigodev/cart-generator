import { Injectable } from '@nestjs/common';
import type {
  AggregatedIngredient,
  MatchedIngredientProduct,
  ProductCandidate,
} from '@cart/shared';
import { mockCatalog } from './mock-catalog';
import { convertUnit } from './unit-conversion';

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
    const selectedMatch = this.pickCandidate(ingredient, candidates);

    if (!selectedMatch) {
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

    const selectedQuantity = this.computeQuantity(
      ingredient,
      selectedMatch.product,
      selectedMatch.convertedSizeValue,
    );
    const estimatedLineTotal = Number(
      (selectedMatch.product.price * selectedQuantity).toFixed(2),
    );
    const usedFallback =
      selectedMatch.product.size_unit !== ingredient.unit ||
      selectedMatch.convertedSizeValue === null;

    return {
      canonical_ingredient: ingredient.canonical_ingredient,
      needed_amount: ingredient.total_amount,
      needed_unit: ingredient.unit,
      matched_amount: selectedMatch.convertedSizeValue ?? undefined,
      matched_unit: ingredient.unit,
      purchase_unit_hint: ingredient.purchase_unit_hint,
      walmart_search_query: ingredient.canonical_ingredient,
      selected_product: selectedMatch.product,
      selected_quantity: selectedQuantity,
      estimated_line_total: estimatedLineTotal,
      fallback_used: usedFallback || undefined,
      notes: usedFallback
        ? selectedMatch.convertedSizeValue !== null
          ? `Matched using converted ${selectedMatch.product.size_unit ?? 'unknown'} package size`
          : `Matched using ${selectedMatch.product.size_unit ?? 'unknown'} package size`
        : undefined,
    };
  }

  private pickCandidate(
    ingredient: AggregatedIngredient,
    candidates: ProductCandidate[],
  ):
    | {
        product: ProductCandidate;
        convertedSizeValue: number | null;
      }
    | null {
    if (candidates.length === 0) {
      return null;
    }

    return candidates
      .slice()
      .map((candidate) => ({
        product: candidate,
        convertedSizeValue: this.convertCandidateSize(ingredient, candidate),
      }))
      .sort((left, right) => {
        const leftConvertible = left.convertedSizeValue !== null ? 0 : 1;
        const rightConvertible = right.convertedSizeValue !== null ? 0 : 1;

        if (leftConvertible !== rightConvertible) {
          return leftConvertible - rightConvertible;
        }

        const leftUnitPenalty = left.product.size_unit === ingredient.unit ? 0 : 1;
        const rightUnitPenalty =
          right.product.size_unit === ingredient.unit ? 0 : 1;

        if (leftUnitPenalty !== rightUnitPenalty) {
          return leftUnitPenalty - rightUnitPenalty;
        }

        return left.product.price - right.product.price;
      })[0];
  }

  private computeQuantity(
    ingredient: AggregatedIngredient,
    selectedProduct: ProductCandidate,
    convertedSizeValue: number | null,
  ): number {
    if (selectedProduct.size_value && convertedSizeValue) {
      return Math.max(
        1,
        Math.ceil(ingredient.total_amount / convertedSizeValue),
      );
    }

    return 1;
  }

  private convertCandidateSize(
    ingredient: AggregatedIngredient,
    candidate: ProductCandidate,
  ): number | null {
    if (!candidate.size_value || !candidate.size_unit) {
      return null;
    }

    return convertUnit(candidate.size_value, candidate.size_unit, ingredient.unit);
  }
}
