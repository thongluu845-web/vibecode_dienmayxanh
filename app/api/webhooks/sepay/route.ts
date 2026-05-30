import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedSePayIpn, hasSePayConfig } from "@/lib/sepay";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";

type SePayIpnPayload = {
  timestamp?: number;
  notification_type?: string;
  order?: {
    id?: string | null;
    order_id?: string | null;
    order_status?: string | null;
    order_currency?: string | null;
    order_amount?: string | number | null;
    order_invoice_number?: string | null;
    order_description?: string | null;
    custom_data?: unknown;
  };
  transaction?: {
    id?: string | null;
    payment_method?: string | null;
    transaction_id?: string | null;
    transaction_type?: string | null;
    transaction_date?: string | null;
    transaction_status?: string | null;
    transaction_amount?: string | number | null;
    transaction_currency?: string | null;
  };
  customer?: {
    id?: string | null;
    customer_id?: string | null;
  };
};

type OrderPaymentRow = {
  id: string;
  user_id: string | null;
  status: string;
  payment_status: string | null;
  total_amount: number;
  sepay_invoice_number: string | null;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonOk(body: Record<string, unknown> = { success: true }) {
  return NextResponse.json(body);
}

function jsonError(code: string, status: number) {
  return NextResponse.json({ success: false, code, error: code }, { status });
}

async function readWebhook(request: NextRequest): Promise<SePayIpnPayload | null> {
  try {
    const body = await request.json();

    return body && typeof body === "object" ? (body as SePayIpnPayload) : null;
  } catch {
    return null;
  }
}

function parseAmount(value: string | number | null | undefined): number | null {
  const amount = typeof value === "number" ? value : Number(value);

  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount) : null;
}

function getEventKey(payload: SePayIpnPayload): string {
  return [
    payload.order?.order_invoice_number || "no-invoice",
    payload.transaction?.transaction_id || payload.transaction?.id || "no-transaction",
    payload.notification_type || "no-type",
    payload.timestamp || "no-timestamp",
  ].join(":");
}

function getEventType(payload: SePayIpnPayload): "paid" | "cancelled" | "ignored" {
  if (
    payload.notification_type === "ORDER_PAID" ||
    payload.order?.order_status === "CAPTURED" ||
    payload.transaction?.transaction_status === "APPROVED"
  ) {
    return "paid";
  }

  if (payload.notification_type === "TRANSACTION_VOID" || payload.order?.order_status === "CANCELLED") {
    return "cancelled";
  }

  return "ignored";
}

async function savePaymentEvent({
  orderId,
  eventType,
  eventKey,
  payload,
}: {
  orderId: string;
  eventType: string;
  eventKey: string;
  payload: SePayIpnPayload;
}) {
  const { error } = await createAdminClient().from("payment_events").upsert(
    {
      order_id: orderId,
      provider: "sepay",
      event_type: eventType,
      event_key: eventKey,
      raw_payload: payload,
      verified_data: {
        notification_type: payload.notification_type,
        order: payload.order,
        transaction: payload.transaction,
        customer: payload.customer,
      },
    },
    { onConflict: "provider,event_key", ignoreDuplicates: true },
  );

  if (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseAdminConfig()) {
    return jsonError("missing_supabase_admin_env", 503);
  }

  if (!hasSePayConfig()) {
    return jsonError("missing_sepay_env", 503);
  }

  if (!isAuthorizedSePayIpn(request.headers)) {
    return jsonError("invalid_sepay_secret", 401);
  }

  const payload = await readWebhook(request);

  if (!payload) {
    return jsonError("invalid_payload", 400);
  }

  const invoiceNumber = payload.order?.order_invoice_number?.trim();

  if (!invoiceNumber) {
    return jsonError("missing_invoice_number", 400);
  }

  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id,user_id,status,payment_status,total_amount,sepay_invoice_number")
    .eq("sepay_invoice_number", invoiceNumber)
    .maybeSingle();

  if (orderError) {
    console.error("SePay webhook order lookup failed:", orderError);
    return jsonError("order_lookup_failed", 500);
  }

  if (!order) {
    console.warn("SePay webhook ignored because order was not found:", invoiceNumber);
    return jsonOk({ success: true, ignored: true });
  }

  const currentOrder = order as OrderPaymentRow;
  const eventType = getEventType(payload);
  const eventKey = getEventKey(payload);

  try {
    await savePaymentEvent({
      orderId: currentOrder.id,
      eventType,
      eventKey,
      payload,
    });
  } catch (eventError) {
    console.error("SePay webhook event save failed:", eventError);
    return jsonError("event_save_failed", 500);
  }

  const receivedAmount = parseAmount(payload.order?.order_amount ?? payload.transaction?.transaction_amount);

  if (receivedAmount !== null && receivedAmount !== currentOrder.total_amount) {
    console.error("SePay webhook amount mismatch:", {
      invoiceNumber,
      expected: currentOrder.total_amount,
      received: receivedAmount,
    });
    return jsonError("amount_mismatch", 400);
  }

  if (currentOrder.payment_status === "paid" && eventType === "paid") {
    return jsonOk({ success: true, duplicate: true });
  }

  const now = new Date().toISOString();

  if (eventType === "paid") {
    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
        paid_at: now,
        sepay_order_id: payload.order?.order_id ?? payload.order?.id ?? null,
        sepay_status: payload.order?.order_status ?? payload.transaction?.transaction_status ?? "CAPTURED",
        sepay_response: payload,
        updated_at: now,
      })
      .eq("id", currentOrder.id);

    if (updateError) {
      console.error("SePay webhook paid update failed:", updateError);
      return jsonError("order_update_failed", 500);
    }

    if (currentOrder.user_id) {
      const { error: clearError } = await admin
        .from("cart_items")
        .delete()
        .eq("user_id", currentOrder.user_id);

      if (clearError) {
        console.error("SePay webhook cart clear failed:", clearError);
      }
    }

    return jsonOk();
  }

  if (eventType === "cancelled") {
    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "cancelled",
        payment_status: "unpaid",
        cancelled_at: now,
        sepay_order_id: payload.order?.order_id ?? payload.order?.id ?? null,
        sepay_status: payload.order?.order_status ?? payload.transaction?.transaction_status ?? "CANCELLED",
        sepay_response: payload,
        updated_at: now,
      })
      .eq("id", currentOrder.id);

    if (updateError) {
      console.error("SePay webhook cancelled update failed:", updateError);
      return jsonError("order_update_failed", 500);
    }
  }

  return jsonOk({ success: true, ignored: eventType === "ignored" });
}
