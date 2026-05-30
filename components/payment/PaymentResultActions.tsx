"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ShoppingCart } from "lucide-react";
import { CART_CHANGED_EVENT, CART_STORAGE_KEY, createCartSnapshot } from "@/lib/cart";

export default function PaymentResultActions({ canClearCart }: { canClearCart: boolean }) {
  useEffect(() => {
    if (!canClearCart) return;

    window.localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(CART_CHANGED_EVENT, {
        detail: createCartSnapshot([], "local", false),
      }),
    );
  }, [canClearCart]);

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Link
        href="/san-pham"
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
      >
        <ArrowLeft size={18} />
        Tiếp tục mua sắm
      </Link>
      <Link
        href="/gio-hang"
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white px-5 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-50"
      >
        <ShoppingCart size={18} />
        Về giỏ hàng
      </Link>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
      >
        <RefreshCw size={17} />
        Cập nhật trạng thái
      </button>
    </div>
  );
}
