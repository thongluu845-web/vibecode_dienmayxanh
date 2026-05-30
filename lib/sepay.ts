import "server-only";

import { timingSafeEqual } from "crypto";
import { SePayPgClient, type OnetimePaymentCheckoutFields } from "sepay-pg-node";

export type SePayEnvironment = "sandbox" | "production";
export type SePayPaymentMethod = "BANK_TRANSFER" | "NAPAS_BANK_TRANSFER";

export type SePayCheckoutPayload = {
  checkoutAction: string;
  checkoutFields: Record<string, string>;
  invoiceNumber: string;
};

export type SePayOrderDetail = {
  data?: {
    order_id?: string | null;
    order_invoice_number?: string | null;
    order_status?: string | null;
    order_amount?: string | number | null;
    order_currency?: string | null;
    transactions?: unknown[];
  };
};

type SePayEnv = {
  environment: SePayEnvironment;
  merchantId: string | undefined;
  secretKey: string | undefined;
  ipnSecretKey: string | undefined;
  paymentMethod: SePayPaymentMethod;
};

type ResolvedSePayEnv = {
  environment: SePayEnvironment;
  merchantId: string;
  secretKey: string;
  ipnSecretKey: string;
  paymentMethod: SePayPaymentMethod;
};

const SEPAY_API_VERSION = "v1";
const SEPAY_CHECKOUT_VERSION = "v1";
const SEPAY_PAYMENT_METHODS = new Set<SePayPaymentMethod>(["BANK_TRANSFER", "NAPAS_BANK_TRANSFER"]);

function getSePayEnvironment(): SePayEnvironment {
  return process.env.SEPAY_ENV?.trim() === "production" ? "production" : "sandbox";
}

function getSePayPaymentMethod(): SePayPaymentMethod {
  const value = process.env.SEPAY_PAYMENT_METHOD?.trim() as SePayPaymentMethod | undefined;

  return value && SEPAY_PAYMENT_METHODS.has(value) ? value : "BANK_TRANSFER";
}

function getSePayEnv(): SePayEnv {
  const secretKey = process.env.SEPAY_SECRET_KEY?.trim();

  return {
    environment: getSePayEnvironment(),
    merchantId: process.env.SEPAY_MERCHANT_ID?.trim(),
    secretKey,
    ipnSecretKey: process.env.SEPAY_IPN_SECRET_KEY?.trim() || secretKey,
    paymentMethod: getSePayPaymentMethod(),
  };
}

export function hasSePayConfig(): boolean {
  const { merchantId, secretKey } = getSePayEnv();

  return Boolean(merchantId && secretKey);
}

function getSePayEnvOrThrow(): ResolvedSePayEnv {
  const env = getSePayEnv();
  const missing: string[] = [];

  if (!env.merchantId) missing.push("SEPAY_MERCHANT_ID");
  if (!env.secretKey) missing.push("SEPAY_SECRET_KEY");
  if (!env.ipnSecretKey) missing.push("SEPAY_IPN_SECRET_KEY");

  if (missing.length > 0 || !env.merchantId || !env.secretKey || !env.ipnSecretKey) {
    throw new Error(`Missing SePay environment variables: ${missing.join(", ")}`);
  }

  return {
    environment: env.environment,
    merchantId: env.merchantId,
    secretKey: env.secretKey,
    ipnSecretKey: env.ipnSecretKey,
    paymentMethod: env.paymentMethod,
  };
}

export function createSePayClient() {
  const { environment, merchantId, secretKey } = getSePayEnvOrThrow();

  return new SePayPgClient({
    env: environment,
    merchant_id: merchantId,
    secret_key: secretKey,
    api_version: SEPAY_API_VERSION,
    checkout_version: SEPAY_CHECKOUT_VERSION,
  });
}

export function createSePayInvoiceNumber(orderReference: number | string): string {
  if (typeof orderReference === "number") {
    return `DMX${String(orderReference).padStart(8, "0")}`;
  }

  return orderReference.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50);
}

export function createSePayOrderDescription(invoiceNumber: string): string {
  return `Thanh toan don hang ${invoiceNumber}`;
}

export function createSePayCheckoutPayload({
  invoiceNumber,
  amount,
  customerId,
  successUrl,
  errorUrl,
  cancelUrl,
}: {
  invoiceNumber: string;
  amount: number;
  customerId?: string | null;
  successUrl: string;
  errorUrl: string;
  cancelUrl: string;
}): SePayCheckoutPayload {
  const { merchantId, paymentMethod } = getSePayEnvOrThrow();
  const client = createSePayClient();

  const fields: OnetimePaymentCheckoutFields = {
    order_amount: amount,
    merchant: merchantId,
    currency: "VND",
    operation: "PURCHASE",
    order_description: createSePayOrderDescription(invoiceNumber),
    order_invoice_number: invoiceNumber,
    customer_id: customerId ?? undefined,
    payment_method: paymentMethod,
    success_url: successUrl,
    error_url: errorUrl,
    cancel_url: cancelUrl,
  };

  const checkoutFields = client.checkout.initOneTimePaymentFields(fields);

  return {
    checkoutAction: client.checkout.initCheckoutUrl(),
    checkoutFields: Object.fromEntries(
      Object.entries(checkoutFields)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)]),
    ),
    invoiceNumber,
  };
}

function getSePayApiBaseUrl(): string {
  return getSePayEnvironment() === "production"
    ? `https://pgapi.sepay.vn/${SEPAY_API_VERSION}`
    : `https://pgapi-sandbox.sepay.vn/${SEPAY_API_VERSION}`;
}

export async function fetchSePayOrderDetail(invoiceNumber: string): Promise<SePayOrderDetail> {
  const { merchantId, secretKey } = getSePayEnvOrThrow();
  const response = await fetch(`${getSePayApiBaseUrl()}/order/detail/${encodeURIComponent(invoiceNumber)}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${merchantId}:${secretKey}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`SePay order detail failed with status ${response.status}`);
  }

  return (await response.json()) as SePayOrderDetail;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAuthorizedSePayIpn(headers: Headers): boolean {
  const { ipnSecretKey } = getSePayEnvOrThrow();
  const xSecretKey = headers.get("x-secret-key")?.trim();
  const authorization = headers.get("authorization")?.trim();

  if (xSecretKey && safeEqual(xSecretKey, ipnSecretKey)) {
    return true;
  }

  if (authorization && safeEqual(authorization, `Apikey ${ipnSecretKey}`)) {
    return true;
  }

  return false;
}
