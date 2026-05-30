import { NextResponse, type NextRequest } from "next/server";
import { PRODUCT_SELECT, mapProduct, type ProductRow } from "@/lib/catalog";
import { createSePayCheckoutPayload, createSePayInvoiceNumber, hasSePayConfig } from "@/lib/sepay";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";
import { createClient as createUserClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { CartItem, Product } from "@/types";

type CheckoutBody = {
  customer?: {
    name?: unknown;
    phone?: unknown;
    address?: unknown;
  };
  items?: unknown;
};

type CheckoutCustomer = {
  name: string;
  phone: string;
  address: string;
};

type CheckoutLine = {
  productId: string;
  quantity: number;
};

type CartLineRow = {
  product_id: string;
  quantity: number;
};

type OrderInsertRow = {
  id: string;
  order_number: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_CART_QUANTITY = 99;
const CHECKOUT_EXPIRES_IN_SECONDS = 30 * 60;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(code: string, status: number, message = code) {
  return NextResponse.json({ code, error: message }, { status });
}

async function readBody(request: NextRequest): Promise<CheckoutBody> {
  try {
    const body = await request.json();

    return body && typeof body === "object" ? (body as CheckoutBody) : {};
  } catch {
    return {};
  }
}

function normalizeText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function getCustomer(body: CheckoutBody): CheckoutCustomer | null {
  const name = normalizeText(body.customer?.name, 80);
  const phone = normalizeText(body.customer?.phone, 24);
  const address = normalizeText(body.customer?.address, 240);
  const digits = phone.replace(/[^\d]/g, "");

  if (name.length < 2 || address.length < 8 || digits.length < 9 || digits.length > 12) {
    return null;
  }

  return { name, phone, address };
}

function getGuestLines(items: unknown): CheckoutLine[] {
  if (!Array.isArray(items)) return [];

  const byProduct = new Map<string, number>();

  for (const item of items) {
    if (!item || typeof item !== "object") continue;

    const record = item as Record<string, unknown>;
    const productId = record.productId;
    const quantity = Number(record.quantity);

    if (typeof productId !== "string" || !UUID_PATTERN.test(productId) || !Number.isFinite(quantity)) {
      continue;
    }

    const safeQuantity = Math.max(1, Math.min(Math.trunc(quantity), MAX_CART_QUANTITY));
    byProduct.set(productId, Math.min((byProduct.get(productId) ?? 0) + safeQuantity, MAX_CART_QUANTITY));
  }

  return Array.from(byProduct, ([productId, quantity]) => ({ productId, quantity }));
}

async function getAuthenticatedContext() {
  if (!hasSupabaseServerConfig()) {
    return { userId: null, supabase: null };
  }

  const supabase = await createUserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { userId: error ? null : user?.id ?? null, supabase };
}

async function getAuthenticatedCartLines(
  supabase: Awaited<ReturnType<typeof createUserClient>>,
  userId: string,
): Promise<CheckoutLine[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id,quantity")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as CartLineRow[])
    .filter((line) => UUID_PATTERN.test(line.product_id) && line.quantity > 0)
    .map((line) => ({
      productId: line.product_id,
      quantity: Math.max(1, Math.min(Math.trunc(line.quantity), MAX_CART_QUANTITY)),
    }));
}

async function getCheckoutItems(lines: CheckoutLine[]): Promise<CartItem[]> {
  const productIds = Array.from(new Set(lines.map((line) => line.productId)));

  if (productIds.length === 0) return [];

  const { data, error } = await createAdminClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", productIds)
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  const products = new Map<string, Product>();

  for (const row of data ?? []) {
    const product = mapProduct(row as unknown as ProductRow);
    products.set(product.id, product);
  }

  return lines.map((line) => {
    const product = products.get(line.productId);

    if (!product || product.stock <= 0 || line.quantity > product.stock) {
      throw new Error("product_unavailable");
    }

    return { product, quantity: line.quantity };
  });
}

function getOrderTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + Math.round(item.product.price) * item.quantity, 0);
  const shipping = 0;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

function getSiteOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Fall back to the request URL below.
    }
  }

  return new URL(request.url).origin;
}

