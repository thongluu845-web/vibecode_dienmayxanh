import "server-only";

import { fetchSePayOrderDetail, hasSePayConfig } from "@/lib/sepay";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";

export type OrderStatus = "pending_payment" | "paid" | "cancelled" | "failed" | "expired";

export type PaymentReturnSummary = {
  orderNumber: string | null;
  invoiceNumber: string | null;
  status: OrderStatus | "unknown";
  providerStatus: string | null;
  totalAmount: number | null;
  customerName: string | null;
  canClearCart: boolean;
  message: string;
};

type OrderReturnRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string | null;
  sepay_invoice_number: string | null;
  sepay_status: string | null;
  total_amount: number;
  customer_name: string;
};

const SEPAY_STATUS_TO_ORDER_STATUS: Record<string, OrderStatus> = {
  AUTHENTICATION_NOT_NEEDED: "pending_payment",
  PENDING: "pending_payment",
  PROCESSING: "pending_payment",
  CAPTURED: "paid",
  APPROVED: "paid",
  CANCELLED: "cancelled",
  CANCELED: "cancelled",
  EXPIRED: "expired",
  FAILED: "failed",
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];

  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function getReturnMessage(status: PaymentReturnSummary["status"]): string {
  if (status === "paid") return "Đơn hàng đã được xác nhận thanh toán.";
  if (status === "cancelled") return "Đơn thanh toán đã bị hủy.";
  if (status === "expired") return "Phiên thanh toán đã hết hạn.";
  if (status === "failed") return "Thanh toán chưa thành công.";
  if (status === "pending_payment") return "Hệ thống đang chờ IPN SePay xác nhận thanh toán.";

  return "Không tìm thấy thông tin đơn hàng phù hợp.";
}

function getOrderStatus(order: Pick<OrderReturnRow, "status" | "payment_status" | "sepay_status">): OrderStatus {
  if (order.payment_status === "paid") return "paid";
  if (order.status === "cancelled") return "cancelled";

  if (order.sepay_status) {
    return SEPAY_STATUS_TO_ORDER_STATUS[order.sepay_status] ?? "pending_payment";
  }

  return "pending_payment";
}

async function updateOrderFromProvider(order: OrderReturnRow, providerStatus: string, rawPayload: unknown) {
  const nextStatus = SEPAY_STATUS_TO_ORDER_STATUS[providerStatus] ?? getOrderStatus(order);

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    sepay_status: providerStatus,
    sepay_response: rawPayload,
    updated_at: now,
  };

  if (nextStatus === "paid") {
    patch.status = "confirmed";
    patch.payment_status = "paid";
    patch.paid_at = now;
  }

  if (nextStatus === "cancelled") {
    patch.status = "cancelled";
    patch.payment_status = "unpaid";
    patch.cancelled_at = now;
  }

  if (nextStatus === "failed") {
    patch.payment_status = "unpaid";
    patch.failed_at = now;
  }

  const { error } = await createAdminClient().from("orders").update(patch).eq("id", order.id);

  if (error) {
    console.error("Order return status update failed:", error);
    return getOrderStatus(order);
  }

  return nextStatus;
}

export async function getPaymentReturnSummary(
  params: Record<string, string | string[] | undefined>,
): Promise<PaymentReturnSummary> {
  const orderNumber = getParam(params, "orderNumber");
  const invoiceNumber = getParam(params, "invoice");

  if ((!orderNumber && !invoiceNumber) || !hasSupabaseAdminConfig()) {
    return {
      orderNumber,
      invoiceNumber,
      status: "unknown",
      providerStatus: getParam(params, "status"),
      totalAmount: null,
      customerName: null,
      canClearCart: false,
      message: getReturnMessage("unknown"),
    };
  }

  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select("id,order_number,status,payment_status,sepay_invoice_number,sepay_status,total_amount,customer_name")
    .limit(1);

  if (invoiceNumber) {
    query = query.eq("sepay_invoice_number", invoiceNumber);
  } else if (orderNumber) {
    query = query.eq("order_number", orderNumber);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    if (error) console.error("Order return lookup failed:", error);

    return {
      orderNumber,
      invoiceNumber,
      status: "unknown",
      providerStatus: getParam(params, "status"),
      totalAmount: null,
      customerName: null,
      canClearCart: false,
      message: getReturnMessage("unknown"),
    };
  }

  const order = data as OrderReturnRow;
  let status = getOrderStatus(order);
  let providerStatus = order.sepay_status ?? getParam(params, "status");

  if (hasSePayConfig() && status !== "paid" && order.sepay_invoice_number) {
    try {
      const orderDetail = await fetchSePayOrderDetail(order.sepay_invoice_number);
      const nextProviderStatus = orderDetail.data?.order_status;

      if (nextProviderStatus) {
        providerStatus = nextProviderStatus;
        status = await updateOrderFromProvider(order, nextProviderStatus, orderDetail);
      }
    } catch (syncError) {
      console.error("SePay return sync failed:", syncError);
    }
  }

  return {
    orderNumber: order.order_number,
    invoiceNumber: order.sepay_invoice_number,
    status,
    providerStatus,
    totalAmount: Number(order.total_amount),
    customerName: order.customer_name,
    canClearCart: status === "paid",
    message: getReturnMessage(status),
  };
}
