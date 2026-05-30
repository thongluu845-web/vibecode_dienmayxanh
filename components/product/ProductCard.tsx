"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, Heart, Loader2, ShoppingCart, Star, Truck, Zap } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/data";
import { addToCart } from "@/lib/cart";
import { getBrandSlug } from "@/lib/brand-assets";
import ApplianceBrandLogo from "@/components/brand/ApplianceBrandLogo";

interface ProductCardProps {
  product: Product;
  showFlashSale?: boolean;
  priority?: boolean;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} sao`}>
      {[1, 2, 3, 4, 5].map((s) =>
        s <= Math.round(rating) ? (
          <Star key={s} size={12} className="fill-cyan-400 text-cyan-400" />
        ) : (
          <Star key={s} size={12} className="text-gray-300" />
        )
      )}
    </div>
  );
}

export default function ProductCard({ product, showFlashSale = false, priority = false }: ProductCardProps) {
  const [cartState, setCartState] = useState<"idle" | "loading" | "added" | "error">("idle");
  const [wishlisted, setWishlisted] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartState === "loading" || product.stock <= 0) return;

    setCartState("loading");
    const result = await addToCart(product);

    setCartState(result.ok ? "added" : "error");
    window.setTimeout(() => setCartState("idle"), result.ok ? 1800 : 2400);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    setWishlisted((prev) => !prev);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70">
      <Link href={`/san-pham/${product.slug}`} className="relative block overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="relative aspect-square">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
            className="object-contain p-3 transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/90 to-transparent" />
        </div>

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="rounded-lg bg-sky-600 px-2 py-0.5 text-[11px] font-black text-white shadow-sm">-{product.discount}%</span>
          )}
          {product.isNew && <span className="rounded-lg bg-emerald-500 px-2 py-0.5 text-[11px] font-black text-white shadow-sm">Mới</span>}
          {showFlashSale && product.isFlashSale && (
            <span className="flex items-center gap-0.5 rounded-lg bg-cyan-100 px-2 py-0.5 text-[11px] font-black text-cyan-800 shadow-sm">
              <Zap size={11} />
              Flash
            </span>
          )}
        </div>

        <button
          onClick={handleWish}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm transition hover:scale-105 active:scale-95 ${
            wishlisted ? "bg-sky-600 text-white" : "bg-white/92 text-gray-400 hover:bg-sky-50 hover:text-sky-600"
          }`}
          aria-label="Yêu thích"
        >
          <Heart size={15} className={wishlisted ? "fill-current" : undefined} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/san-pham?brand=${getBrandSlug(product.brand)}`}
          aria-label={`Xem sản phẩm thương hiệu ${product.brand}`}
          className="mb-2 inline-flex h-7 max-w-full items-center gap-1.5 self-start rounded-lg border border-sky-100 bg-sky-50/80 px-2 transition hover:border-sky-200 hover:bg-white"
        >
          <ApplianceBrandLogo brand={product.brand} imageClassName="max-h-3.5 max-w-[4.8rem]" sizes="80px" />
          <BadgeCheck size={12} className="shrink-0 text-blue-400" />
        </Link>

        <Link href={`/san-pham/${product.slug}`} className="min-h-[2.65rem]">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition group-hover:text-blue-700">{product.name}</h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-[11px] font-medium text-gray-400">({product.reviewCount.toLocaleString("vi-VN")})</span>
        </div>

        <div className="mt-2">
          <p className="text-lg font-black leading-tight text-sky-700">{formatPrice(product.price)}</p>
          {product.originalPrice > product.price && <p className="text-xs font-medium text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>}
        </div>

        <div className="mt-2 flex min-h-[1.45rem] flex-wrap gap-1">
          <span className="flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
            <Truck size={11} />
            Giao lắp
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={cartState === "loading" || product.stock <= 0}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition active:scale-95 ${
            cartState === "added"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
              : cartState === "error"
                ? "bg-red-500 text-white shadow-md shadow-red-100"
                : "bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          }`}
          aria-label={`Thêm ${product.name} vào giỏ hàng`}
        >
          {product.stock <= 0 ? (
            <>
              <ShoppingCart size={15} />
              <span>Hết hàng</span>
            </>
          ) : cartState === "loading" ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Đang thêm</span>
            </>
          ) : cartState === "added" ? (
            <>
              <CheckCircle2 size={15} />
              <span>Đã thêm</span>
            </>
          ) : cartState === "error" ? (
            <>
              <ShoppingCart size={15} />
              <span>Thử lại</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} />
              <span>Thêm vào giỏ</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
