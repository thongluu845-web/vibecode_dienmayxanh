import type { CartItem, Product } from "@/types";

export type CartSource = "supabase" | "local";

export type CartSnapshot = {
  items: CartItem[];
  count: number;
  subtotal: number;
  savings: number;
  authenticated: boolean;
  source: CartSource;
};

export type CartMutationResult = {
  ok: boolean;
  snapshot: CartSnapshot;
  source: CartSource;
  authenticated: boolean;
  error?: string;
};

type LocalCartLine = CartItem & {
  updatedAt: string;
};

type ServerCartResponse = Partial<CartSnapshot> & {
  code?: string;
  error?: string;
};

export const CART_STORAGE_KEY = "dien-may-luu-thao.cart.v1";
export const CART_CHANGED_EVENT = "dien-may-luu-thao:cart-changed";

const MAX_CART_QUANTITY = 99;

function emptyCartSnapshot(source: CartSource = "local", authenticated = false): CartSnapshot {
  return {
    items: [],
    count: 0,
    subtotal: 0,
    savings: 0,
    authenticated,
    source,
  };
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function clampQuantity(quantity: number, stock?: number): number {
  const parsed = Number.isFinite(quantity) ? Math.trunc(quantity) : 1;
  const stockLimit = typeof stock === "number" && stock > 0 ? stock : MAX_CART_QUANTITY;

  return Math.max(1, Math.min(parsed, stockLimit, MAX_CART_QUANTITY));
}

function getLineSavings(item: CartItem): number {
  const discount = Math.max(0, item.product.originalPrice - item.product.price);

  return discount * item.quantity;
}

export function createCartSnapshot(
  items: CartItem[],
  source: CartSource,
  authenticated: boolean,
): CartSnapshot {
  const safeItems = items.filter((item) => item.product?.id && item.quantity > 0);

  return {
    items: safeItems,
    count: safeItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: safeItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
    savings: safeItems.reduce((total, item) => total + getLineSavings(item), 0),
    authenticated,
    source,
  };
}

function sanitizeProduct(product: Product): Product {
  const source = product as Partial<Product>;
  const price = Number(source.price);
  const originalPrice = Number(source.originalPrice);
  const stock = Number(source.stock);

  return {
    id: source.id ?? "",
    slug: source.slug ?? "",
    name: source.name ?? "Sản phẩm",
    brand: source.brand ?? "",
    category: source.category ?? "",
    categorySlug: source.categorySlug ?? "",
    price: Number.isFinite(price) ? price : 0,
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : Number.isFinite(price) ? price : 0,
    discount: Number.isFinite(Number(source.discount)) ? Number(source.discount) : 0,
    images: Array.isArray(source.images) ? [...source.images] : source.thumbnail ? [source.thumbnail] : [],
    thumbnail: source.thumbnail ?? "/assets/dien-lanh/product-may-giat-10kg.png",
    rating: Number.isFinite(Number(source.rating)) ? Number(source.rating) : 0,
    reviewCount: Number.isFinite(Number(source.reviewCount)) ? Number(source.reviewCount) : 0,
    sold: Number.isFinite(Number(source.sold)) ? Number(source.sold) : 0,
    stock: Number.isFinite(stock) ? stock : MAX_CART_QUANTITY,
    description: source.description ?? "",
    shortDescription: source.shortDescription ?? "",
    specs: source.specs && typeof source.specs === "object" && !Array.isArray(source.specs) ? { ...source.specs } : {},
    tags: Array.isArray(source.tags) ? [...source.tags] : [],
    isNew: Boolean(source.isNew),
    isFeatured: Boolean(source.isFeatured),
    isFlashSale: Boolean(source.isFlashSale),
    flashSaleEnd: source.flashSaleEnd,
    installmentAvailable: Boolean(source.installmentAvailable),
  };
}

function readLocalLines(): LocalCartLine[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((line): line is LocalCartLine => {
        return Boolean(
          line &&
            typeof line === "object" &&
            line.product &&
            typeof line.product.id === "string" &&
            typeof line.quantity === "number",
        );
      })
      .map((line) => ({
        product: sanitizeProduct(line.product),
        quantity: clampQuantity(line.quantity, line.product.stock),
        updatedAt: typeof line.updatedAt === "string" ? line.updatedAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

function writeLocalLines(lines: LocalCartLine[]): CartSnapshot {
  const snapshot = createCartSnapshot(lines, "local", false);

  if (isBrowser()) {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  }

  notifyCartChanged(snapshot);

  return snapshot;
}

export function getLocalCartSnapshot(): CartSnapshot {
  return createCartSnapshot(readLocalLines(), "local", false);
}

export function notifyCartChanged(snapshot?: CartSnapshot): void {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new CustomEvent<CartSnapshot>(CART_CHANGED_EVENT, {
      detail: snapshot ?? getLocalCartSnapshot(),
    }),
  );
}

function addLocalProduct(product: Product, quantity: number): CartSnapshot {
  const lines = readLocalLines();
  const existing = lines.find((line) => line.product.id === product.id);
  const now = new Date().toISOString();

  if (existing) {
    existing.product = sanitizeProduct(product);
    existing.quantity = clampQuantity(existing.quantity + quantity, product.stock);
    existing.updatedAt = now;
  } else {
    lines.unshift({
      product: sanitizeProduct(product),
      quantity: clampQuantity(quantity, product.stock),
      updatedAt: now,
    });
  }

  return writeLocalLines(lines);
}

function updateLocalProduct(productId: string, quantity: number, product?: Product): CartSnapshot {
  const now = new Date().toISOString();
  const lines = readLocalLines()
    .map((line) => {
      if (line.product.id !== productId) return line;

      const nextProduct = product ? sanitizeProduct(product) : line.product;

      return {
        product: nextProduct,
        quantity: clampQuantity(quantity, nextProduct.stock),
        updatedAt: now,
      };
    })
    .filter((line) => line.quantity > 0);

  return writeLocalLines(lines);
}

function removeLocalProduct(productId: string): CartSnapshot {
  return writeLocalLines(readLocalLines().filter((line) => line.product.id !== productId));
}

function clearLocalCartStorage(): void {
  if (!isBrowser()) return;

  window.localStorage.removeItem(CART_STORAGE_KEY);
}

function normalizeServerSnapshot(value: ServerCartResponse): CartSnapshot | null {
  if (!Array.isArray(value.items)) return null;

  return createCartSnapshot(
    value.items,
    value.source === "local" ? "local" : "supabase",
    Boolean(value.authenticated),
  );
}

async function readResponseBody(response: Response): Promise<ServerCartResponse> {
  try {
    return (await response.json()) as ServerCartResponse;
  } catch {
    return {};
  }
}

function shouldUseLocalFallback(response: Response, body: ServerCartResponse): boolean {
  return (
    response.status === 401 ||
    response.status === 404 ||
    response.status === 503 ||
    body.code === "missing_supabase_env" ||
    body.code === "not_authenticated" ||
    body.code === "cart_unavailable"
  );
}

async function requestCart(
  method: "POST" | "PATCH" | "DELETE",
  body: Record<string, unknown>,
): Promise<{ snapshot: CartSnapshot | null; fallback: boolean; error?: string }> {
  const response = await fetch("/api/cart", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseBody = await readResponseBody(response);

  if (response.ok) {
    return { snapshot: normalizeServerSnapshot(responseBody), fallback: false };
  }

  if (shouldUseLocalFallback(response, responseBody)) {
    return { snapshot: null, fallback: true, error: responseBody.error };
  }

  return {
    snapshot: null,
    fallback: false,
    error: responseBody.error ?? "cart_request_failed",
  };
}

async function syncLocalLinesToSupabase(lines: LocalCartLine[]): Promise<CartSnapshot | null> {
  if (lines.length === 0) return null;

  for (const line of lines) {
    const result = await requestCart("POST", {
      productId: line.product.id,
      quantity: line.quantity,
    });

    if (!result.snapshot) {
      return null;
    }
  }

  clearLocalCartStorage();

  const response = await fetch("/api/cart", { cache: "no-store" });
  const body = await readResponseBody(response);

  return response.ok ? normalizeServerSnapshot(body) : null;
}

export async function fetchCartSnapshot(): Promise<CartSnapshot> {
  if (!isBrowser()) return emptyCartSnapshot();

  try {
    const localLines = readLocalLines();
    const response = await fetch("/api/cart", { cache: "no-store" });
    const body = await readResponseBody(response);
    const snapshot = response.ok ? normalizeServerSnapshot(body) : null;

    if (snapshot?.authenticated) {
      const syncedSnapshot = await syncLocalLinesToSupabase(localLines);

      if (syncedSnapshot?.authenticated) {
        return syncedSnapshot;
      }

      return snapshot;
    }
  } catch {
    // Local cart remains available if the API is unreachable.
  }

  return getLocalCartSnapshot();
}

export async function addToCart(product: Product, quantity = 1): Promise<CartMutationResult> {
  if (product.stock <= 0) {
    const snapshot = await fetchCartSnapshot();

    return {
      ok: false,
      snapshot,
      source: snapshot.source,
      authenticated: snapshot.authenticated,
      error: "out_of_stock",
    };
  }

  try {
    const result = await requestCart("POST", {
      productId: product.id,
      quantity: clampQuantity(quantity, product.stock),
    });

    if (result.snapshot) {
      notifyCartChanged(result.snapshot);

      return {
        ok: true,
        snapshot: result.snapshot,
        source: result.snapshot.source,
        authenticated: result.snapshot.authenticated,
      };
    }

    if (!result.fallback) {
      const snapshot = await fetchCartSnapshot();

      return {
        ok: false,
        snapshot,
        source: snapshot.source,
        authenticated: snapshot.authenticated,
        error: result.error,
      };
    }
  } catch {
    // Fall through to local cart so guests can still continue shopping.
  }

  const snapshot = addLocalProduct(product, quantity);

  return {
    ok: true,
    snapshot,
    source: "local",
    authenticated: false,
  };
}

export async function updateCartQuantity(
  product: Product,
  quantity: number,
): Promise<CartMutationResult> {
  const nextQuantity = clampQuantity(quantity, product.stock);

  try {
    const result = await requestCart("PATCH", {
      productId: product.id,
      quantity: nextQuantity,
    });

    if (result.snapshot) {
      notifyCartChanged(result.snapshot);

      return {
        ok: true,
        snapshot: result.snapshot,
        source: result.snapshot.source,
        authenticated: result.snapshot.authenticated,
      };
    }

    if (!result.fallback) {
      const snapshot = await fetchCartSnapshot();

      return {
        ok: false,
        snapshot,
        source: snapshot.source,
        authenticated: snapshot.authenticated,
        error: result.error,
      };
    }
  } catch {
    // Keep local fallback behavior consistent with add-to-cart.
  }

  const snapshot = updateLocalProduct(product.id, nextQuantity, product);

  return {
    ok: true,
    snapshot,
    source: "local",
    authenticated: false,
  };
}

export async function removeFromCart(productId: string): Promise<CartMutationResult> {
  try {
    const result = await requestCart("DELETE", { productId });

    if (result.snapshot) {
      notifyCartChanged(result.snapshot);

      return {
        ok: true,
        snapshot: result.snapshot,
        source: result.snapshot.source,
        authenticated: result.snapshot.authenticated,
      };
    }

    if (!result.fallback) {
      const snapshot = await fetchCartSnapshot();

      return {
        ok: false,
        snapshot,
        source: snapshot.source,
        authenticated: snapshot.authenticated,
        error: result.error,
      };
    }
  } catch {
    // Keep local fallback behavior consistent with add-to-cart.
  }

  const snapshot = removeLocalProduct(productId);

  return {
    ok: true,
    snapshot,
    source: "local",
    authenticated: false,
  };
}
