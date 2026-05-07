"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { HiLightningBolt } from "react-icons/hi";
import { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface FlashSaleProps {
  products: Product[];
}

function useCountdown(targetDate: string) {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return {
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };
  const [t, setT] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000); // eslint-disable-line react-hooks/exhaustive-deps
    return () => clearInterval(id);
  }, [targetDate]); // eslint-disable-line react-hooks/exhaustive-deps
  return t;
}

function Digit({ value }: { value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 text-white font-black text-base sm:text-xl w-9 sm:w-11 h-9 sm:h-11 rounded-lg flex items-center justify-center tabular-nums shadow-inner">
        {String(value).padStart(2, "0")}
      </div>
    </div>
  );
}

function Colon() {
  return <span className="text-white font-black text-lg pb-1">:</span>;
}

export default function FlashSale({ products }: FlashSaleProps) {
  const flashProducts = products.filter((p) => p.isFlashSale && p.flashSaleEnd);
  const end = flashProducts[0]?.flashSaleEnd ?? "";
  const t = useCountdown(end);
  if (!flashProducts.length) return null;

  return (
    <section className="rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-4 sm:px-6 py-3.5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Title */}
          <div className="flex items-center gap-2">
            <HiLightningBolt size={22} className="text-yellow-300" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">FLASH SALE</h2>
          </div>
          {/* Countdown */}
          <div className="flex items-center gap-1.5 bg-black/20 rounded-xl px-3 py-1.5">
            <Digit value={t.h} />
            <Colon />
            <Digit value={t.m} />
            <Colon />
            <Digit value={t.s} />
          </div>
        </div>

        <Link
          href="/san-pham?filter=flash-sale"
          className="flex items-center gap-1.5 bg-white text-red-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
        >
          Xem tất cả <FiChevronRight size={15} />
        </Link>
      </div>

      {/* Products — horizontal scroll on mobile */}
      <div className="bg-gradient-to-b from-red-50 to-orange-50 p-3 sm:p-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:overflow-visible">
          {flashProducts.slice(0, 5).map((product) => (
            <div key={product.id} className="flex-shrink-0 w-44 sm:w-auto">
              <ProductCard product={product} showFlashSale />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
