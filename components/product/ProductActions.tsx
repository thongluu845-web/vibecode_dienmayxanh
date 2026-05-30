"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Heart, Loader2, Share2, ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart";
import type { Product } from "@/types";

type CartState = "idle" | "loading" | "added" | "error";

export default function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const [cartState, setCartState] = useState<CartState>("idle");
  const [wishlisted, setWishlisted] = useState(false);
  const [shared, setShared] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleAdd = async (goToCart = false) => {
    if (cartState === "loading" || isOutOfStock) return;

    setCartState("loading");
    const result = await addToCart(product);

    if (result.ok) {
      setCartState("added");
      if (goToCart) {
        router.push("/gio-hang");
        return;
      }
    } else {
      setCartState("error");
    }

    window.setTimeout(() => setCartState("idle"), result.ok ? 1800 : 2400);
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }

      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    } catch {
      setShared(false);
    }
  };

  const primaryLabel = isOutOfStock
    ? "Hết hàng"
    : cartState === "loading"
      ? "Đang thêm"
      : "Mua ngay";
  const secondaryLabel =
    cartState === "added"
      ? "Đã thêm"
      : cartState === "error"
        ? "Thử lại"
        : cartState === "loading"
          ? "Đang thêm"
          : "Thêm giỏ";

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void handleAdd(true)}
        disabled={cartState === "loading" || isOutOfStock}
        className="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3.5 text-base font-bold text-white shadow-md shadow-sky-200 transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cartState === "loading" ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />}
        {primaryLabel}
      </button>

      <button
        type="button"
        onClick={() => void handleAdd(false)}
        disabled={cartState === "loading" || isOutOfStock}
        className={`flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3.5 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          cartState === "added"
            ? "border-emerald-500 bg-emerald-500 text-white"
            : cartState === "error"
              ? "border-red-500 bg-red-500 text-white"
              : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
        }`}
      >
        {cartState === "loading" ? (
          <Loader2 size={20} className="animate-spin" />
        ) : cartState === "added" ? (
          <CheckCircle2 size={20} />
        ) : (
          <ShoppingCart size={20} />
        )}
        {secondaryLabel}
      </button>

      <button
        type="button"
        onClick={() => setWishlisted((value) => !value)}
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 transition-colors icon-pop ${
          wishlisted
            ? "border-sky-600 bg-sky-600 text-white"
            : "border-gray-200 text-gray-400 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
        }`}
        aria-label="Yêu thích"
      >
        <Heart size={20} className={wishlisted ? "fill-current" : undefined} />
      </button>

      <button
        type="button"
        onClick={() => void handleShare()}
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-gray-200 text-gray-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
        aria-label={shared ? "Đã sao chép liên kết" : "Chia sẻ"}
        title={shared ? "Đã sao chép liên kết" : "Chia sẻ"}
      >
        <Share2 size={20} />
      </button>
    </div>
  );
}
