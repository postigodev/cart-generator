const MASS_CONVERSIONS: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

const VOLUME_CONVERSIONS: Record<string, number> = {
  tsp: 1,
  tbsp: 3,
  cup: 48,
  pint: 96,
  qt: 192,
  l: 202.884,
  ml: 0.202884,
};

const UNIT_GROUPS = [MASS_CONVERSIONS, VOLUME_CONVERSIONS];

export const convertUnit = (
  amount: number,
  fromUnit: string,
  toUnit: string,
): number | null => {
  const normalizedFrom = fromUnit.toLowerCase();
  const normalizedTo = toUnit.toLowerCase();

  if (normalizedFrom === normalizedTo) {
    return amount;
  }

  for (const group of UNIT_GROUPS) {
    if (group[normalizedFrom] && group[normalizedTo]) {
      const baseAmount = amount * group[normalizedFrom];
      return baseAmount / group[normalizedTo];
    }
  }

  return null;
};
