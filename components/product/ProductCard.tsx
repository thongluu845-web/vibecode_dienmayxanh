import Link from "next/link";
import Image from "next/image";
import { FiShoppingCart, FiHeart, FiZap } from "react-icons/fi";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { MdVerified, MdLocalShipping } from "react-icons/md";
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
          ? <AiFillStar key={s} size={13} className="text-yellow-400" />
          : <AiOutlineStar key={s} size={13} className="text-gray-300" />
      )}
    </div>
  );
}

export default function ProductCard({ product, showFlashSale = false }: ProductCardProps) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col">

      {/* Image wrapper */}
      <Link href={`/san-pham/${product.slug}`} className="relative block bg-gray-50 overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              MỚI
            </span>
          )}
          {showFlashSale && product.isFlashSale && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5">
              <FiZap size={10} />FLASH
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-red-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:text-red-500"
          aria-label="Yêu thích"
        >
          <FiHeart size={15} />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3">
        {/* Brand */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">{product.brand}</span>
          <MdVerified size={12} className="text-blue-400" />
        </div>

        {/* Name */}
        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-blue-600 transition-colors mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <Stars rating={product.rating} />
          <span className="text-xs text-gray-400">({product.reviewCount.toLocaleString("vi-VN")})</span>
        </div>

        {/* Price */}
        <div className="mb-2">
          <p className="text-lg font-black text-red-600 leading-tight">
            {formatPrice(product.price)}
          </p>
          {product.originalPrice > product.price && (
            <p className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3 min-h-[1.25rem]">
          {product.installmentAvailable && (
            <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded-md">
              Trả góp 0%
            </span>
          )}
          <span className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <MdLocalShipping size={11} />
            Giao nhanh
          </span>
        </div>

        {/* CTA */}
        <button className="mt-auto w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200">
          <FiShoppingCart size={15} />
          <span>Thêm vào giỏ</span>
        </button>
      </div>
    </article>
  );
}
