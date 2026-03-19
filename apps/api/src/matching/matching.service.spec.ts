import { MatchingService } from './matching.service';

describe('MatchingService', () => {
  let service: MatchingService;

  beforeEach(() => {
    service = new MatchingService();
  });

  it('matches a mock catalog product and computes line totals', () => {
    const [match] = service.matchIngredients([
      {
        canonical_ingredient: 'rice',
        total_amount: 7,
        unit: 'cup',
        purchase_unit_hint: 'cup',
        source_dishes: [],
      },
    ]);

    expect(match.selected_product?.product_id).toBe('walmart-rice-1');
    expect(match.selected_quantity).toBe(2);
    expect(match.estimated_line_total).toBe(7.96);
  });

  it('returns a fallback when no mock product exists', () => {
    const [match] = service.matchIngredients([
      {
        canonical_ingredient: 'unknown ingredient',
        total_amount: 1,
        unit: 'unit',
        source_dishes: [],
      },
    ]);

    expect(match.selected_product).toBeNull();
    expect(match.fallback_used).toBe(true);
    expect(match.estimated_line_total).toBe(0);
  });

  it('converts compatible units before computing quantity', () => {
    const [match] = service.matchIngredients([
      {
        canonical_ingredient: 'aji amarillo paste',
        total_amount: 6,
        unit: 'tsp',
        source_dishes: [],
      },
    ]);

    expect(match.selected_product?.product_id).toBe('walmart-aji-1');
    expect(match.matched_amount).toBe(22.5);
    expect(match.matched_unit).toBe('tsp');
    expect(match.selected_quantity).toBe(1);
    expect(match.fallback_used).toBe(true);
  });
});
