"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import {
  CART_CHANGED_EVENT,
  CART_STORAGE_KEY,
  createCartSnapshot,
  fetchCartSnapshot,
  removeFromCart,
  updateCartQuantity,
  type CartSnapshot,
} from "@/lib/cart";
import { formatPrice } from "@/lib/data";
import type { CartItem } from "@/types";

type CheckoutField = "name" | "phone" | "address";

type CheckoutForm = Record<CheckoutField, string>;

type CheckoutResponse = {
  checkoutAction?: string;
  checkoutFields?: Record<string, string | number>;
  error?: string;
  code?: string;
};

const initialCart = createCartSnapshot([], "local", false);
const initialCheckoutForm: CheckoutForm = {
  name: "",
  phone: "",
  address: "",
};

export default function CartView() {
  const [cart, setCart] = useState<CartSnapshot>(initialCart);
  const [loading, setLoading] = useState(true);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>(initialCheckoutForm);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const hasItems = cart.items.length > 0;
  const orderTotal = cart.subtotal;
  const summaryRows = useMemo(
    () => [
      { label: "Tạm tính", value: formatPrice(cart.subtotal), color: "" },
      { label: "Giao lắp", value: "Miễn phí", color: "text-green-600" },
      { label: "Giảm giá", value: `-${formatPrice(cart.savings)}`, color: "text-sky-600" },
    ],
    [cart.savings, cart.subtotal],
  );

  const refreshCart = async () => {
    setError(null);

    try {
      const snapshot = await fetchCartSnapshot();
      setCart(snapshot);
    } catch {
      setError("Không tải được giỏ hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCart();

    const onCartChanged = (event: Event) => {
      const snapshot = (event as CustomEvent<CartSnapshot>).detail;

      if (snapshot?.items) {
        setCart(snapshot);
        return;
      }

      void refreshCart();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        void refreshCart();
      }
    };

    window.addEventListener(CART_CHANGED_EVENT, onCartChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, onCartChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const updateCheckoutField = (field: CheckoutField, value: string) => {
    setCheckoutForm((current) => ({ ...current, [field]: value }));
    setCheckoutError(null);
  };

  const validateCheckoutForm = () => {
    const phoneDigits = checkoutForm.phone.replace(/[^\d]/g, "");

    if (checkoutForm.name.trim().length < 2) {
      return "Vui lòng nhập tên người nhận.";
    }

    if (phoneDigits.length < 9 || phoneDigits.length > 12) {
      return "Số điện thoại chưa hợp lệ.";
    }

    if (checkoutForm.address.trim().length < 8) {
      return "Vui lòng nhập địa chỉ giao/lắp chi tiết hơn.";
    }

    return null;
  };

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (checkoutPending || !hasItems) return;

    const formError = validateCheckoutForm();

    if (formError) {
      setCheckoutError(formError);
      return;
    }

    setCheckoutPending(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout/sepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: checkoutForm,
          items: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as CheckoutResponse;

      if (!response.ok || !body.checkoutAction || !body.checkoutFields) {
        setCheckoutError(body.error ?? "Không tạo được link thanh toán. Vui lòng thử lại.");
        return;
      }

      submitSePayCheckout(body.checkoutAction, body.checkoutFields);
    } catch {
      setCheckoutError("Không kết nối được cổng thanh toán. Vui lòng thử lại.");
    } finally {
      setCheckoutPending(false);
    }
  };

  const handleQuantityChange = async (item: CartItem, quantity: number) => {
    if (quantity < 1 || pendingProductId) return;

    setPendingProductId(item.product.id);
    setError(null);

    const result = await updateCartQuantity(item.product, quantity);
    setCart(result.snapshot);

    if (!result.ok) {
      setError("Không cập nhật được số lượng. Vui lòng thử lại.");
    }

    setPendingProductId(null);
  };

  const handleRemove = async (productId: string) => {
    if (pendingProductId) return;

    setPendingProductId(productId);
    setError(null);

    const result = await removeFromCart(productId);
    setCart(result.snapshot);

    if (!result.ok) {
      setError("Không xóa được sản phẩm. Vui lòng thử lại.");
    }

    setPendingProductId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-5 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-blue-600">
              Trang chủ
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-gray-800">Giỏ hàng</li>
        </ol>
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900">
          <ShoppingCart size={24} className="text-blue-600" />
          Giỏ hàng của bạn
          {cart.count > 0 && <span className="text-base font-semibold text-gray-400">({cart.count})</span>}
        </h1>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void refreshCart();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : undefined} />
          Cập nhật
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading && !hasItems ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="h-24 rounded-xl bg-slate-100 skeleton" />
            <div className="mt-3 h-24 rounded-xl bg-slate-100 skeleton" />
          </div>
          <div className="h-64 rounded-2xl bg-white p-5 shadow-sm skeleton" />
        </div>
      ) : !hasItems ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
              <ShoppingCart size={40} className="text-blue-300" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-700">Giỏ hàng trống</h2>
            <p className="mb-7 text-sm text-gray-400">
              Thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.
            </p>
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3 font-bold text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700"
            >
              <ArrowLeft size={18} />
              Tiếp tục mua sắm
            </Link>
          </div>

          <OrderSummary
            rows={summaryRows}
            total={0}
            disabled
            checkoutForm={checkoutForm}
            checkoutPending={checkoutPending}
            checkoutError={checkoutError}
            onFieldChange={updateCheckoutField}
            onCheckout={handleCheckout}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-3">
            {!cart.authenticated && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                Bạn có thể thanh toán ngay với tư cách khách.{" "}
                <Link href="/tai-khoan" className="underline underline-offset-2">
                  Đăng nhập
                </Link>{" "}
                nếu muốn đồng bộ giỏ hàng vào Supabase.
              </div>
            )}

            {cart.items.map((item) => {
              const isPending = pendingProductId === item.product.id;
              const maxQuantity = Math.max(1, Math.min(item.product.stock || 1, 99));

              return (
                <article
                  key={item.product.id}
                  className="grid gap-3 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:p-4"
                >
                  <Link
                    href={`/san-pham/${item.product.slug}`}
                    className="relative aspect-square overflow-hidden rounded-xl bg-sky-50"
                  >
                    <Image
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="min-w-0">
                    <div className="mb-1 text-xs font-black uppercase text-blue-600">
                      {item.product.brand}
                    </div>
                    <Link href={`/san-pham/${item.product.slug}`}>
                      <h2 className="line-clamp-2 text-base font-black leading-snug text-gray-900 hover:text-blue-700">
                        {item.product.name}
                      </h2>
                    </Link>
                    <p className="mt-1 text-xs font-semibold text-gray-400">
                      Còn {item.product.stock.toLocaleString("vi-VN")} sản phẩm
                    </p>
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <span className="text-lg font-black text-sky-700">
                        {formatPrice(item.product.price)}
                      </span>
                      {item.product.originalPrice > item.product.price && (
                        <span className="text-xs font-semibold text-gray-400 line-through">
                          {formatPrice(item.product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-center rounded-xl border border-sky-100 bg-sky-50/70 p-1">
                      <button
                        type="button"
                        onClick={() => void handleQuantityChange(item, item.quantity - 1)}
                        disabled={isPending || item.quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Giảm số lượng"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-gray-800">
                        {isPending ? <Loader2 size={15} className="mx-auto animate-spin" /> : item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleQuantityChange(item, item.quantity + 1)}
                        disabled={isPending || item.quantity >= maxQuantity}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Tăng số lượng"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleRemove(item.product.id)}
                        disabled={isPending}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-gray-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <OrderSummary
            rows={summaryRows}
            total={orderTotal}
            disabled={!hasItems || checkoutPending}
            checkoutForm={checkoutForm}
            checkoutPending={checkoutPending}
            checkoutError={checkoutError}
            onFieldChange={updateCheckoutField}
            onCheckout={handleCheckout}
          />
        </div>
      )}
    </div>
  );
}

function submitSePayCheckout(action: string, fields: Record<string, string | number>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

function OrderSummary({
  rows,
  total,
  disabled,
  checkoutForm,
  checkoutPending,
  checkoutError,
  onFieldChange,
  onCheckout,
}: {
  rows: { label: string; value: string; color: string }[];
  total: number;
  disabled: boolean;
  checkoutForm: CheckoutForm;
  checkoutPending: boolean;
  checkoutError: string | null;
  onFieldChange: (field: CheckoutField, value: string) => void;
  onCheckout: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <aside className="lg:w-80">
      <div className="sticky top-24 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-5 text-lg font-black text-gray-800">Tóm tắt đơn hàng</h3>
        <div className="mb-5 space-y-3 text-sm">
          {rows.map(({ label, value, color }) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-gray-500">{label}</span>
              <span className={`text-right font-semibold ${color}`}>{value}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
            <span className="font-black text-gray-800">Tổng cộng</span>
            <span className="text-right text-xl font-black text-sky-700">{formatPrice(total)}</span>
          </div>
        </div>

        <form className="space-y-3" onSubmit={onCheckout}>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-gray-500">Người nhận</span>
            <input
              value={checkoutForm.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              disabled={checkoutPending}
              className="h-11 w-full rounded-xl border border-sky-100 bg-sky-50/70 px-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-gray-500">Số điện thoại</span>
            <input
              value={checkoutForm.phone}
              onChange={(event) => onFieldChange("phone", event.target.value)}
              disabled={checkoutPending}
              className="h-11 w-full rounded-xl border border-sky-100 bg-sky-50/70 px-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="0901234567"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-gray-500">Địa chỉ giao/lắp</span>
            <textarea
              value={checkoutForm.address}
              onChange={(event) => onFieldChange("address", event.target.value)}
              disabled={checkoutPending}
              className="min-h-24 w-full resize-none rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2 text-sm font-semibold text-gray-800 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              autoComplete="street-address"
            />
          </label>

          {checkoutError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {checkoutError}
            </div>
          )}

          <button
            type="submit"
            disabled={disabled}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3.5 font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {checkoutPending ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
            Thanh toán qua SePay
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {[
            { Icon: ShieldCheck, text: "Thanh toán VietQR an toàn qua SePay" },
            { Icon: Truck, text: "Giao lắp nhanh 2-4 giờ" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
              <Icon size={15} className="flex-shrink-0 text-blue-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
