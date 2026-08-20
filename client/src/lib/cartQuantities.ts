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

export function parseStoredCartIds(raw: string | null | undefined): number[] {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.map(toPositiveInteger).filter((id): id is number => id !== null))];
  } catch {
    return [];
  }
}

export function removeCartItem(
  cartIds: number[],
  quantities: ProductQuantities,
  productId: number,
): { cartIds: number[]; quantities: ProductQuantities } {
  const nextCartIds = cartIds.filter((id) => id !== productId);
  const { [productId]: _removed, ...nextQuantities } = quantities;
  return { cartIds: nextCartIds, quantities: nextQuantities };
}

export function clearCart(): { cartIds: number[]; quantities: ProductQuantities } {
  return { cartIds: [], quantities: {} };
}

export function updateCartItemQuantity(
  cartIds: number[],
  quantities: ProductQuantities,
  productId: number,
  quantity: number,
): { cartIds: number[]; quantities: ProductQuantities } {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  return {
    cartIds: [...cartIds],
    quantities: { ...quantities, [productId]: safeQuantity },
  };
}

export function canIncreaseCartQuantity(quantity: number, stock: number): boolean {
  return stock > 0 && quantity < stock;
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
