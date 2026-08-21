import type { ProductQuantities } from "./cartQuantities";
import { parseStoredCartIds, parseStoredQuantities } from "./cartQuantities";

export type SuggestionCartResult = {
  cart: number[];
  quantities: ProductQuantities;
  added: boolean;
  reason?: "out_of_stock" | "stock_limit";
};

export function addSuggestionProductToCart(
  cart: number[],
  quantities: ProductQuantities,
  productId: number,
  stock: number,
): SuggestionCartResult {
  if (stock <= 0) return { cart, quantities, added: false, reason: "out_of_stock" };

  const currentQuantity = quantities[productId] ?? 0;
  if (currentQuantity >= stock) return { cart, quantities, added: false, reason: "stock_limit" };

  return {
    cart: cart.includes(productId) ? [...cart] : [...cart, productId],
    quantities: { ...quantities, [productId]: currentQuantity + 1 },
    added: true,
  };
}

type CartStorage = Pick<Storage, "getItem" | "setItem">;

type SuggestionCartCallbacks = {
  onAdded: () => void;
  onRequireSignIn: () => void;
  onUnavailable: (reason: NonNullable<SuggestionCartResult["reason"]>) => void;
};

export function persistSuggestionProductCart(
  storage: CartStorage,
  productId: number,
  stock: number,
): SuggestionCartResult {
  const cart = parseStoredCartIds(storage.getItem("pending_cart"));
  const quantities = parseStoredQuantities(storage.getItem("pending_quantities"));
  const result = addSuggestionProductToCart(cart, quantities, productId, stock);

  if (result.added) {
    storage.setItem("pending_cart", JSON.stringify(result.cart));
    storage.setItem("pending_quantities", JSON.stringify(result.quantities));
  }

  return result;
}

export function getSuggestionCartPostAddAction(isAuthenticated: boolean) {
  return isAuthenticated ? "show_success" : "redirect_to_sign_in";
}

export function executeSuggestionCartAction({
  storage,
  productId,
  stock,
  isAuthenticated,
  callbacks,
}: {
  storage: CartStorage;
  productId: number;
  stock: number;
  isAuthenticated: boolean;
  callbacks: SuggestionCartCallbacks;
}): SuggestionCartResult {
  const result = persistSuggestionProductCart(storage, productId, stock);
  if (!result.added) {
    callbacks.onUnavailable(result.reason!);
    return result;
  }

  if (getSuggestionCartPostAddAction(isAuthenticated) === "redirect_to_sign_in") {
    storage.setItem("pending_checkout_after_login", "true");
    callbacks.onRequireSignIn();
  } else {
    callbacks.onAdded();
  }

  return result;
}