function createReturnUrl(origin: string, path: string, orderNumber: string, invoiceNumber: string): string {
  const url = new URL(path, origin);
  url.searchParams.set("orderNumber", orderNumber);
  url.searchParams.set("invoice", invoiceNumber);

  return url.toString();
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseAdminConfig()) {
    return jsonError("missing_supabase_admin_env", 503, "Thiếu cấu hình Supabase server.");
  }

  if (!hasSePayConfig()) {
    return jsonError("missing_sepay_env", 503, "Thiếu cấu hình SePay server.");
  }

  const body = await readBody(request);
  const customer = getCustomer(body);

  if (!customer) {
    return jsonError("invalid_customer", 400, "Vui lòng nhập tên, số điện thoại và địa chỉ hợp lệ.");
  }

  const { userId, supabase } = await getAuthenticatedContext();
  let lines: CheckoutLine[] = [];

  try {
    lines =
      userId && supabase
        ? await getAuthenticatedCartLines(supabase, userId)
        : getGuestLines(body.items);
  } catch (error) {
    console.error("Checkout cart read failed:", error);
    return jsonError("cart_read_failed", 500, "Không đọc được giỏ hàng.");
  }

  if (lines.length === 0) {
    return jsonError("cart_empty", 400, "Giỏ hàng đang trống.");
  }

  let checkoutItems: CartItem[];

  try {
    checkoutItems = await getCheckoutItems(lines);
  } catch (error) {
    if (error instanceof Error && error.message === "product_unavailable") {
      return jsonError("product_unavailable", 409, "Sản phẩm đã hết hàng hoặc vượt số lượng tồn kho.");
    }

    console.error("Checkout product read failed:", error);
    return jsonError("product_read_failed", 500, "Không đọc được thông tin sản phẩm.");
  }

  const totals = getOrderTotals(checkoutItems);

  if (totals.total <= 0) {
    return jsonError("invalid_total", 400, "Tổng thanh toán không hợp lệ.");
  }

  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      payment_method: "online",
      payment_status: "unpaid",
      customer_name: customer.name,
      customer_phone: customer.phone,
      shipping_address: customer.address,
      subtotal: totals.subtotal,
      shipping_fee: totals.shipping,
      discount_amount: 0,
      total_amount: totals.total,
      provider: "sepay",
    })
    .select("id,order_number")
    .single();

  if (orderError || !order) {
    console.error("Order create failed:", orderError);
    return jsonError("order_create_failed", 500, "Không tạo được đơn hàng.");
  }

  const createdOrder = order as OrderInsertRow;
  const orderItems = checkoutItems.map((item) => ({
    order_id: createdOrder.id,
    product_id: item.product.id,
    product_slug: item.product.slug,
    product_name: item.product.name,
    unit_price: Math.round(item.product.price),
    quantity: item.quantity,
    line_total: Math.round(item.product.price) * item.quantity,
  }));

  const { error: orderItemsError } = await admin.from("order_items").insert(orderItems);

  if (orderItemsError) {
    console.error("Order items create failed:", orderItemsError);
    await admin.from("orders").delete().eq("id", createdOrder.id);
    return jsonError("order_items_create_failed", 500, "Không tạo được chi tiết đơn hàng.");
  }

  let checkout;

  try {
    const origin = getSiteOrigin(request);
    const invoiceNumber = createSePayInvoiceNumber(createdOrder.order_number);

    checkout = createSePayCheckoutPayload({
      invoiceNumber,
      amount: totals.total,
      customerId: userId,
      successUrl: createReturnUrl(origin, "/thanh-toan/thanh-cong", createdOrder.order_number, invoiceNumber),
      errorUrl: createReturnUrl(origin, "/thanh-toan/huy", createdOrder.order_number, invoiceNumber),
      cancelUrl: createReturnUrl(origin, "/thanh-toan/huy", createdOrder.order_number, invoiceNumber),
    });
  } catch (error) {
    console.error("SePay checkout form create failed:", error);
    await admin
      .from("orders")
      .update({
        status: "failed",
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sepay_response: { error: error instanceof Error ? error.message : "sepay_create_failed" },
      })
      .eq("id", createdOrder.id);

    return jsonError("sepay_create_failed", 502, "Không tạo được thanh toán SePay.");
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({
      sepay_invoice_number: checkout.invoiceNumber,
      sepay_checkout_action: checkout.checkoutAction,
      sepay_status: "PENDING",
      sepay_response: {
        checkoutAction: checkout.checkoutAction,
        checkoutFields: checkout.checkoutFields,
      },
      expires_at: new Date((Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRES_IN_SECONDS) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", createdOrder.id);

  if (updateError) {
    console.error("Order SePay update failed:", updateError);
    return jsonError("order_payment_update_failed", 500, "Không lưu được thông tin thanh toán.");
  }

  return NextResponse.json({
    checkoutAction: checkout.checkoutAction,
    checkoutFields: checkout.checkoutFields,
    orderNumber: createdOrder.order_number,
    invoiceNumber: checkout.invoiceNumber,
  });
}
