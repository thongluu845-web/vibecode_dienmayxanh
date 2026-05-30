import { NextResponse, type NextRequest } from "next/server";
import { PRODUCT_SELECT, mapProduct, type ProductRow } from "@/lib/catalog";
import { createCartSnapshot } from "@/lib/cart";
import { createClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { CartItem } from "@/types";

type CartItemRow = {
  id: string;
  quantity: number;
  products: ProductRow | ProductRow[] | null;
};

type ProductStockRow = {
  stock_quantity: number | null;
};

const CART_ITEMS_SELECT = `id,quantity,products!inner(${PRODUCT_SELECT})`;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_CART_QUANTITY = 99;

export const dynamic = "force-dynamic";

function jsonCart(items: CartItem[], authenticated: boolean, init?: ResponseInit) {
  return NextResponse.json(createCartSnapshot(items, "supabase", authenticated), init);
}

function jsonError(code: string, status: number, message = code) {
  return NextResponse.json(
    {
      code,
      error: message,
      ...createCartSnapshot([], "supabase", false),
    },
    { status },
  );
}

async function getRequestBody(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();

    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function getProductId(body: Record<string, unknown>): string | null {
  const productId = body.productId;

  return typeof productId === "string" && UUID_PATTERN.test(productId) ? productId : null;
}

function getQuantity(body: Record<string, unknown>): number {
  const quantity = Number(body.quantity);

  if (!Number.isFinite(quantity)) return 1;

  return Math.max(1, Math.min(Math.trunc(quantity), MAX_CART_QUANTITY));
}

function getJoinedProduct(row: CartItemRow): ProductRow | null {
  if (Array.isArray(row.products)) {
    return row.products[0] ?? null;
  }

  return row.products;
}

function mapCartItem(row: CartItemRow): CartItem | null {
  const product = getJoinedProduct(row);

  if (!product) return null;

  return {
    product: mapProduct(product),
    quantity: row.quantity,
  };
}

async function getAuthenticatedClient() {
  if (!hasSupabaseServerConfig()) {
    return { supabase: null, user: null, missingConfig: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { supabase, user: error ? null : user, missingConfig: false };
}

async function readCartItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_ITEMS_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as CartItemRow[])
    .map(mapCartItem)
    .filter((item): item is CartItem => Boolean(item));
}

async function getProductStock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("products")
    .select("stock_quantity")
    .eq("id", productId)
    .single();

  if (error || !data) return null;

  return Math.max(0, (data as ProductStockRow).stock_quantity ?? 0);
}

function isCartUnavailableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;

  return (
    error.code === "PGRST202" ||
    error.code === "PGRST205" ||
    error.message?.includes("cart_items") === true ||
    error.message?.includes("add_cart_item") === true
  );
}

export async function GET() {
  const { supabase, user, missingConfig } = await getAuthenticatedClient();

  if (missingConfig) {
    return jsonError("missing_supabase_env", 503);
  }

  if (!supabase || !user) {
    return jsonCart([], false);
  }

  try {
    return jsonCart(await readCartItems(supabase, user.id), true);
  } catch (error) {
    if (isCartUnavailableError(error as { code?: string; message?: string })) {
      return jsonError("cart_unavailable", 503);
    }

    console.error("Cart read failed:", error);
    return jsonError("cart_read_failed", 500);
  }
}

export async function POST(request: NextRequest) {
  const { supabase, user, missingConfig } = await getAuthenticatedClient();

  if (missingConfig) {
    return jsonError("missing_supabase_env", 503);
  }

  if (!supabase || !user) {
    return jsonError("not_authenticated", 401);
  }

  const body = await getRequestBody(request);
  const productId = getProductId(body);

  if (!productId) {
    return jsonError("invalid_product", 400);
  }

  const { error } = await supabase.rpc("add_cart_item", {
    p_product_id: productId,
    p_quantity: getQuantity(body),
  });

  if (error) {
    if (isCartUnavailableError(error)) {
      return jsonError("cart_unavailable", 503);
    }

    if (error.message.includes("product_unavailable")) {
      return jsonError("product_unavailable", 409);
    }

    console.error("Cart add failed:", error);
    return jsonError("cart_add_failed", 500);
  }

  return jsonCart(await readCartItems(supabase, user.id), true);
}

export async function PATCH(request: NextRequest) {
  const { supabase, user, missingConfig } = await getAuthenticatedClient();

  if (missingConfig) {
    return jsonError("missing_supabase_env", 503);
  }

  if (!supabase || !user) {
    return jsonError("not_authenticated", 401);
  }

  const body = await getRequestBody(request);
  const productId = getProductId(body);

  if (!productId) {
    return jsonError("invalid_product", 400);
  }

  const stock = await getProductStock(supabase, productId);

  if (!stock) {
    return jsonError("product_unavailable", 409);
  }

  const quantity = Math.min(getQuantity(body), stock);
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    if (isCartUnavailableError(error)) {
      return jsonError("cart_unavailable", 503);
    }

    console.error("Cart update failed:", error);
    return jsonError("cart_update_failed", 500);
  }

  return jsonCart(await readCartItems(supabase, user.id), true);
}

export async function DELETE(request: NextRequest) {
  const { supabase, user, missingConfig } = await getAuthenticatedClient();

  if (missingConfig) {
    return jsonError("missing_supabase_env", 503);
  }

  if (!supabase || !user) {
    return jsonError("not_authenticated", 401);
  }

  const body = await getRequestBody(request);
  const productId = getProductId(body);

  if (!productId) {
    return jsonError("invalid_product", 400);
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    if (isCartUnavailableError(error)) {
      return jsonError("cart_unavailable", 503);
    }

    console.error("Cart delete failed:", error);
    return jsonError("cart_delete_failed", 500);
  }

  return jsonCart(await readCartItems(supabase, user.id), true);
}
