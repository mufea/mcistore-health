export type ProductQuantities = Record<number, number>;

function toPositiveInteger(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
}

export function parseCheckoutQuantities(raw: string | null | undefined): ProductQuantities {
  return (raw ?? "").split(",").reduce<ProductQuantities>((result, entry) => {
    const [id, quantity] = entry.split(":");
    const productId = toPositiveInteger(id);
    const amount = toPositiveInteger(quantity);
    if (productId && amount) result[productId] = amount;
    return result;
  }, {});
}

export function parseStoredQuantities(raw: string | null | undefined): ProductQuantities {
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.entries(parsed).reduce<ProductQuantities>((result, [id, quantity]) => {
      const productId = toPositiveInteger(id);
      const amount = toPositiveInteger(quantity);
      if (productId && amount) result[productId] = amount;
      return result;
    }, {});
  } catch {
    return {};
  }
}

export function resolveCheckoutQuantities(
  productIds: number[],
  queryQuantities: ProductQuantities,
  storedQuantities: ProductQuantities,
): ProductQuantities {
  return productIds.reduce<ProductQuantities>((result, productId) => {
    result[productId] = queryQuantities[productId] ?? storedQuantities[productId] ?? 1;
    return result;
  }, {});
}
