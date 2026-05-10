"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import Favorite from "@mui/icons-material/Favorite";
import BoltOutlined from "@mui/icons-material/BoltOutlined";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import { Product } from "@/types";
import { formatPrice } from "@/lib/data";

interface ProductCardProps {
  product: Product;
  showFlashSale?: boolean;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) =>
        s <= Math.round(rating)
          ? <Star      key={s} style={{ fontSize: 12 }} className="text-yellow-400" />
          : <StarBorder key={s} style={{ fontSize: 12 }} className="text-gray-300"   />
      )}
    </div>
  );
}

export default function ProductCard({ product, showFlashSale = false }: ProductCardProps) {
  const [added,      setAdded]      = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (added) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    setWishlisted((prev) => !prev);
  };

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100
      shadow-sm hover:shadow-xl hover:shadow-blue-100/60
      transition-all duration-300 ease-out hover:-translate-y-2 flex flex-col cursor-pointer">

      {/* ── Image ── */}
      <Link href={`/san-pham/${product.slug}`} className="relative block bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
        <div className="relative aspect-square">
          <Image src={product.thumbnail} alt={product.name} fill
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/0 group-hover:via-white/15 transition-all duration-500 pointer-events-none" />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="badge-shimmer text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-md">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-400 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm float-anim">
              MỚI
            </span>
          )}
          {showFlashSale && product.isFlashSale && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5">
              <BoltOutlined style={{ fontSize: 11 }} />FLASH
            </span>
          )}
        </div>

        {/* Wishlist btn */}
        <button onClick={handleWish}
          className={`absolute top-2 right-2 w-8 h-8 backdrop-blur-sm rounded-xl flex items-center justify-center
            shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90 icon-pop
            ${wishlisted ? "bg-red-500 text-white" : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
          aria-label="Yêu thích">
          {wishlisted
            ? <Favorite              style={{ fontSize: 14 }} />
            : <FavoriteBorderOutlined style={{ fontSize: 14 }} />
          }
        </button>
      </Link>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-3">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[11px] font-black text-blue-600 uppercase tracking-wide">{product.brand}</span>
          <VerifiedOutlined style={{ fontSize: 11 }} className="text-blue-400" />
        </div>

        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-blue-600 transition-colors duration-200 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={product.rating} />
          <span className="text-[11px] text-gray-400">({product.reviewCount.toLocaleString("vi-VN")})</span>
        </div>

        <div className="mb-2">
          <p className="text-lg font-black text-red-600 leading-tight group-hover:text-red-500 transition-colors">
            {formatPrice(product.price)}
          </p>
          {product.originalPrice > product.price && (
            <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3 min-h-[1.2rem]">
          {product.installmentAvailable && (
            <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded-md">Trả góp 0%</span>
          )}
          <span className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <LocalShippingOutlined style={{ fontSize: 11 }} />Giao nhanh
          </span>
        </div>

        <button onClick={handleAdd}
          className={`mt-auto w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl
            text-sm transition-all duration-300 active:scale-95 shine-hover
            ${added
              ? "bg-green-500 text-white shadow-green-200 shadow-md scale-[1.02]"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 glow-btn"
            }`}
          aria-label={`Thêm ${product.name} vào giỏ hàng`}>
          {added ? (
            <><CheckCircle style={{ fontSize: 15 }} className="animate-bounce" /><span>Đã thêm!</span></>
          ) : (
            <><ShoppingCartOutlined style={{ fontSize: 15 }} className="icon-bounce" /><span>Thêm vào giỏ</span></>
          )}
        </button>
      </div>
    </article>
  );
}
